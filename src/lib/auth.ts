import { supabase, type DbUser, type DbFilm, type DbThread, type DbThreadReply, type DbProposal, type DbProposalVote, type DbMarketListing } from "./supabase";

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
    if (insertError?.code === '23505') {
      const { data: retry } = await supabase.from("users").select("*").eq("wallet_address", normalized).single();
      if (retry) return retry as DbUser;
    }
    throw new Error(
      `[loginWithWallet] insert failed: ${insertError?.message ?? "no data returned"}`
    );
  }

  return created as DbUser;
}

export async function completeOnboardingUser(
  addressOrEmail: string,
  isPrivy: boolean,
  profile: { displayName: string; avatarUrl: string }
): Promise<DbUser> {
  const normalized = isPrivy ? `privy-${addressOrEmail.toLowerCase().trim()}` : addressOrEmail.toLowerCase().trim();

  const { data: existing } = await supabase
    .from("users")
    .select("*")
    .eq("wallet_address", normalized)
    .maybeSingle();

  if (existing) {
    const { data: updated } = await supabase.from("users").update({
      display_name: profile.displayName,
      avatar_url: profile.avatarUrl
    } as any).eq("id", existing.id).select("*").single();
    return updated as DbUser;
  }

  const { data: created, error: insertError } = await supabase
    .from("users")
    .insert({ 
      wallet_address: normalized, 
      credit_balance: 2500, 
      kyc_status: "none",
      display_name: profile.displayName,
      avatar_url: profile.avatarUrl
    } as any)
    .select("*")
    .single();

  if (insertError || !created) {
    if (insertError?.code === '23505') {
      const { data: retry } = await supabase.from("users").select("*").eq("wallet_address", normalized).single();
      if (retry) return retry as DbUser;
    }
    throw new Error(`[completeOnboardingUser] insert failed: ${insertError?.message ?? "no data"}`);
  }

  return created as DbUser;
}

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

export async function refreshCCBalance(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from("users")
    .select("credit_balance")
    .eq("id", userId)
    .single();

  if (error || !data) {
    throw new Error(`[refreshCCBalance] failed: ${error?.message}`);
  }
  return data.credit_balance;
}

export async function fetchUserOwnedFilms(userId: string) {
  const { data, error } = await supabase
    .from("sessions")
    .select("id, token_id, status, films(*)")
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) {
    console.error("[fetchUserOwnedFilms] failed:", error.message);
    return [];
  }
  
  console.log("[fetchUserOwnedFilms] Native DB Data Dump:", JSON.stringify(data, null, 2));

  return (data || []).map((session: any) => {
    const film = session.films;
    if (!film) {
      console.warn("[fetchUserOwnedFilms] Warning: Session found but film data is null/missing", session);
    }
    // Map database shape to VaultScreen collection item shape
    return {
      id: film.id, // Group by film.id so multiple tokens don't clash unless we want to, wait, UI uses id for activeListings mapping
      sessionId: session.id,
      title: film.title,
      subtitle: `${(session.token_tier || "Ownership").charAt(0).toUpperCase() + (session.token_tier || "ownership").slice(1)} Token ${session.token_id ? '#' + session.token_id : ''}`,
      image: film.poster_url || "https://picsum.photos/400/300",
      rotation: ["rotate-1", "-rotate-2", "rotate-3", "-rotate-1"][Math.floor(Math.random() * 4)], 
      tokenType: (session.token_tier || "Ownership").charAt(0).toUpperCase() + (session.token_tier || "ownership").slice(1),
      videoUrl: film.video_url || ""
    };
  });
}

export async function fetchUserTransactions(userId: string) {
  const { data, error } = await supabase
    .from("transactions")
    .select("*, films(title)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[fetchUserTransactions] failed:", error.message);
    return [];
  }

  return (data || []).map((tx: any) => {
    const isMint = tx.credits_spent > 0;
    const filmTitle = tx.films?.title || "Unknown Asset";
    
    // Map DB columns to UI transaction interface
    return {
      date: new Date(tx.created_at).toISOString().split("T")[0],
      type: isMint ? "Mint" : "Transfer",
      asset: `${filmTitle} — ${tx.token_tier ? tx.token_tier.charAt(0).toUpperCase() + tx.token_tier.slice(1) : 'Ownership'}`,
      amount: `${isMint ? '-' : '+'}${Math.abs(tx.credits_spent).toLocaleString()} CC`,
      usd: `$${(Math.abs(tx.credits_spent) / 10).toFixed(2)}`,
      status: tx.tx_hash ? "Confirmed" : "Pending"
    };
  });
}

