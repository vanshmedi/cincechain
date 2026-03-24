import { registerFilm } from "./blockchain.js";
// Bypassed IPFS import
import fetch from "node-fetch";

export async function registerFilmOnchain(supabase, film) {
  try {
    if (film.on_chain_id !== null) return;

    console.log("[onchain] Registering:", film.title);

    // Hardcode to the platform wallet to prevent ENS resolution errors on invalid emails/dummy addresses
    let filmmakerWallet = "0xb2984A80Bcb06Dbe7c1f9849949B8c02A71fbE48";

    // 1-2. By-passing IPFS. We will just use the poster_url for the blockchain args.
    const fakeMetadataUri = `https://cinechain.com/metadata/${film.id}`;
    const result = await registerFilm({
      title: film.title,
      director: film.director,
      synopsis: film.description,
      posterIpfsCid: "none", // Bypassed
      year: film.year,
      rentalPriceUsd: 1,
      ownershipPriceUsd: 1,
      collectorPriceUsd: 5,
      filmmaker: filmmakerWallet,
      recipients: [
        { wallet: filmmakerWallet, shareBps: 7000 },
        { wallet: filmmakerWallet, shareBps: 2500 },
        { wallet: filmmakerWallet, shareBps: 500 },
      ],
    });

    // 4. Save mapping
    await supabase
      .from("films")
      .update({
        on_chain_id: result.filmId,
        ipfs_cid: "none",
        content_id: result.txHash,
      })
      .eq("id", film.id);

    console.log("[onchain] DONE:", result.filmId);

  } catch (err) {
    console.error("[onchain] ERROR:", err.message);
  }
}