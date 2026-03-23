// services/blockchain.js
// Platform backend — calls CineChain smart contract as the owner wallet.
// All functions here are called AFTER the credit deduction is committed
// in the PostgreSQL database (row-level lock, then blockchain call).

import { ethers } from "ethers";
import { uploadMetadataToIPFS } from "./ipfs.js";

// ── ABI (minimal — only functions we call) ───────────────────────────────────

const ABI = [
  // Film management
  "function registerFilm(string metadataURI, uint256 rentalPrice, uint256 ownershipPrice, uint256 collectorPrice, address filmmaker, tuple(address wallet, uint256 shareBps)[] recipients) returns (uint128 filmId)",

  // Purchases
  "function purchaseOwnership(uint128 filmId, address buyer) returns (uint256 tokenId)",
  "function purchaseRental(uint128 filmId, address buyer) returns (uint256 tokenId)",
  "function purchaseCollector(uint128 filmId, address buyer) returns (uint256 tokenId)",

  // Resale
  "function resaleTransfer(uint256 tokenId, address seller, address buyer, uint256 salePriceUsdc)",

  // Read
  "function hasValidToken(uint256 tokenId, address account) view returns (bool)",
  "function getFilm(uint128 filmId) view returns (string, uint256, uint256, uint256, address, bool, uint256)",
  "function uri(uint256 tokenId) view returns (string)",

  // Events
  "event FilmRegistered(uint128 indexed filmId, string metadataURI, address filmmaker)",
  "event FilmPurchased(uint128 indexed filmId, uint8 tier, address indexed buyer, uint256 tokenId, uint256 usdcAmount)",
  "event ResaleExecuted(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 salePrice, uint256 royaltyAmount, uint256 platformFee, uint256 sellerProceeds)",
];

const USDC_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
];

// USDC has 6 decimals
const USDC_DECIMALS = 6n;
const toUsdc = (dollars) => BigInt(Math.round(dollars * 1_000_000));

// ── Provider & Signer setup ───────────────────────────────────────────────────

let _provider;
let _signer;
let _contract;
let _usdc;

export function initBlockchain() {
  _provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

  // Platform backend wallet — this is the onlyOwner wallet that calls the contract.
  // In production: load from KMS or Hashicorp Vault, NOT from env.
  _signer = new ethers.Wallet(process.env.PLATFORM_PRIVATE_KEY, _provider);

  _contract = new ethers.Contract(
    process.env.CINECHAIN_CONTRACT_ADDRESS,
    ABI,
    _signer
  );

  _usdc = new ethers.Contract(process.env.USDC_ADDRESS, USDC_ABI, _signer);

  console.log("[blockchain] Initialized");
  console.log("[blockchain] Contract:", process.env.CINECHAIN_CONTRACT_ADDRESS);
  console.log("[blockchain] Platform wallet:", _signer.address);
}

// ── USDC Allowance helpers ────────────────────────────────────────────────────

/**
 * Ensure the platform wallet has approved the contract to spend `amountUsdc`.
 * Called before any purchase or resale that routes USDC through the contract.
 */
async function ensureUsdcApproval(amountUsdc) {
  const current = await _usdc.allowance(
    _signer.address,
    process.env.CINECHAIN_CONTRACT_ADDRESS
  );
  if (current < amountUsdc) {
    // Approve a large amount to reduce repeated approvals (or use increaseAllowance)
    const tx = await _usdc.approve(
      process.env.CINECHAIN_CONTRACT_ADDRESS,
      ethers.MaxUint256
    );
    await tx.wait();
    console.log("[blockchain] USDC approved for contract");
  }
}

// ── Film Registration ─────────────────────────────────────────────────────────

/**
 * Register a film on-chain after the filmmaker submits it through the platform.
 *
 * @param {object} filmData
 * @param {string} filmData.title
 * @param {string} filmData.director
 * @param {string} filmData.synopsis
 * @param {string} filmData.posterIpfsCid   — CID of poster image on IPFS
 * @param {number} filmData.year
 * @param {number} filmData.rentalPriceUsd
 * @param {number} filmData.ownershipPriceUsd
 * @param {number} filmData.collectorPriceUsd
 * @param {string} filmData.filmmaker       — wallet address
 * @param {Array}  filmData.recipients      — [{wallet, shareBps}]
 * @returns {{ filmId, txHash, metadataUri }}
 */
