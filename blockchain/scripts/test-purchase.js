import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const ABI = [
  "function purchaseOwnership(uint128 filmId, address buyer) returns (uint256)",
  "event FilmPurchased(uint128 indexed filmId, uint8 tier, address indexed buyer, uint256 tokenId, uint256 usdcAmount)"
];

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const signer = new ethers.Wallet(process.env.PLATFORM_PRIVATE_KEY, provider);

  const contract = new ethers.Contract(
    process.env.CINECHAIN_CONTRACT_ADDRESS,
    ABI,
    signer
  );

  console.log("Calling purchaseOwnership...");
  console.log("Buyer:", signer.address);

  const tx = await contract.purchaseOwnership(1, signer.address);
  const receipt = await tx.wait();

  console.log("\n✅ Transaction confirmed!");
  console.log("Tx Hash:", receipt.hash);
  console.log("Etherscan:", `https://sepolia.etherscan.io/tx/${receipt.hash}`);

  // 🔍 Parse event (THIS is the cool part)
  const iface = new ethers.Interface(ABI);

  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog(log);

      if (parsed.name === "FilmPurchased") {
        const { filmId, tier, buyer, tokenId, usdcAmount } = parsed.args;

        console.log("\n🎬 FilmPurchased Event:");
        console.log("Film ID:", filmId.toString());
        console.log("Tier:", tier.toString(), "(1 = Ownership)");
        console.log("Buyer:", buyer);
        console.log("Token ID:", tokenId.toString());
        console.log("USDC Paid:", Number(usdcAmount) / 1_000_000, "USDC");
      }
    } catch (e) {
      // ignore non-matching logs
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});