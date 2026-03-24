import { createClient } from "@supabase/supabase-js";
import { registerFilmOnchain } from "../services/filmOnchain.js";
import { initBlockchain } from "../services/blockchain.js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const processingFilms = new Set();

export function startFilmWorker() {
  console.log("[worker] Film worker started");
  initBlockchain();

  setInterval(async () => {
    const { data: films } = await supabase
      .from("films")
      .select("*")
      .eq("upload_status", "live")
      .is("on_chain_id", null);

    for (const film of films || []) {
      if (processingFilms.has(film.id)) continue;
      
      processingFilms.add(film.id);
      try {
        await registerFilmOnchain(supabase, film);
      } finally {
        processingFilms.delete(film.id);
      }
    }
  }, 8000);
}