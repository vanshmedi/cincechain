import { useState, useEffect } from "react";
import { Polaroid } from "../components/ui/Polaroid";
import { RainbowStripe } from "../components/ui/RainbowStripe";
import { Hexagon, Lock, ShoppingBag, Tag, CheckCircle2, Wallet, CreditCard, LogIn } from "lucide-react";
import { Button } from "../components/ui/Button";
import type { DbUser } from "../lib/supabase";
import { getUserActiveListings, createMarketListing, cancelMarketListing, subscribeToCinePass } from "../lib/auth";

interface VaultScreenProps {
  setView: (view: string, filmId?: string, curatorHandle?: string, marketItemId?: number) => void;
  currentUser: DbUser | null;
  onConnect: () => void;
  onSubscribe: (tier: string, bonus: number) => void;
  cineCredits: number;
}

type VaultTab = "collection" | "cinepass";

const collection = [
  { id: 1, title: "Neon Dreams", subtitle: "Collector Token #042", image: "https://picsum.photos/seed/film1/400/300", rotation: "-rotate-2", tokenType: "Collector" },
  { id: 2, title: "The Last Heist", subtitle: "Ownership Token #118", image: "https://picsum.photos/seed/film2/400/300", rotation: "rotate-3", tokenType: "Ownership" },
  { id: 3, title: "Concrete Jungle", subtitle: "Collector Token #005", image: "https://picsum.photos/seed/film6/400/300", rotation: "-rotate-1", tokenType: "Collector" },
];

const transactions = [
  { date: "2026-03-20", type: "Mint", asset: "Neon Dreams — Collector #042", amount: "-4,000 CC", usd: "$400", status: "Confirmed" },
  { date: "2026-02-15", type: "Royalty", asset: "The Last Heist — Ownership #118", amount: "+120 CC", usd: "$12", status: "Claimed" },
  { date: "2026-01-08", type: "Mint", asset: "Concrete Jungle — Collector #005", amount: "-1,500 CC", usd: "$150", status: "Confirmed" },
  { date: "2025-12-20", type: "Transfer", asset: "Whispers in the Dark — Rental #088", amount: "0 CC", usd: "$0", status: "Sent" },
];

// CinePass tiers matching PRD: Standard ($12/80cc), Plus ($22/180cc), Collector ($45/420cc + free token)
const cinePassTiers = [
  {
    id: "standard",
    name: "Standard",
    priceUSD: 12,
    credits: 80,
    features: [
      "80 CineCredits per month",
      "Unlimited streaming of funded films",
      "Access to public film catalog",
      "Community forum participation",
      "Standard 1080p quality",
    ],
    color: "on-surface",
    recommended: false,
  },
  {
    id: "plus",
    name: "Plus",
    priceUSD: 22,
    credits: 180,
    features: [
      "180 CineCredits per month",
      "All Standard features",
      "4K / HDR streaming",
      "Endorse films & earn reputation",
      "Early access to new mints",
      "Priority support",
    ],
    color: "primary",
    recommended: true,
  },
  {
    id: "collector",
    name: "Collector",
    priceUSD: 45,
    credits: 420,
    features: [
      "420 CineCredits per month",
      "All Plus features",
      "1 free Collector Token per quarter",
      "Governance voting rights",
      "Revenue share from Collector pool",
      "Filmmaker upload credentials",
      "Annual NFT badge",
    ],
    color: "secondary",
    recommended: false,
  },
];

// Listing modal
function ListingModal({ item, onClose, onList }: { item: typeof collection[0]; onClose: () => void; onList: (price: number, desc: string) => void }) {
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface-container-lowest border border-outline-variant p-8 shadow-film max-w-md w-full relative overflow-hidden" onClick={e => e.stopPropagation()}>
        <RainbowStripe className="absolute top-0 left-0 h-2" />
        <h3 className="text-xl font-headline font-bold uppercase tracking-tight mb-2">List on Market</h3>
        <p className="font-body text-sm text-on-surface-variant mb-6">{item.title} — {item.subtitle}</p>
        <div className="mb-4">
          <label className="block font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-2">Ask Price (CC) *</label>
          <input
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="e.g. 5000"
            min={1}
            className="w-full bg-surface-container-low border border-outline-variant p-3 font-body text-on-surface focus:outline-none focus:border-primary"
          />
        </div>
        <div className="mb-6">
          <label className="block font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-2">Description (optional)</label>
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="Add a note for buyers..."
            rows={2}
            className="w-full bg-surface-container-low border border-outline-variant p-3 font-body text-on-surface focus:outline-none focus:border-primary resize-none"
          />
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={() => onList(parseInt(price) || 0, desc)} disabled={!price || parseInt(price) <= 0} className="flex-1">
            <Tag className="h-4 w-4 mr-2" />
            List for Sale
          </Button>
        </div>
      </div>
    </div>
  );
}

