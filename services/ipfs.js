// services/ipfs.js
// Pins NFT metadata and film posters to IPFS via nft.storage.
// nft.storage is free for NFT data and backed by Filecoin for permanence.

import { NFTStorage, File } from "nft.storage";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";

let _client;

export function initIPFS() {
  _client = new NFTStorage({ token: process.env.NFT_STORAGE_API_KEY });
  console.log("[ipfs] NFT.storage client initialized");
}

/**
 * Upload a film poster image to IPFS and return its CID.
 * Accepts a local file path or a Buffer.
 *
 * @param {string|Buffer} source  — file path or image buffer
 * @param {string} filename       — e.g. "poster.jpg"
 * @param {string} mimeType       — e.g. "image/jpeg"
 * @returns {string} CID
 */
export async function uploadPosterToIPFS(source, filename = "poster.jpg", mimeType = "image/jpeg") {
  let data;
  if (typeof source === "string") {
    data = fs.readFileSync(source);
  } else {
    data = source;
  }

  const file = new File([data], filename, { type: mimeType });
  const cid = await _client.storeBlob(file);
  console.log(`[ipfs] Poster uploaded: ipfs://${cid}`);
  return cid;
}

/**
 * Upload ERC-1155 metadata JSON to IPFS and return the full ipfs:// URI.
 * This URI is stored in the smart contract and returned by uri(tokenId).
 *
 * @param {object} metadata  — { name, description, image, attributes }
 * @returns {string}         — ipfs://<CID>
 */
export async function uploadMetadataToIPFS(metadata) {
  const json = JSON.stringify(metadata, null, 2);
  const file = new File([json], "metadata.json", { type: "application/json" });
  const cid = await _client.storeBlob(file);
  const uri = `ipfs://${cid}`;
  console.log(`[ipfs] Metadata uploaded: ${uri}`);
  return uri;
}

/**
 * Upload a complete NFT (image + metadata) atomically using nft.storage's
 * store() method. This is more efficient than two separate uploads.
 *
 * @param {object} filmData
 * @param {Buffer} posterBuffer
 * @returns {{ metadataUri, imageCid }}
 */
export async function uploadFilmNFT(filmData, posterBuffer) {
  const imageFile = new File([posterBuffer], "poster.jpg", { type: "image/jpeg" });

  const metadata = await _client.store({
    name:        filmData.title,
    description: filmData.synopsis,
    image:       imageFile,
    attributes: [
      { trait_type: "Director",   value: filmData.director },
      { trait_type: "Year",       value: String(filmData.year) },
      { trait_type: "Token Tier", value: filmData.tier || "Ownership" },
      { trait_type: "Platform",   value: "CineChain" },
    ],
  });

  console.log(`[ipfs] Film NFT uploaded: ${metadata.url}`);
  return {
    metadataUri: metadata.url,                    // ipfs://<metadata CID>
    imageCid:    metadata.data.image.href,         // ipfs://<image CID>
  };
}
