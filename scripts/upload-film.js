import { initIPFS, uploadFilmNFT } from "../services/ipfs.js";
import fs from "fs";

async function main() {
  initIPFS();

  // 🔥 Use ANY image here (movie poster)
  const posterBuffer = fs.readFileSync("./poster.jpg");

  const filmData = {
    title: "CineChain Demo Film",
    synopsis: "A decentralized film ownership experience.",
    director: "Rajit",
    year: 2026,
    tier: "Ownership"
  };

  const result = await uploadFilmNFT(filmData, posterBuffer);

  console.log("\n✅ NFT Uploaded!");
  console.log("Metadata URI:", result.metadataUri);
  console.log("Image CID:", result.imageCid);
}

main();