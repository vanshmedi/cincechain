// scripts/deploy.js
// Deploys CineChain to Sepolia and verifies on Etherscan.
// Usage: npx hardhat run scripts/deploy.js --network sepolia

const { ethers, run } = require("hardhat");

// Sepolia USDC (Circle's official testnet USDC)
const SEPOLIA_USDC = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log(
    "Account balance:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    "ETH"
  );

  // ── Deploy ────────────────────────────────────────────────────────────────
  const CineChain = await ethers.getContractFactory("CineChain");
  const cinechain = await CineChain.deploy(
    SEPOLIA_USDC,
    deployer.address // owner = platform backend wallet
  );
  await cinechain.waitForDeployment();

  const address = await cinechain.getAddress();
  console.log("\n✅ CineChain deployed to:", address);
  console.log("   USDC:", SEPOLIA_USDC);
  console.log("   Owner:", deployer.address);
  console.log("   Network: Sepolia");
  console.log(`\n   Etherscan: https://sepolia.etherscan.io/address/${address}`);

  // ── Register a demo film ──────────────────────────────────────────────────
  console.log("\nRegistering demo film...");

  // Demo recipients matching the doc's revenue split example
  const recipients = [
    { wallet: "0x1111111111111111111111111111111111111111", shareBps: 6500 }, // Production Co 65%
    { wallet: "0x2222222222222222222222222222222222222222", shareBps: 1200 }, // Co-Producer A 12%
    { wallet: "0x3333333333333333333333333333333333333333", shareBps:  800 }, // Co-Producer B 8%
    { wallet: "0x4444444444444444444444444444444444444444", shareBps: 1000 }, // Talent Pool 10%
    { wallet: deployer.address,                                shareBps:  500 }, // Protocol Fee 5%
  ];

  // Prices in USDC (6 decimals): $1, $10, $25
  const tx = await cinechain.registerFilm(
    "ipfs://QmExampleCIDReplaceMeWithRealIPFSHash",
    1_000_000,   // $1.00 rental
    10_000_000,  // $10.00 ownership
    25_000_000,  // $25.00 collector
    "0x1111111111111111111111111111111111111111", // filmmaker
    recipients
  );
  const receipt = await tx.wait();
  console.log("✅ Demo film registered — tx:", receipt.hash);
  console.log("   Film ID: 0");

  // ── Verify on Etherscan ───────────────────────────────────────────────────
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("\nVerifying contract on Etherscan (waiting 30s for propagation)...");
    await new Promise((r) => setTimeout(r, 30_000));
    try {
      await run("verify:verify", {
        address,
        constructorArguments: [SEPOLIA_USDC, deployer.address],
      });
      console.log("✅ Verified on Etherscan");
    } catch (e) {
      console.log("⚠️  Verification failed:", e.message);
    }
  }

  // ── Print env vars for backend ────────────────────────────────────────────
  console.log("\n── Copy these into your .env ─────────────────────────────");
  console.log(`CINECHAIN_CONTRACT_ADDRESS=${address}`);
  console.log(`USDC_ADDRESS=${SEPOLIA_USDC}`);
  console.log(`NETWORK=sepolia`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
