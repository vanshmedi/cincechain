# CineChain — Blockchain Layer

ERC-1155 film license tokens with atomic revenue distribution and EIP-2981 royalties on Sepolia/Ethereum.

## Architecture

```
User (CineCredits) → Platform Backend → Smart Contract → Rights Holders (USDC)
                                      ↘ NFT → Buyer's Wallet
```

See `CineChain_Blockchain_Architecture.docx` for the full spec.

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Fill in RPC_URL, PLATFORM_PRIVATE_KEY, ETHERSCAN_API_KEY, NFT_STORAGE_API_KEY
```

### 3. Compile contracts

```bash
npm run compile
```

### 4. Run tests

```bash
npm test
# With gas report:
npm run test:gas
```

### 5. Deploy to Sepolia

Get Sepolia ETH from https://sepoliafaucet.com and Sepolia USDC from Circle's testnet faucet.

```bash
npm run deploy:sepolia
```

Copy the `CINECHAIN_CONTRACT_ADDRESS` output into your `.env`.

---

## Contract: `CineChain.sol`

Single ERC-1155 contract. Owner is the platform backend wallet.

| Function | Caller | What it does |
|---|---|---|
| `registerFilm()` | Backend (onlyOwner) | Register film, set revenue split |
| `purchaseOwnership(filmId, buyer)` | Backend (onlyOwner) | Pull USDC from pool, distribute, mint Ownership NFT |
| `purchaseRental(filmId, buyer)` | Backend (onlyOwner) | Same, mints 48hr Rental token |
| `purchaseCollector(filmId, buyer)` | Backend (onlyOwner) | Same, mints resalable Collector NFT |
| `resaleTransfer(tokenId, seller, buyer, price)` | Backend (onlyOwner) | Pay royalties, transfer USDC, move NFT atomically |
| `hasValidToken(tokenId, address)` | Frontend/Backend | Check access (respects rental expiry) |
| `uri(tokenId)` | Wallets/Marketplaces | Returns IPFS metadata URI |

### Token Tiers

| Tier | ID | Transferable | Resalable |
|---|---|---|---|
| Rental | 0 | ❌ | ❌ |
| Ownership | 1 | Once (gift via owner) | ❌ |
| Collector | 2 | ✅ | ✅ (10% royalty) |

### Token ID Encoding

```
[filmId 128 bits] | [tier 8 bits] | [sequence 64 bits]
```

### Revenue Split (Primary Sale)

Defined per-film at `registerFilm()`. Must sum to 10,000 BPS (100%).
Example: `[{filmmaker, 6500}, {coproducer, 1200}, {talent, 1000}, {platform, 500}]`

### Resale Split (Collector tokens)

Hard-coded in contract:
- 10% → Original filmmaker (EIP-2981)
- 5% → Platform
- 85% → Seller

---

## Backend Service: `services/blockchain.js`

```js
import { initBlockchain, purchaseFilm, executeResale } from "./services/blockchain.js";

initBlockchain();

// After credits deducted from DB:
const { tokenId, txHash, etherscanUrl } = await purchaseFilm(
  filmId,       // on-chain film ID
  "ownership",  // "rental" | "ownership" | "collector"
  buyerWallet,  // 0x...
  10.00         // USDC amount
);
```

---

## Routes: `routes/films.js`

| Method | Path | Description |
|---|---|---|
| POST | `/films/:filmId/purchase` | Buy a film (deducts credits, calls contract) |
| POST | `/films/resale/:tokenId/list` | List a Collector token for resale |
| POST | `/films/resale/:tokenId/buy` | Buy a listed Collector token |
| GET | `/films/:filmId/watch` | Gate watch page (checks on-chain ownership) |

---

## Security Notes

- `onlyOwner` on all disbursement functions — user never calls contract directly
- `ReentrancyGuard` on all state-changing functions
- Checks-Effects-Interactions pattern throughout
- Credit deduction uses PostgreSQL row-level locking before any blockchain call
- Credit refund on blockchain failure
- EIP-2981 encodes royalties on-chain — enforceable on external marketplaces

---

## Production Checklist

- [ ] Replace Sepolia with Polygon zkEVM (lower gas)
- [ ] Multi-sig wallet for `owner` (Gnosis Safe)
- [ ] 48hr delay on large USDC transfers from pool
- [ ] Trail of Bits audit before mainnet
- [ ] Replace `PLATFORM_PRIVATE_KEY` env var with AWS KMS / Hashicorp Vault
- [ ] Monitoring: set up Tenderly alerts on `ResaleExecuted` and `FilmPurchased`




🔥 4. CONNECT WORKER

In your main backend:

import { startFilmWorker } from "./blockchain/workers/filmWorker.js";

startFilmWorker();
🔥 5. PURCHASE FLOW (ADD THIS ONE LINE)

Inside your existing route after purchase:

await supabase.from("sessions").insert({
  user_id: userId,
  film_id: filmId,
  token_id: blockchainResult.tokenId,
  status: "active",
});
⚠️ CRITICAL FIX (DON’T SKIP)

Your schema currently:

filmmaker_id UUID ❌

👉 Blockchain needs wallet

🔧 ADD THIS:
ALTER TABLE users ADD COLUMN wallet_address TEXT;
🧠 FULL FLOW (NOW WORKING)
Upload film → DB (upload_status = live)
        ↓
Worker picks it
        ↓
Poster → IPFS
        ↓
registerFilm()
        ↓
on_chain_id saved
        ↓
User purchases
        ↓
NFT minted (unique tokenId)
        ↓
sessions updated
        ↓
User owns film
🔥 FINAL ANSWER (your exact concern)

multiple users owning same movie?

👉 Already solved:

Same film_id
Different token_id
Stored in sessions
🚀 You are now at
✔ scalable ownership system
✔ auto on-chain sync
✔ NFT per user
✔ backend fully integrated