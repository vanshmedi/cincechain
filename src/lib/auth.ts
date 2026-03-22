import { supabase, type DbUser, type DbFilm } from "./supabase";

const WALLET_STORAGE_KEY = "cinechain_wallet";

// ── Session helpers ────────────────────────────────────────────────────────

export function saveWalletToStorage(address: string) {
  localStorage.setItem(WALLET_STORAGE_KEY, address.toLowerCase().trim());
}

export function loadWalletFromStorage(): string | null {
  return localStorage.getItem(WALLET_STORAGE_KEY);
}

export function clearWalletFromStorage() {
  localStorage.removeItem(WALLET_STORAGE_KEY);
}

// ── Auth ───────────────────────────────────────────────────────────────────

/**
 * loginWithWallet
 * Looks up the user by wallet address; inserts a new row with 2500 CC if absent.
 */
export async function loginWithWallet(walletAddress: string): Promise<DbUser> {
  const normalized = walletAddress.toLowerCase().trim();

  const { data: existing, error: fetchError } = await supabase
    .from("users")
    .select("*")
    .eq("wallet_address", normalized)
    .maybeSingle();

  if (fetchError) {
    throw new Error(`[loginWithWallet] fetch failed: ${fetchError.message}`);
  }

  if (existing) return existing as DbUser;

  const { data: created, error: insertError } = await supabase
    .from("users")
    .insert({ wallet_address: normalized, credit_balance: 2500, kyc_status: "none" } as any)
    .select("*")
    .single();

  if (insertError || !created) {
    throw new Error(
      `[loginWithWallet] insert failed: ${insertError?.message ?? "no data returned"}`
    );
  }

  return created as DbUser;
}

/**
 * getUserByWallet
 * Read-only lookup for session rehydration. Returns null if no user found.
 */
export async function getUserByWallet(walletAddress: string): Promise<DbUser | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("wallet_address", walletAddress.toLowerCase().trim())
    .maybeSingle();

  if (error) throw new Error(`[getUserByWallet] ${error.message}`);
  return (data as DbUser) ?? null;
}

// ── Purchase flow ──────────────────────────────────────────────────────────

type TokenTier = "rental" | "ownership" | "collector";

/**
 * purchaseFilmToken
 *
 * Atomically:
 *  A. Deducts `cost` CineCredits from the user's balance (floors at 0).
 *  B. Inserts a transactions row recording the purchase.
 *
 * Returns the updated DbUser row so the caller can sync React state.
 *
 * NOTE: For now we use two sequential Supabase calls. Swap for an RPC /
 * Edge Function when you need atomic guarantees across both tables.
 */
export async function purchaseFilmToken(
  userId:    string,
  filmId:    string,     // UUID of the film in the Supabase films table
  tokenTier: TokenTier,
  cost:      number      // CC to deduct
): Promise<DbUser> {
  // ── A. Deduct credits ──────────────────────────────────────────────────
  // Fetch current balance first so we can calculate the new value.
  const { data: userRow, error: userErr } = await supabase
    .from("users")
    .select("credit_balance")
    .eq("id", userId)
    .single();

  if (userErr || !userRow) {
    throw new Error(`[purchaseFilmToken] could not fetch user: ${userErr?.message}`);
  }

  const newBalance = Math.max(0, (userRow as { credit_balance: number }).credit_balance - cost);

  const { data: updatedUser, error: updateErr } = await supabase
    .from("users")
    .update({ credit_balance: newBalance } as any)
    .eq("id", userId)
    .select("*")
    .single();

  if (updateErr || !updatedUser) {
    throw new Error(`[purchaseFilmToken] credit deduction failed: ${updateErr?.message}`);
  }

  // ── B. Record transaction ──────────────────────────────────────────────
  // Mock tx_hash with a random hex string until we integrate a real chain.
  const mockTxHash =
    "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

  const { error: txErr } = await supabase.from("transactions").insert({
    user_id:       userId,
    film_id:       filmId,
    token_tier:    tokenTier,
    credits_spent: cost,
    tx_hash:       mockTxHash,
  } as any);

  if (txErr) {
    // Non-fatal — credit already deducted; log and continue so UX isn't broken.
    console.error("[purchaseFilmToken] transaction row insert failed:", txErr.message);
  }

  return updatedUser as DbUser;
}

// ── Film Upload ────────────────────────────────────────────────────────────

export async function uploadFilm(filmData: Partial<DbFilm>): Promise<DbFilm> {
  // Generate mock content_id hash
  const contentId = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  
  const { data, error } = await supabase
    .from("films")
    .insert({
      content_id: contentId,
      title: filmData.title ?? "Untitled",
      description: filmData.description ?? "",
      runtime: 5400, // mock as requested
      genres: filmData.genres ?? ["Independent"],
      territories: filmData.territories ?? ["Global"],
      upload_status: "live",
    } as any)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`[uploadFilm] insert failed: ${error?.message}`);
  }

  return data as DbFilm;
}

// ── Subscription Flow ──────────────────────────────────────────────────────

export async function subscribeToCinePass(userId: string, tier: string, bonusCredits: number): Promise<DbUser> {
  const { data: userRow, error: userErr } = await supabase
    .from("users")
    .select("credit_balance")
    .eq("id", userId)
    .single();

  if (userErr || !userRow) {
    throw new Error(`[subscribeToCinePass] fetch failed: ${userErr?.message}`);
  }

  const newBalance = (userRow as { credit_balance: number }).credit_balance + bonusCredits;

  const { data: updatedUser, error: updateErr } = await supabase
    .from("users")
    .update({ credit_balance: newBalance })
    .eq("id", userId)
    .select("*")
    .single();

  if (updateErr || !updatedUser) {
    throw new Error(`[subscribeToCinePass] update failed: ${updateErr?.message}`);
  }

  return updatedUser as DbUser;
}
