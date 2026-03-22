-- ─────────────────────────────────────────────────────────────
-- CineChain PostgreSQL Schema
-- Run this in the Supabase SQL Editor to provision all tables.
-- ─────────────────────────────────────────────────────────────

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address   TEXT        UNIQUE,               -- EVM / Privy wallet (nullable for email-only accounts)
  email            TEXT        UNIQUE,               -- Email (nullable for wallet-only accounts)
  credit_balance   INTEGER     NOT NULL DEFAULT 2500, -- CineCredits (1 CC = $0.10)
  kyc_status       TEXT        NOT NULL DEFAULT 'none'
                               CHECK (kyc_status IN ('none', 'pending', 'approved', 'rejected')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── films ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS films (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id       TEXT        UNIQUE,               -- On-chain token / NFT identifier
  title            TEXT        NOT NULL,
  description      TEXT,
  runtime          INTEGER,                          -- Duration in seconds
  genres           TEXT[]      NOT NULL DEFAULT '{}',
  languages        TEXT[]      NOT NULL DEFAULT '{}',
  territories      TEXT[]      NOT NULL DEFAULT '{}', -- ISO 3166-1 alpha-2 codes
  upload_status    TEXT        NOT NULL DEFAULT 'pending'
                               CHECK (upload_status IN ('pending', 'processing', 'live', 'rejected')),
  ipfs_cid         TEXT,                             -- IPFS content identifier for master file
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── sessions ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  film_id             UUID        NOT NULL REFERENCES films(id)  ON DELETE CASCADE,
  token_id            TEXT        NOT NULL,           -- On-chain token held by user granting access
  device_fingerprint  TEXT        NOT NULL,
  ip_address          INET,
  session_key_hash    TEXT        NOT NULL,           -- Server-side hashed session key for DRM
  watermark_id        UUID,                           -- FK to watermarks populated after start
  status              TEXT        NOT NULL DEFAULT 'active'
                                  CHECK (status IN ('active', 'expired', 'revoked')),
  started_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── transactions ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES users(id)  ON DELETE SET NULL,
  film_id         UUID        NOT NULL REFERENCES films(id)  ON DELETE SET NULL,
  token_tier      TEXT        NOT NULL                       -- e.g. 'rental', 'ownership', 'collector'
                              CHECK (token_tier IN ('rental', 'ownership', 'collector')),
  credits_spent   INTEGER     NOT NULL CHECK (credits_spent >= 0),
  tx_hash         TEXT        UNIQUE,                        -- On-chain transaction hash
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── watermarks ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS watermarks (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id         UUID        NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  wallet_address     TEXT        NOT NULL,
  device_fingerprint TEXT        NOT NULL,
  timestamp          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  nonce              TEXT        NOT NULL UNIQUE,     -- One-time random nonce for watermark embedding
  status             TEXT        NOT NULL DEFAULT 'active'
                                 CHECK (status IN ('active', 'flagged', 'cleared'))
);

-- ── back-fill sessions.watermark_id FK ───────────────────────
ALTER TABLE sessions
  ADD CONSTRAINT fk_session_watermark
  FOREIGN KEY (watermark_id) REFERENCES watermarks(id) ON DELETE SET NULL;

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_sessions_user     ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_film     ON sessions(film_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_film ON transactions(film_id);
CREATE INDEX IF NOT EXISTS idx_watermarks_session ON watermarks(session_id);

-- ── Row-Level Security (enable, policies to be added per use-case) ──
ALTER TABLE users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE films        ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE watermarks   ENABLE ROW LEVEL SECURITY;
