import { createClient } from "@supabase/supabase-js";
import { registerFilmOnchain } from "../services/filmOnchain.js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export function startFilmWorker() {
  console.log("[worker] Film worker started");

  setInterval(async () => {
    const { data: films } = await supabase
      .from("films")
      .select("*")
      .eq("upload_status", "live")
      .is("on_chain_id", null);

    for (const film of films || []) {
      await registerFilmOnchain(supabase, film);
    }
  }, 8000);
}