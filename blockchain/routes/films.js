// blockchain/routes/films.js

import express from "express";
import { createClient } from "@supabase/supabase-js";
import {
  purchaseFilm,
  executeResale,
  checkAccess,
} from "../services/blockchain.js";

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─────────────────────────────────────────────
// CREDIT HELPERS
// ─────────────────────────────────────────────

async function deductCredits(userId, amount) {
  const { data, error } = await supabase.rpc("deduct_credits", {
    p_user_id: userId,
    p_amount: amount,
  });
  if (error) throw new Error(error.message);
  return data;
}

async function refundCredits(userId, amount) {
  await supabase.rpc("increment_credits", {
    p_user_id: userId,
    p_amount: amount,
  });
}

// ─────────────────────────────────────────────
// PURCHASE FILM (CORE FLOW)
// ─────────────────────────────────────────────

router.post("/:filmId/purchase", async (req, res) => {
  try {
    const userId = req.body.userId || (req.user && req.user.id);
    const { filmId } = req.params;
    const { tier } = req.body;

    if (!["rental", "ownership", "collector"].includes(tier)) {
      return res.status(400).json({ error: "Invalid tier" });
    }

    // ── Fetch film + user ─────────────────────
    const [{ data: film }, { data: user }] = await Promise.all([
      supabase
        .from("films")
        .select("*")
        .eq("id", filmId)
        .single(),

      supabase
        .from("users")
        .select("wallet_address, credit_balance")
        .eq("id", userId)
        .single(),
    ]);

    if (!film) return res.status(404).json({ error: "Film not found" });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (film.on_chain_id === null || film.on_chain_id === undefined) {
      return res.status(400).json({ error: "Film not on-chain yet" });
    }

    if (!user.wallet_address) {
      return res.status(400).json({ error: "Connect wallet first" });
    }

    // ── Price extraction ──────────────────────
    const split = film.revenue_split || {};
    const priceCredits = split[`${tier}_price_credits`];
    const priceUsdc = split[`${tier}_price_usdc`];

    if (!priceCredits || !priceUsdc) {
      return res.status(400).json({ error: "Price not configured" });
    }

    // ── Deduct credits ────────────────────────
    const ok = await deductCredits(userId, priceCredits);
    if (!ok) {
      return res.status(402).json({ error: "Insufficient credits" });
    }

    // ── Blockchain call ───────────────────────
    let result;
    try {
      result = await purchaseFilm(
  film.on_chain_id,
  tier,
  process.env.PLATFORM_WALLET,
  priceUsdc
);
    } catch (err) {
      await refundCredits(userId, priceCredits);
      return res.status(500).json({ error: "Blockchain failed" });
    }

    // ── Record transaction ────────────────────
    await supabase.from("transactions").insert({
      user_id: userId,
      film_id: filmId,
      token_tier: tier, // ✅ FIXED NAME
      credits_spent: priceCredits,
      tx_hash: result.txHash,
    });

    // ── STORE OWNERSHIP (CRITICAL) ────────────
    await supabase.from("sessions").insert({
      user_id: userId,
      film_id: filmId,
      token_id: result.tokenId, // unique NFT
      device_fingerprint: "web",
      session_key_hash: "temp",
      status: "active",
    });

    res.json({
      success: true,
      tokenId: result.tokenId,
      txHash: result.txHash,
      etherscan: result.etherscanUrl,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// LIST FOR RESALE
// ─────────────────────────────────────────────

router.post("/resale/list", async (req, res) => {
  const userId = req.body.userId || (req.user && req.user.id);
  const { tokenId, filmId, askPrice } = req.body;

  const { data: owned } = await supabase
    .from("sessions")
    .select("id")
    .eq("user_id", userId)
    .eq("token_id", tokenId)
    .eq("status", "active")
    .single();

  if (!owned) {
    return res.status(404).json({ error: "Not owner" });
  }

  const { data: film } = await supabase
    .from("films")
    .select("title, poster_url")
    .eq("id", filmId)
    .single();

  await supabase.from("market_listings").insert({
    seller_id: userId,
    film_id: filmId,
    film_title: film.title,
    film_image: film.poster_url,
    token_type: "collector",
    token_number: tokenId,
    ask_price: askPrice,
    status: "active",
  });

  res.json({ success: true });
});

// ─────────────────────────────────────────────
// BUY RESALE
// ─────────────────────────────────────────────

router.post("/resale/:listingId/buy", async (req, res) => {
  const buyerId = req.body.userId || (req.user && req.user.id);
  const { listingId } = req.params;

  const { data: listing } = await supabase
    .from("market_listings")
    .select("*, users!seller_id(wallet_address)")
    .eq("id", listingId)
    .eq("status", "active")
    .single();

  if (!listing) return res.status(404).json({ error: "Listing not found" });

  const { data: buyer } = await supabase
    .from("users")
    .select("wallet_address")
    .eq("id", buyerId)
    .single();

  const ok = await deductCredits(buyerId, listing.ask_price);
  if (!ok) return res.status(402).json({ error: "Insufficient credits" });

  let result;
  try {
    result = await executeResale(
      listing.token_number,
      process.env.PLATFORM_WALLET,
      process.env.PLATFORM_WALLET,
      listing.ask_price * 0.1
    );
  } catch (err) {
    await refundCredits(buyerId, listing.ask_price);
    return res.status(500).json({ error: "Blockchain failed" });
  }

  // Update DB
  await supabase
    .from("market_listings")
    .update({ status: "sold" })
    .eq("id", listingId);

  await supabase
    .from("sessions")
    .update({ user_id: buyerId })
    .eq("token_id", listing.token_number);

  res.json({ success: true, txHash: result.txHash });
});

// ─────────────────────────────────────────────
// WATCH (ACCESS CONTROL)
// ─────────────────────────────────────────────

router.get("/:filmId/watch", async (req, res) => {
  const userId = req.query.userId || (req.user && req.user.id);
  const { filmId } = req.params;

  const { data: user } = await supabase
    .from("users")
    .select("wallet_address")
    .eq("id", userId)
    .single();

  const { data: session } = await supabase
    .from("sessions")
    .select("token_id")
    .eq("user_id", userId)
    .eq("film_id", filmId)
    .eq("status", "active")
    .single();

  if (!session) return res.status(403).json({ error: "No access" });

  const valid = await checkAccess(session.token_id, user.wallet_address);

  if (!valid) {
    await supabase
      .from("sessions")
      .update({ status: "expired" })
      .eq("user_id", userId)
      .eq("film_id", filmId);

    return res.status(403).json({ error: "Token invalid" });
  }

  res.json({
    streamUrl: `https://stream.cinechain.io/${filmId}`,
  });
});

export default router;