export async function registerFilm(filmData) {
  // 1. Build and pin metadata JSON to IPFS
  const metadata = {
    name: filmData.title,
    description: filmData.synopsis,
    image: `ipfs://${filmData.posterIpfsCid}`,
    attributes: [
      { trait_type: "Director",   value: filmData.director },
      { trait_type: "Year",       value: String(filmData.year) },
      { trait_type: "Platform",   value: "CineChain" },
    ],
  };
  const metadataUri = await uploadMetadataToIPFS(metadata);
  console.log("[blockchain] Metadata pinned:", metadataUri);

  // 2. Call registerFilm on-chain
  const tx = await _contract.registerFilm(
    metadataUri,
    toUsdc(filmData.rentalPriceUsd),
    toUsdc(filmData.ownershipPriceUsd),
    toUsdc(filmData.collectorPriceUsd),
    filmData.filmmaker,
    filmData.recipients
  );

  const receipt = await tx.wait();

  // Parse filmId from event
  const event = receipt.logs
    .map((log) => {
      try { return _contract.interface.parseLog(log); } catch { return null; }
    })
    .find((e) => e?.name === "FilmRegistered");

  const filmId = event.args.filmId;
  console.log(`[blockchain] Film ${filmId} registered — tx: ${receipt.hash}`);

  return { filmId: Number(filmId), txHash: receipt.hash, metadataUri };
}

// ── Film Purchase ─────────────────────────────────────────────────────────────

/**
 * Execute a film purchase on-chain.
 * This is called AFTER credits have been deducted from the DB.
 *
 * @param {number} filmId
 * @param {string} tier         — "rental" | "ownership" | "collector"
 * @param {string} buyerWallet  — buyer's Ethereum address
 * @param {number} usdcAmount   — in dollars (e.g. 10.00)
 * @returns {{ tokenId, txHash, etherscanUrl }}
 */
export async function purchaseFilm(filmId, tier, buyerWallet, usdcAmount) {
  const usdcAmountWei = toUsdc(usdcAmount);
  await ensureUsdcApproval(usdcAmountWei);

  let tx;
  if (tier === "rental") {
    tx = await _contract.purchaseRental(filmId, buyerWallet);
  } else if (tier === "ownership") {
    tx = await _contract.purchaseOwnership(filmId, buyerWallet);
  } else if (tier === "collector") {
    tx = await _contract.purchaseCollector(filmId, buyerWallet);
  } else {
    throw new Error(`Unknown tier: ${tier}`);
  }

  const receipt = await tx.wait();

  // Parse tokenId from FilmPurchased event
  const event = receipt.logs
    .map((log) => {
      try { return _contract.interface.parseLog(log); } catch { return null; }
    })
    .find((e) => e?.name === "FilmPurchased");

  const tokenId = event.args.tokenId.toString();
  const network = process.env.NETWORK || "sepolia";
  const etherscanUrl = `https://${network}.etherscan.io/tx/${receipt.hash}`;

  console.log(`[blockchain] Purchase confirmed — film ${filmId}, tier ${tier}, token ${tokenId}`);
  console.log(`[blockchain] ${etherscanUrl}`);

  return { tokenId, txHash: receipt.hash, etherscanUrl };
}

// ── Resale ────────────────────────────────────────────────────────────────────

/**
 * Execute a secondary-market resale.
 * Atomically pays royalties, transfers USDC, and moves the NFT.
 *
 * @param {string} tokenId       — BigInt-compatible string
 * @param {string} sellerWallet
 * @param {string} buyerWallet
 * @param {number} salePriceUsd  — agreed price in dollars
 * @returns {{ txHash, royaltyPaid, platformFee, sellerProceeds }}
 */
export async function executeResale(tokenId, sellerWallet, buyerWallet, salePriceUsd) {
  const salePriceUsdc = toUsdc(salePriceUsd);
  await ensureUsdcApproval(salePriceUsdc);

  const tx = await _contract.resaleTransfer(
    BigInt(tokenId),
    sellerWallet,
    buyerWallet,
    salePriceUsdc
  );
  const receipt = await tx.wait();

  const event = receipt.logs
    .map((log) => {
      try { return _contract.interface.parseLog(log); } catch { return null; }
    })
    .find((e) => e?.name === "ResaleExecuted");

  const { royaltyAmount, platformFee, sellerProceeds } = event.args;

  return {
    txHash: receipt.hash,
    royaltyPaid:     Number(royaltyAmount) / 1_000_000,
    platformFee:     Number(platformFee)   / 1_000_000,
    sellerProceeds:  Number(sellerProceeds) / 1_000_000,
    etherscanUrl: `https://${process.env.NETWORK || "sepolia"}.etherscan.io/tx/${receipt.hash}`,
  };
}

// ── Access Check ──────────────────────────────────────────────────────────────

/**
 * Check if a user has a valid (non-expired) token for a film.
 * Used to gate the watch page. Called with every stream request.
 *
 * @param {string} tokenId
 * @param {string} walletAddress
 * @returns {boolean}
 */
export async function checkAccess(tokenId, walletAddress) {
  return _contract.hasValidToken(BigInt(tokenId), walletAddress);
}

// ── Common Pool Balance ───────────────────────────────────────────────────────

/**
 * Returns the platform wallet's USDC balance (the Common Pool).
 * Should always be >= sum of all outstanding CineCredit balances.
 */
export async function commonPoolBalance() {
  const bal = await _usdc.balanceOf(_signer.address);
  return Number(bal) / 1_000_000; // in USD
}
