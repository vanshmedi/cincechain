import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const signer = new ethers.Wallet(process.env.PLATFORM_PRIVATE_KEY, provider);

  const usdc = new ethers.Contract(
    process.env.USDC_ADDRESS,
    [
      "function approve(address spender, uint256 amount) returns (bool)",
      "function allowance(address owner, address spender) view returns (uint256)"
    ],
    signer
  );

  const owner = signer.address;
  const spender = process.env.CINECHAIN_CONTRACT_ADDRESS;

  const currentAllowance = await usdc.allowance(owner, spender);

  console.log("Current allowance:", currentAllowance.toString());

  if (currentAllowance > 0n) {
    console.log("✅ Already approved. No action needed.");
    return;
  }

  console.log("Approving USDC...");

  const tx = await usdc.approve(spender, ethers.MaxUint256);
  await tx.wait();

  console.log("✅ USDC approved!");
  console.log("Tx:", tx.hash);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});