export async function purchaseFilmToken(
  userId:    string,
  filmId:    string,
  tokenTier: TokenTier,
  cost:      number
): Promise<DbUser> {
  // Use stored procedure to deduct credits atomically
  const { data: success, error: deductErr } = await supabase.rpc("deduct_credits", {
    p_user_id: userId,
    p_amount: cost
  });

  if (deductErr || success === false) {
    throw new Error(`[purchaseFilmToken] credit deduction failed: ${deductErr?.message || "Insufficient funds"}`);
  }

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
    console.error("[purchaseFilmToken] transaction row insert failed:", txErr.message);
  }

  const { data: updatedUser, error: userErr } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (userErr || !updatedUser) {
    throw new Error(`[purchaseFilmToken] could not fetch updated user: ${userErr?.message}`);
  }

  return updatedUser as DbUser;
}

// ── Film Upload ────────────────────────────────────────────────────────────

interface FilmUploadData {
  title?: string;
  description?: string;
  director?: string;
  year?: number;
  genre?: string;
  genres?: string[];
  territories?: string[];
  revenueSplit?: Record<string, number>;
  filmakerId?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
}

export async function uploadFilm(filmData: FilmUploadData): Promise<DbFilm> {
  const { data, error } = await supabase
    .from("films")
    .insert({
      filmmaker_id: filmData.filmakerId ?? null,
      title: filmData.title ?? "Untitled",
      description: filmData.description ?? "",
      director: filmData.director ?? null,
      year: filmData.year ?? null,
      genre: filmData.genre ?? null,
      runtime: 5400,
      poster_url: filmData.thumbnailUrl ?? `https://picsum.photos/seed/${encodeURIComponent(filmData.title ?? "film")}/600/400`,
      video_url: filmData.videoUrl,
      genres: filmData.genres ?? ["Independent"],
      territories: filmData.territories ?? ["Global"],
      upload_status: "live",
      revenue_split: filmData.revenueSplit ?? {},
    } as any)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`[uploadFilm] insert failed: ${error?.message}`);
  }

  return data as DbFilm;
}

// ── Subscription Flow ──────────────────────────────────────────────────────

export async function subscribeToCinePass(userId: string, tier: string, costCC: number): Promise<DbUser> {
  // Deduct credits for the pass
  const { data: success, error: deductErr } = await supabase.rpc("deduct_credits", {
    p_user_id: userId,
    p_amount: costCC
  });

  if (deductErr || success === false) {
    throw new Error(`[subscribeToCinePass] credit deduction failed: ${deductErr?.message || "Insufficient funds"}`);
  }

  const { data: updatedUser, error: updateErr } = await supabase
    .from("users")
    .update({ cinepass_tier: tier } as any)
    .eq("id", userId)
    .select("*")
    .single();

  if (updateErr || !updatedUser) {
    throw new Error(`[subscribeToCinePass] update failed: ${updateErr?.message}`);
  }

  // Insert subscription record
  await supabase.from("cinepass_subscriptions").insert({
    user_id: userId,
    tier: tier,
    status: "active",
  } as any);

  return updatedUser as DbUser;
}

// ── Community Threads ──────────────────────────────────────────────────────

export async function fetchThreads(): Promise<DbThread[]> {
  const { data, error } = await supabase
    .from("threads")
    .select("*, user:users(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[fetchThreads] error:", error.message);
    return [];
  }

  // Get reply counts
  const threadIds = (data || []).map((t: any) => t.id);
  const replyCounts: Record<string, number> = {};
  
  if (threadIds.length > 0) {
    const { data: replies } = await supabase
      .from("thread_replies")
      .select("thread_id");
    
    (replies || []).forEach((r: any) => {
      replyCounts[r.thread_id] = (replyCounts[r.thread_id] || 0) + 1;
    });
  }

  return (data || []).map((t: any) => ({
    ...t,
    reply_count: replyCounts[t.id] || 0,
  }));
}

