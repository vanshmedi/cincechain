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
  display_name     TEXT,                              -- Optional display name
  avatar_url       TEXT,                              -- Optional avatar URL
  credit_balance   INTEGER     NOT NULL DEFAULT 2500, -- CineCredits (1 CC = $0.10)
  cinepass_tier    TEXT        DEFAULT NULL           -- Active CinePass tier: 'standard', 'plus', 'collector'
                               CHECK (cinepass_tier IS NULL OR cinepass_tier IN ('standard', 'plus', 'collector')),
  kyc_status       TEXT        NOT NULL DEFAULT 'none'
                               CHECK (kyc_status IN ('none', 'pending', 'approved', 'rejected')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── films ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS films (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  filmmaker_id     UUID        REFERENCES users(id) ON DELETE SET NULL, -- Who uploaded the film
  content_id       TEXT        UNIQUE,               -- On-chain token / NFT identifier
  title            TEXT        NOT NULL,
  description      TEXT,
  director         TEXT,                              -- Director name
  year             INTEGER,                           -- Production year
  genre            TEXT,                              -- Primary genre
  runtime          INTEGER,                          -- Duration in seconds
  poster_url       TEXT,                              -- Poster image URL
  genres           TEXT[]      NOT NULL DEFAULT '{}',
  languages        TEXT[]      NOT NULL DEFAULT '{}',
  territories      TEXT[]      NOT NULL DEFAULT '{}', -- ISO 3166-1 alpha-2 codes
  upload_status    TEXT        NOT NULL DEFAULT 'pending'
                               CHECK (upload_status IN ('pending', 'processing', 'live', 'rejected')),
  ipfs_cid         TEXT,                             -- IPFS content identifier for master file
  revenue_split    JSONB       DEFAULT '{}',         -- Revenue split configuration
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

-- ── Community Threads ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS threads (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         TEXT        NOT NULL,
  body          TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS thread_replies (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id     UUID        NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body          TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Governance Proposals ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS proposals (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT        NOT NULL,
  description     TEXT        NOT NULL,
  proposal_type   TEXT        NOT NULL
                              CHECK (proposal_type IN ('fee_adjustment', 'token_tier_update', 'treasury_allocation', 'content_standards', 'platform_upgrade', 'other')),
  voting_deadline TIMESTAMPTZ NOT NULL,
  votes_for       INTEGER     NOT NULL DEFAULT 0,
  votes_against   INTEGER     NOT NULL DEFAULT 0,
  status          TEXT        NOT NULL DEFAULT 'active'
                              CHECK (status IN ('active', 'passed', 'failed')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proposal_votes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID        NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  direction   TEXT        NOT NULL CHECK (direction IN ('for', 'against')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(proposal_id, user_id) -- One vote per user per proposal
);

-- ── Secondary Market Listings ────────────────────────────────
CREATE TABLE IF NOT EXISTS market_listings (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  film_id         UUID        REFERENCES films(id) ON DELETE SET NULL,  -- Optional link to DB film
  film_title      TEXT        NOT NULL,
  film_image      TEXT,
  token_type      TEXT        NOT NULL CHECK (token_type IN ('Rental', 'Ownership', 'Collector')),
  token_number    TEXT,
  ask_price       INTEGER     NOT NULL CHECK (ask_price > 0), -- In CineCredits
  description     TEXT,
  status          TEXT        NOT NULL DEFAULT 'active'
                              CHECK (status IN ('active', 'sold', 'cancelled')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── CinePass Subscriptions (history/audit) ───────────────────
CREATE TABLE IF NOT EXISTS cinepass_subscriptions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier          TEXT        NOT NULL CHECK (tier IN ('standard', 'plus', 'collector')),
  started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at    TIMESTAMPTZ,
  status        TEXT        NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active', 'cancelled', 'expired'))
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_sessions_user        ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_film        ON sessions(film_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user    ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_film    ON transactions(film_id);
CREATE INDEX IF NOT EXISTS idx_watermarks_session   ON watermarks(session_id);
CREATE INDEX IF NOT EXISTS idx_films_filmmaker      ON films(filmmaker_id);
CREATE INDEX IF NOT EXISTS idx_films_created        ON films(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_threads_user         ON threads(user_id);
CREATE INDEX IF NOT EXISTS idx_threads_created      ON threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_thread_replies_thread ON thread_replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_thread_replies_user  ON thread_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_proposals_user       ON proposals(user_id);
CREATE INDEX IF NOT EXISTS idx_proposals_created    ON proposals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proposal_votes_proposal ON proposal_votes(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_votes_user  ON proposal_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_market_listings_seller ON market_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_market_listings_status ON market_listings(status);
CREATE INDEX IF NOT EXISTS idx_market_listings_created ON market_listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cinepass_subs_user   ON cinepass_subscriptions(user_id);

-- ── Row-Level Security (enable, policies to be added per use-case) ──
ALTER TABLE users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE films        ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE watermarks   ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads      ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals    ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cinepass_subscriptions ENABLE ROW LEVEL SECURITY;
