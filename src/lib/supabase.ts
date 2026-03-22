import { createClient } from "@supabase/supabase-js";

// ── Load env vars ──────────────────────────────────────────────────────────
// Add these to your .env file:
//   VITE_SUPABASE_URL=https://your-project.supabase.co
//   VITE_SUPABASE_ANON_KEY=your-anon-key
const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  // Warn rather than throw — a hard throw here crashes the entire module graph
  // at startup, causing a blank screen before React can even mount.
  // The wallet connect modal's error state will surface the failure gracefully.
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
  credit_balance: number;
  kyc_status: "none" | "pending" | "approved" | "rejected";
  created_at: string;
}

export interface DbFilm {
  id: string;
  content_id: string | null;
  title: string;
  description: string | null;
  runtime: number | null;
  genres: string[];
  languages: string[];
  territories: string[];
  upload_status: "pending" | "processing" | "live" | "rejected";
  ipfs_cid: string | null;
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

// ── Database type map for the Supabase client generic ─────────────────────
export interface Database {
  public: {
    Tables: {
      users:        { Row: DbUser;        Insert: Partial<DbUser>;        Update: Partial<DbUser>        };
      films:        { Row: DbFilm;        Insert: Partial<DbFilm>;        Update: Partial<DbFilm>        };
      sessions:     { Row: DbSession;     Insert: Partial<DbSession>;     Update: Partial<DbSession>     };
      transactions: { Row: DbTransaction; Insert: Partial<DbTransaction>; Update: Partial<DbTransaction> };
      watermarks:   { Row: DbWatermark;   Insert: Partial<DbWatermark>;   Update: Partial<DbWatermark>   };
    };
  };
}

// ── Singleton client ────────────────────────────────────────────────────────
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