export async function createThread(userId: string, title: string, body: string): Promise<DbThread> {
  const { data, error } = await supabase
    .from("threads")
    .insert({ user_id: userId, title, body } as any)
    .select("*, user:users(*)")
    .single();

  if (error || !data) throw new Error(`[createThread] failed: ${error?.message}`);
  return { ...data, reply_count: 0 } as any;
}

export async function fetchThreadReplies(threadId: string): Promise<DbThreadReply[]> {
  const { data, error } = await supabase
    .from("thread_replies")
    .select("*, user:users(*)")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[fetchThreadReplies] error:", error.message);
    return [];
  }
  return (data || []) as any;
}

export async function createThreadReply(threadId: string, userId: string, body: string): Promise<DbThreadReply> {
  const { data, error } = await supabase
    .from("thread_replies")
    .insert({ thread_id: threadId, user_id: userId, body } as any)
    .select("*, user:users(*)")
    .single();

  if (error || !data) throw new Error(`[createThreadReply] failed: ${error?.message}`);
  return data as any;
}

// ── Governance Proposals ───────────────────────────────────────────────────

export async function fetchProposals(): Promise<DbProposal[]> {
  const { data, error } = await supabase
    .from("proposals")
    .select("*, user:users(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[fetchProposals] error:", error.message);
    return [];
  }
  return (data || []) as any;
}

export async function createProposal(
  userId: string,
  title: string,
  description: string,
  proposalType: string,
  votingDeadline: string
): Promise<DbProposal> {
  // Deduct proposal creation fee
  const proposalFee = 100;
  const { data: success, error: deductErr } = await supabase.rpc("deduct_credits", {
    p_user_id: userId,
    p_amount: proposalFee
  });
  if (deductErr || success === false) {
    throw new Error(`[createProposal] credit deduction failed: ${deductErr?.message || "Insufficient funds"}`);
  }

  const { data, error } = await supabase
    .from("proposals")
    .insert({
      user_id: userId,
      title,
      description,
      proposal_type: proposalType,
      voting_deadline: votingDeadline,
    } as any)
    .select("*, user:users(*)")
    .single();

  if (error || !data) throw new Error(`[createProposal] failed: ${error?.message}`);
  return data as any;
}

export async function castVote(proposalId: string, userId: string, direction: "for" | "against"): Promise<void> {
  // Check if already voted
  const { data: existing } = await supabase
    .from("proposal_votes")
    .select("id")
    .eq("proposal_id", proposalId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) throw new Error("Already voted on this proposal");

  // Insert vote
  const { error: voteErr } = await supabase
    .from("proposal_votes")
    .insert({ proposal_id: proposalId, user_id: userId, direction } as any);

  if (voteErr) throw new Error(`[castVote] insert failed: ${voteErr.message}`);

  // Update proposal counters
  const column = direction === "for" ? "votes_for" : "votes_against";
  const { data: proposal } = await supabase
    .from("proposals")
    .select(column)
    .eq("id", proposalId)
    .single();

  if (proposal) {
    const newCount = ((proposal as any)[column] || 0) + 1;
    await supabase
      .from("proposals")
      .update({ [column]: newCount } as any)
      .eq("id", proposalId);
  }
}

export async function getUserVotes(userId: string): Promise<Record<string, "for" | "against">> {
  const { data } = await supabase
    .from("proposal_votes")
    .select("proposal_id, direction")
    .eq("user_id", userId);

  const votes: Record<string, "for" | "against"> = {};
  (data || []).forEach((v: any) => {
    votes[v.proposal_id] = v.direction;
  });
  return votes;
}

// ── Market Listings ────────────────────────────────────────────────────────

export async function fetchMarketListings(): Promise<DbMarketListing[]> {
  const { data, error } = await supabase
    .from("market_listings")
    .select("*, seller:users(*)")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[fetchMarketListings] error:", error.message);
    return [];
  }
  return (data || []) as any;
}

