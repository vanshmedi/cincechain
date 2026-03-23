import { createClient } from "@supabase/supabase-js";

const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing from your .env file. " +
    "Supabase calls will fail until these are set."
  );
}

// ── Typed DB row shapes ────────────────────────────────────────────────────
export interface DbUser {
  id: string;
  wallet_address: string | null;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  credit_balance: number;
  cinepass_tier: "standard" | "plus" | "collector" | null;
  kyc_status: "none" | "pending" | "approved" | "rejected";
  created_at: string;
}

export interface DbFilm {
  id: string;
  filmmaker_id: string | null;
  content_id: string | null;
  title: string;
  description: string | null;
  director: string | null;
  year: number | null;
  genre: string | null;
  runtime: number | null;
  poster_url: string | null;
  genres: string[];
  languages: string[];
  territories: string[];
  upload_status: "pending" | "processing" | "live" | "rejected";
  ipfs_cid: string | null;
  revenue_split: Record<string, number> | null;
  created_at: string;
}

export interface DbSession {
  id: string;
  user_id: string;
  film_id: string;
  token_id: string;
  device_fingerprint: string;
  ip_address: string | null;
  session_key_hash: string;
  watermark_id: string | null;
  status: "active" | "expired" | "revoked";
  started_at: string;
}

export interface DbTransaction {
  id: string;
  user_id: string;
  film_id: string;
  token_tier: "rental" | "ownership" | "collector";
  credits_spent: number;
  tx_hash: string | null;
  created_at: string;
}

export interface DbWatermark {
  id: string;
  session_id: string;
  wallet_address: string;
  device_fingerprint: string;
  timestamp: string;
  nonce: string;
  status: "active" | "flagged" | "cleared";
}

export interface DbThread {
  id: string;
  user_id: string;
  title: string;
  body: string;
  created_at: string;
  // Joined fields
  user?: DbUser;
  reply_count?: number;
}

export interface DbThreadReply {
  id: string;
  thread_id: string;
  user_id: string;
  body: string;
  created_at: string;
  user?: DbUser;
}

export interface DbProposal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  proposal_type: string;
  voting_deadline: string;
  votes_for: number;
  votes_against: number;
  status: "active" | "passed" | "failed";
  created_at: string;
  user?: DbUser;
}

export interface DbProposalVote {
  id: string;
  proposal_id: string;
  user_id: string;
  direction: "for" | "against";
  created_at: string;
}

export interface DbMarketListing {
  id: string;
  seller_id: string;
  film_id: string | null;
  film_title: string;
  film_image: string | null;
  token_type: "Rental" | "Ownership" | "Collector";
  token_number: string | null;
  ask_price: number;
  description: string | null;
  status: "active" | "sold" | "cancelled";
  created_at: string;
  seller?: DbUser;
}

export interface DbCinePassSubscription {
  id: string;
  user_id: string;
  tier: "standard" | "plus" | "collector";
  started_at: string;
  expires_at: string | null;
  status: "active" | "cancelled" | "expired";
}

// ── Database type map for the Supabase client generic ─────────────────────
export interface Database {
  public: {
    Tables: {
      users:        { Row: DbUser;        Insert: Partial<DbUser>;        Update: Partial<DbUser>        };
      films:        { Row: DbFilm;        Insert: Partial<DbFilm>;        Update: Partial<DbFilm>        };
      sessions:     { Row: DbSession;     Insert: Partial<DbSession>;     Update: Partial<DbSession>     };
      transactions: { Row: DbTransaction; Insert: Partial<DbTransaction>; Update: Partial<DbTransaction> };
      watermarks:   { Row: DbWatermark;   Insert: Partial<DbWatermark>;   Update: Partial<DbWatermark>   };
      threads:      { Row: DbThread;      Insert: Partial<DbThread>;      Update: Partial<DbThread>      };
      thread_replies: { Row: DbThreadReply; Insert: Partial<DbThreadReply>; Update: Partial<DbThreadReply> };
      proposals:    { Row: DbProposal;    Insert: Partial<DbProposal>;    Update: Partial<DbProposal>    };
      proposal_votes: { Row: DbProposalVote; Insert: Partial<DbProposalVote>; Update: Partial<DbProposalVote> };
      market_listings: { Row: DbMarketListing; Insert: Partial<DbMarketListing>; Update: Partial<DbMarketListing> };
      cinepass_subscriptions: { Row: DbCinePassSubscription; Insert: Partial<DbCinePassSubscription>; Update: Partial<DbCinePassSubscription> };
    };
  };
}

export const supabase: any = createClient<Database>(supabaseUrl, supabaseAnonKey);