export function VaultScreen({ setView, currentUser, onConnect, onSubscribe, cineCredits }: VaultScreenProps) {
  const [activeTab, setActiveTab] = useState<VaultTab>("collection");
  const [activeListings, setActiveListings] = useState<Record<string, boolean>>({});
  const [listingItem, setListingItem] = useState<typeof collection[0] | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      loadActiveListings();
    }
  }, [currentUser]);

  const loadActiveListings = async () => {
    if (!currentUser) return;
    try {
      const listings = await getUserActiveListings(currentUser.id);
      const listed: Record<string, boolean> = {};
      listings.forEach(l => {
        // Match by film title
        collection.forEach(c => {
          if (c.title === l.film_title) {
            listed[c.id.toString()] = true;
          }
        });
      });
      setActiveListings(listed);
    } catch (err) {
      console.error("Failed to load listings:", err);
    }
  };

  const handleList = async (price: number, desc: string) => {
    if (!currentUser || !listingItem || price <= 0) return;
    if (currentUser.wallet_address?.startsWith("privy-")) {
      alert("Connect a wallet to access this feature");
      return;
    }
    try {
      await createMarketListing(
        currentUser.id,
        listingItem.title,
        listingItem.image,
        listingItem.tokenType,
        listingItem.subtitle.split("#")[1] ? "#" + listingItem.subtitle.split("#")[1] : "",
        price,
        desc || undefined
      );
      setActiveListings(prev => ({ ...prev, [listingItem.id.toString()]: true }));
      setListingItem(null);
      alert("Token listed on the secondary market!");
    } catch (err) {
      console.error("Failed to create listing:", err);
      alert("Failed to create listing. Check console.");
    }
  };

  const tabs: { id: VaultTab; label: string }[] = [
    { id: "collection", label: "Collection" },
    { id: "cinepass", label: "CinePass" },
  ];

  return (
    <div className="w-full pt-16 bg-surface-container-low min-h-screen">
      {/* Listing Modal */}
      {listingItem && (
        <ListingModal item={listingItem} onClose={() => setListingItem(null)} onList={handleList} />
      )}

      {/* Rainbow Header */}
      <div className="w-full bg-on-surface pt-20 pb-12 relative overflow-hidden">
        <RainbowStripe className="absolute top-0 left-0 h-4" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-surface-container-lowest rounded-full mb-6 shadow-film">
            <Lock className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-5xl md:text-7xl font-headline font-black uppercase tracking-tighter text-surface-container-lowest mb-4">
            The Vault
          </h1>
          <p className="text-xl font-body text-surface-variant max-w-2xl mx-auto">
            Your decentralized collection. Assets held securely on-chain.
          </p>
          <div className="mt-4 font-label text-xs uppercase tracking-widest text-outline-variant">
            All transactions in CineCredits (CC) · 1 CC = $0.10
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] font-headline font-black text-surface-variant/5 select-none pointer-events-none whitespace-nowrap">
          SECURE
        </div>
      </div>

      {/* Tab Bar */}
      <div className="w-full bg-surface-container border-b border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-label text-sm uppercase tracking-widest transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "text-primary font-bold border-primary"
                  : "text-on-surface-variant hover:text-on-surface border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Marquee Ticker */}
      <div className="w-full bg-primary text-white py-3 overflow-hidden border-b border-outline-variant/30 relative flex items-center">
        <div className="flex whitespace-nowrap animate-[marquee_15s_linear_infinite]">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="mx-8 font-label text-xs uppercase tracking-widest flex items-center">
              <Hexagon className="h-3 w-3 mr-2" />
              Royalty distribution for "The Last Heist" processing
            </span>
          ))}
        </div>
      </div>

      {activeTab === "collection" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Collection Grid */}
          <section className="mb-24">
            <div className="flex justify-between items-end mb-12 border-b-2 border-on-surface pb-4">
              <h2 className="text-4xl font-headline font-black uppercase tracking-tighter">Your Collection</h2>
              <span className="font-label text-sm uppercase tracking-widest text-on-surface-variant font-bold">
                {collection.length} Assets
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
              {collection.map((item) => {
                const isListed = activeListings[item.id.toString()];
                return (
                  <div key={item.id} className={`transform ${item.rotation} relative cursor-pointer group`}>
                    <Polaroid
                      imageUrl={item.image}
                      title={item.title}
                      subtitle={item.subtitle}
                    />
                    {/* Token type badge */}
                    <div className={`absolute top-2 left-2 font-label text-xs uppercase tracking-widest px-2 py-1 font-bold ${
                      item.tokenType === "Collector" ? "bg-secondary text-white" : "bg-primary text-white"
                    }`}>
                      {item.tokenType}
                    </div>
                    {/* Listed for Sale tag — Feature 4 */}
                    {isListed && (
                      <div className="absolute top-2 right-2 bg-tertiary text-white font-label text-xs uppercase tracking-widest px-2 py-1 font-bold flex items-center z-10">
                        <ShoppingBag className="h-3 w-3 mr-1" />
                        Listed for Sale
                      </div>
                    )}
                    {/* Hover: list on market */}
                    <div className="absolute inset-0 bg-on-surface/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 mx-2 mb-8">
                      {isListed ? (
                        <Button size="sm" variant="outline" className="border-white text-white hover:bg-white hover:text-on-surface" onClick={() => {
                          alert("Item delisted! (To delist from DB, navigate to Market page)");
                          setActiveListings(prev => {
                            const copy = { ...prev };
                            delete copy[item.id.toString()];
                            return copy;
                          });
                        }}>
                          Delist
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => currentUser ? setListingItem(item) : onConnect()}>
                          List on Market
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Transaction Ledger */}
          <section>
            <div className="flex justify-between items-end mb-8 border-b-2 border-on-surface pb-4">
              <h2 className="text-4xl font-headline font-black uppercase tracking-tighter">Transaction Ledger</h2>
              <button className="font-label text-sm uppercase tracking-widest text-primary hover:text-on-surface transition-colors font-bold" onClick={() => alert('Your USDC withdrawal request has been queued. Settlement occurs on the 1st of every month.')}>
                Export CSV
              </button>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant overflow-x-auto shadow-film">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container border-b border-outline-variant font-label text-xs uppercase tracking-widest text-on-surface-variant">
                    <th className="p-4 font-bold">Date</th>
                    <th className="p-4 font-bold">Type</th>
                    <th className="p-4 font-bold">Asset</th>
                    <th className="p-4 font-bold text-right">Amount (CC)</th>
                    <th className="p-4 font-bold text-right">USD Value</th>
                    <th className="p-4 font-bold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="font-body text-sm">
                  {transactions.map((tx, i) => (
                    <tr key={i} className="border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors">
                      <td className="p-4 text-on-surface-variant font-mono">{tx.date}</td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-1 text-xs font-bold uppercase tracking-widest ${
                          tx.type === "Mint" ? "bg-primary/10 text-primary" :
                          tx.type === "Royalty" ? "bg-tertiary/10 text-tertiary" :
                          "bg-secondary/10 text-secondary"
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="p-4 font-bold">{tx.asset}</td>
                      <td className={`p-4 text-right font-mono font-bold ${tx.amount.startsWith("+") ? "text-tertiary" : "text-on-surface"}`}>
                        {tx.amount}
                      </td>
                      <td className="p-4 text-right font-mono text-on-surface-variant">{tx.usd}</td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center text-xs uppercase tracking-widest font-bold text-on-surface-variant">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            tx.status === "Confirmed" || tx.status === "Claimed" ? "bg-tertiary" : "bg-outline"
                          }`} />
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* CinePass Tab — Feature 5 */}
      {activeTab === "cinepass" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Current Plan */}
          {currentUser?.cinepass_tier && (
            <div className="bg-primary/5 border border-primary/20 p-6 mb-10 flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle2 className="h-6 w-6 text-primary mr-3" />
                <div>
                  <h3 className="font-headline font-bold text-lg uppercase tracking-tight text-primary">Active Plan</h3>
                  <p className="font-body text-sm text-on-surface-variant">
                    You are subscribed to <strong>{currentUser.cinepass_tier.charAt(0).toUpperCase() + currentUser.cinepass_tier.slice(1)}</strong>
                  </p>
                </div>
              </div>
              <span className="font-headline font-black text-2xl text-primary">{cineCredits.toLocaleString()} CC</span>
            </div>
          )}

          {!currentUser && (
            <div className="bg-surface-container-lowest border border-outline-variant p-8 text-center mb-10">
              <LogIn className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-headline font-bold text-xl uppercase tracking-tight mb-2">Sign in to Subscribe</h3>
              <p className="font-body text-on-surface-variant mb-4">Connect your wallet to view subscription options.</p>
              <Button onClick={onConnect}>Connect Wallet</Button>
            </div>
          )}

          <h2 className="text-4xl font-headline font-black uppercase tracking-tighter mb-2">CinePass Plans</h2>
          <p className="font-body text-on-surface-variant mb-8">Your all-access pass to the decentralized cinema collective.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {cinePassTiers.map((plan) => {
              const isRecommended = plan.recommended;
              const isCurrentPlan = currentUser?.cinepass_tier === plan.id;
              const isSelected = selectedPlan === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`relative overflow-hidden transition-all duration-300 ${
                    isRecommended ? "md:-translate-y-4 shadow-film" : "shadow-film"
                  }`}
                >
                  {isRecommended ? (
                    <div className="absolute top-0 left-0 right-0 h-2 rainbow-bg" />
                  ) : (
                    <div className="absolute top-0 left-0 right-0 h-2 bg-outline-variant/30" />
                  )}

                  <div className={`border p-8 pt-10 ${
                    isRecommended
                      ? "bg-on-surface text-surface-container-lowest border-on-surface"
                      : "bg-surface-container-lowest border-outline-variant"
                  }`}>
                    {isRecommended && (
                      <div className="absolute top-5 right-5 bg-primary text-white font-label text-xs uppercase tracking-widest px-3 py-1 font-bold">
                        Recommended
                      </div>
                    )}
                    {isCurrentPlan && (
                      <div className="absolute top-5 right-5 bg-tertiary text-white font-label text-xs uppercase tracking-widest px-3 py-1 font-bold flex items-center">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Current
                      </div>
                    )}

                    <h3 className={`text-3xl font-headline font-black uppercase tracking-tight mb-1 ${
                      isRecommended ? "text-surface-container-lowest" : "text-on-surface"
                    }`}>
                      {plan.name}
                    </h3>

                    <div className="mb-8">
                      <span className={`text-5xl font-headline font-black ${
                        isRecommended ? "text-primary" : "text-on-surface"
                      }`}>
                        ${plan.priceUSD}
                      </span>
                      <span className={`ml-2 font-body text-sm ${
                        isRecommended ? "text-surface-variant" : "text-on-surface-variant"
                      }`}>
                        / month
                      </span>
                      <p className={`font-label text-xs uppercase tracking-widest mt-1 ${
                        isRecommended ? "text-outline-variant" : "text-outline"
                      }`}>
                        {plan.credits} CC / month
                      </p>
                    </div>

                    <ul className="space-y-3 mb-10">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className={`flex items-start text-sm font-body ${
                            isRecommended ? "text-surface-variant" : "text-on-surface-variant"
                          }`}
                        >
                          <CheckCircle2
                            className={`h-4 w-4 mr-3 mt-0.5 flex-shrink-0 ${
                              isRecommended ? "text-primary" : "text-tertiary"
                            }`}
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full ${
                        isRecommended
                          ? "bg-primary text-white hover:bg-white hover:text-primary border-none"
                          : ""
                      }`}
                      variant={isRecommended ? "primary" : "outline"}
                      size="lg"
                      disabled={isCurrentPlan}
                      onClick={() => {
                        if (!currentUser) {
                          onConnect();
                          return;
                        }
                        setSelectedPlan(plan.id);
                      }}
                    >
                      {isCurrentPlan ? "✓ Current Plan" : isSelected ? "✓ Selected" : plan.priceUSD > (cinePassTiers.find(t => t.id === currentUser?.cinepass_tier)?.priceUSD ?? 0) ? `Upgrade to ${plan.name}` : `Get ${plan.name}`}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Confirm subscription */}
          {selectedPlan && currentUser && (
            <div className="mt-16 text-center">
              <div className="inline-block bg-surface-container-lowest border-2 border-primary p-8 shadow-film">
                <CreditCard className="h-8 w-8 text-primary mx-auto mb-3" />
                <p className="font-headline font-bold text-2xl uppercase tracking-tight mb-2">
                  Subscribe to {cinePassTiers.find((p) => p.id === selectedPlan)?.name}
                </p>
                <p className="font-body text-on-surface-variant mb-6">
                  {cinePassTiers.find((p) => p.id === selectedPlan)?.credits} CC will be added to your wallet (simulated fiat purchase).
                </p>
                <Button 
                  size="lg" 
                  onClick={() => {
                    const pass = cinePassTiers.find(p => p.id === selectedPlan);
                    if (onSubscribe && pass) {
                      onSubscribe(pass.id, pass.credits);
                    }
                    setSelectedPlan(null);
                  }}
                >
                  Confirm Subscription
                </Button>
              </div>
            </div>
          )}

          <div className="mt-16 text-center">
            <p className="font-body text-sm text-on-surface-variant max-w-2xl mx-auto">
              All prices in USD for reference. Actual payment is in CineCredits (CC).{" "}
              <strong>1 CC = $0.10</strong>. Subscriptions auto-renew monthly. Cancel anytime.
              Protocol fee of 5% applies to all transactions on the platform.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