export async function createMarketListing(
  sellerId: string,
  filmTitle: string,
  filmImage: string,
  tokenType: string,
  tokenNumber: string,
  askPrice: number,
  description?: string,
  filmId?: string
): Promise<DbMarketListing> {
  const { data, error } = await supabase
    .from("market_listings")
    .insert({
      seller_id: sellerId,
      film_id: filmId || null,
      film_title: filmTitle,
      film_image: filmImage,
      token_type: tokenType,
      token_number: tokenNumber,
      ask_price: askPrice,
      description: description || null,
      status: "active",
    } as any)
    .select("*")
    .single();

  if (error || !data) throw new Error(`[createMarketListing] failed: ${error?.message}`);
  return data as any;
}

export async function purchaseMarketListing(buyerId: string, listingId: string, price: number): Promise<DbUser> {
  // Deduct buyer credits
  const { data: success, error: deductErr } = await supabase.rpc("deduct_credits", {
    p_user_id: buyerId,
    p_amount: price
  });
  if (deductErr || success === false) {
    throw new Error(`[purchaseMarketListing] credit deduction failed: ${deductErr?.message || "Insufficient funds"}`);
  }

  // Calculate distributions
  const royalty = Math.round(price * 0.10);
  const protocolFee = Math.round(price * 0.05);
  const sellerShare = price - royalty - protocolFee;

  // Mark listing as sold
  const { data: listing, error: updateErr } = await supabase
    .from("market_listings")
    .update({ status: "sold" } as any)
    .eq("id", listingId)
    .select("*")
    .single();

  if (updateErr) throw new Error(`[purchaseMarketListing] failed to close listing: ${updateErr.message}`);

  // Payout seller (using increment_credits RPC)
  if (listing && listing.seller_id) {
    await supabase.rpc("increment_credits", {
      p_user_id: listing.seller_id,
      p_amount: sellerShare
    });
  }

  // Get updated buyer
  const { data: updatedUser } = await supabase
    .from("users")
    .select("*")
    .eq("id", buyerId)
    .single();

  return updatedUser as DbUser;
}

export async function cancelMarketListing(listingId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from("market_listings")
    .update({ status: "cancelled" } as any)
    .eq("id", listingId)
    .eq("seller_id", userId);

  if (error) throw new Error(`[cancelMarketListing] failed: ${error?.message}`);
}

export async function getUserActiveListings(userId: string): Promise<DbMarketListing[]> {
  const { data, error } = await supabase
    .from("market_listings")
    .select("*")
    .eq("seller_id", userId)
    .eq("status", "active");

  if (error) {
    console.error("[getUserActiveListings] error:", error.message);
    return [];
  }
  return (data || []) as any;
}

// ── Films (DB) ─────────────────────────────────────────────────────────────

export async function fetchDbFilms(): Promise<DbFilm[]> {
  const { data, error } = await supabase
    .from("films")
    .select("*")
    .eq("upload_status", "live")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[fetchDbFilms] error:", error.message);
    return [];
  }
  return (data || []) as any;
}

export async function fetchDbFilmById(filmId: string): Promise<DbFilm | null> {
  const { data, error } = await supabase
    .from("films")
    .select("*")
    .eq("id", filmId)
    .single();

  if (error) {
    console.error("[fetchDbFilmById] error:", error.message);
    return null;
  }
  return data as any;
}

export async function fetchFilmmakerFilms(filmakerId: string): Promise<DbFilm[]> {
  const { data, error } = await supabase
    .from("films")
    .select("*")
    .eq("filmmaker_id", filmakerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[fetchFilmmakerFilms] error:", error.message);
    return [];
  }
  return (data || []) as any;
}

// ── User Profile Update ────────────────────────────────────────────────────

export async function updateUserProfile(userId: string, updates: { display_name?: string; avatar_url?: string }): Promise<DbUser> {
  const { data, error } = await supabase
    .from("users")
    .update(updates as any)
    .eq("id", userId)
    .select("*")
    .single();

  if (error || !data) throw new Error(`[updateUserProfile] failed: ${error?.message}`);
  return data as DbUser;
}
