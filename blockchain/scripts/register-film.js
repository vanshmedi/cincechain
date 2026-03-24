import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const signer = new ethers.Wallet(process.env.PLATFORM_PRIVATE_KEY, provider);

  const ABI = [
    "function registerFilm(string metadataURI, uint256 rentalPrice, uint256 ownershipPrice, uint256 collectorPrice, address filmmaker, tuple(address wallet, uint256 shareBps)[] recipients) returns (uint128)"
  ];

  const contract = new ethers.Contract(
    process.env.CINECHAIN_CONTRACT_ADDRESS,
    ABI,
    signer
  );

  console.log("Registering new film with $1 pricing...");

  const recipients = [
    { wallet: signer.address, shareBps: 7000 }, // filmmaker
    { wallet: signer.address, shareBps: 2500 }, // talent
    { wallet: signer.address, shareBps: 500 },  // platform
  ];

  const toUsdc = (usd) => usd * 1_000_000;

  const tx = await contract.registerFilm(
    "ipfs://QmNewDemoFilmCID", // you can keep dummy
    toUsdc(1), // rental = $1
    toUsdc(1), // ✅ ownership = $1
    toUsdc(5), // collector = $5 (optional)
    signer.address,
    recipients
  );

  const receipt = await tx.wait();

  console.log("✅ New film registered!");
  console.log("Tx:", receipt.hash);
  console.log("👉 This will be Film ID: 1 (since 0 already exists)");
}

main().catch(console.error);