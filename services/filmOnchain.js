import { registerFilm } from "./blockchain.js";
import { uploadFilmNFT } from "./ipfs.js";
import fetch from "node-fetch";

export async function registerFilmOnchain(supabase, film) {
  try {
    if (film.on_chain_id !== null) return;

    console.log("[onchain] Registering:", film.title);

    // 1. Fetch poster
    const res = await fetch(film.poster_url);
    const buffer = Buffer.from(await res.arrayBuffer());

    // 2. Upload to IPFS
    const { metadataUri } = await uploadFilmNFT(
      {
        title: film.title,
        synopsis: film.description,
        director: film.director,
        year: film.year,
      },
      buffer
    );

    // 3. Register on blockchain
    const result = await registerFilm({
      title: film.title,
      director: film.director,
      synopsis: film.description,
      posterIpfsCid: metadataUri.replace("ipfs://", ""),
      year: film.year,
      rentalPriceUsd: 1,
      ownershipPriceUsd: 1,
      collectorPriceUsd: 5,
      filmmaker: film.wallet_address, // MUST EXIST
      recipients: [
        { wallet: film.wallet_address, shareBps: 7000 },
        { wallet: film.wallet_address, shareBps: 2500 },
        { wallet: film.wallet_address, shareBps: 500 },
      ],
    });

    // 4. Save mapping
    await supabase
      .from("films")
      .update({
        on_chain_id: result.filmId,
        ipfs_cid: metadataUri,
      })
      .eq("id", film.id);

    console.log("[onchain] DONE:", result.filmId);

  } catch (err) {
    console.error("[onchain] ERROR:", err.message);
  }
}