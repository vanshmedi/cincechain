-- ─────────────────────────────────────────────
-- 🔥 FULL RESET (DEV ONLY)
-- ─────────────────────────────────────────────

DROP TABLE IF EXISTS proposal_votes CASCADE;
DROP TABLE IF EXISTS proposals CASCADE;
DROP TABLE IF EXISTS thread_replies CASCADE;
DROP TABLE IF EXISTS threads CASCADE;
DROP TABLE IF EXISTS market_listings CASCADE;
DROP TABLE IF EXISTS cinepass_subscriptions CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS watermarks CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS films CASCADE;
DROP TABLE IF EXISTS users CASCADE;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── USERS ────────────────────────────────────
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE,
  email TEXT UNIQUE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  wallet_connected BOOLEAN NOT NULL DEFAULT FALSE,
  credit_balance INTEGER NOT NULL DEFAULT 2500,
  cinepass_tier TEXT
    CHECK (cinepass_tier IN ('standard','plus','collector')),
  kyc_status TEXT NOT NULL DEFAULT 'none'
    CHECK (kyc_status IN ('none','pending','approved','rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── FILMS ────────────────────────────────────
CREATE TABLE films (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filmmaker_id UUID REFERENCES users(id) ON DELETE SET NULL,
  content_id TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  director TEXT,
  year INTEGER,
  genre TEXT,
  runtime INTEGER,
  poster_url TEXT,
  genres TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  territories TEXT[] DEFAULT '{}',
  upload_status TEXT DEFAULT 'pending'
    CHECK (upload_status IN ('pending','processing','live','rejected')),
  ipfs_cid TEXT,
  revenue_split JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  on_chain_id INTEGER
);

-- ── SESSIONS ─────────────────────────────────
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  film_id UUID NOT NULL REFERENCES films(id) ON DELETE CASCADE,
  token_id TEXT NOT NULL,
  device_fingerprint TEXT NOT NULL,
  ip_address INET,
  session_key_hash TEXT NOT NULL,
  watermark_id UUID,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active','expired','revoked')),
  started_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── WATERMARKS ───────────────────────────────
CREATE TABLE watermarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  device_fingerprint TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  nonce TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active','flagged','cleared'))
);

-- FK (safe now since fresh DB)
ALTER TABLE sessions
ADD CONSTRAINT fk_session_watermark
FOREIGN KEY (watermark_id) REFERENCES watermarks(id) ON DELETE SET NULL;

-- ── TRANSACTIONS ─────────────────────────────
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  film_id UUID REFERENCES films(id) ON DELETE SET NULL,
  token_tier TEXT
    CHECK (token_tier IN ('rental','ownership','collector')),
  credits_spent INTEGER NOT NULL CHECK (credits_spent >= 0),
  tx_hash TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── THREADS ──────────────────────────────────
CREATE TABLE threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE thread_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── PROPOSALS ────────────────────────────────
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  proposal_type TEXT,
  voting_deadline TIMESTAMPTZ,
  votes_for INTEGER DEFAULT 0,
  votes_against INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE proposal_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  direction TEXT CHECK (direction IN ('for','against')),
  UNIQUE(proposal_id, user_id)
);

-- ── MARKET ───────────────────────────────────
CREATE TABLE market_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  film_id UUID REFERENCES films(id) ON DELETE SET NULL,
  film_title TEXT,
  film_image TEXT,
  token_type TEXT CHECK (token_type IN ('Rental','Ownership','Collector')),
  token_number TEXT,
  ask_price INTEGER CHECK (ask_price > 0),
  description TEXT,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active','sold','cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── SUBSCRIPTIONS ────────────────────────────
CREATE TABLE cinepass_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tier TEXT CHECK (tier IN ('standard','plus','collector')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active','cancelled','expired'))
);

-- ── INDEXES ──────────────────────────────────
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_film ON sessions(film_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_film ON transactions(film_id);
CREATE INDEX idx_watermarks_session ON watermarks(session_id);
CREATE INDEX idx_films_filmmaker ON films(filmmaker_id);
CREATE INDEX idx_films_created ON films(created_at DESC);
CREATE INDEX idx_threads_user ON threads(user_id);
CREATE INDEX idx_threads_created ON threads(created_at DESC);
CREATE INDEX idx_thread_replies_thread ON thread_replies(thread_id);
CREATE INDEX idx_thread_replies_user ON thread_replies(user_id);
CREATE INDEX idx_proposals_user ON proposals(user_id);
CREATE INDEX idx_proposals_created ON proposals(created_at DESC);
CREATE INDEX idx_proposal_votes_proposal ON proposal_votes(proposal_id);
CREATE INDEX idx_proposal_votes_user ON proposal_votes(user_id);
CREATE INDEX idx_market_listings_seller ON market_listings(seller_id);
CREATE INDEX idx_market_listings_status ON market_listings(status);
CREATE INDEX idx_market_listings_created ON market_listings(created_at DESC);
CREATE INDEX idx_cinepass_subs_user ON cinepass_subscriptions(user_id);

create or replace function increment_credits(p_user_id uuid, p_amount int)
returns void language sql as $$
  update users set credit_balance = credit_balance + p_amount
  where id = p_user_id;
$$;

create or replace function deduct_credits(p_user_id uuid, p_amount int)
returns boolean language plpgsql as $$
declare sufficient boolean;
begin
  select credit_balance >= p_amount into sufficient
  from users where id = p_user_id for update;
  if sufficient then
    update users set credit_balance = credit_balance - p_amount
    where id = p_user_id;
  end if;
  return sufficient;
end;
$$;
