import { useState } from "react";
import { Button } from "../components/ui/Button";
import { RainbowStripe } from "../components/ui/RainbowStripe";
import { marketListings } from "../data/mockData";
import { ArrowUpRight, TrendingUp, Wallet, ShieldCheck, RefreshCw } from "lucide-react";

interface MarketScreenProps {
  cineCredits: number;
  setView: (view: string) => void;
}

export function MarketScreen({ cineCredits, setView }: MarketScreenProps) {
  const [filter, setFilter] = useState<"All" | "Rental" | "Ownership" | "Collector">("All");

  const filtered = filter === "All"
    ? marketListings
    : marketListings.filter((l) => l.tokenType === filter);

  return (
    <div className="w-full pt-16 bg-surface min-h-screen">
      {/* Header */}
      <div className="w-full bg-on-surface pt-20 pb-16 relative overflow-hidden">
        <RainbowStripe className="absolute top-0 left-0 h-3 w-full" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end">
            <div>
              <div className="inline-flex items-center space-x-2 bg-surface-variant/10 border border-surface-variant/20 px-4 py-2 mb-6">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="font-label text-xs uppercase tracking-widest text-outline-variant">
                  Secondary Market
                </span>
              </div>
              <h1 className="text-6xl md:text-8xl font-headline font-black uppercase tracking-tighter text-surface-container-lowest mb-4">
                Market
              </h1>
              <p className="text-xl font-body text-surface-variant max-w-2xl">
                Buy and sell Film License Tokens. 10% royalty auto-distributed to filmmakers on every resale.
              </p>
            </div>
            <div className="mt-8 md:mt-0 flex items-center bg-surface-container-lowest/10 border border-surface-variant/20 p-4">
              <Wallet className="h-5 w-5 text-primary mr-3" />
              <div>
                <p className="font-label text-xs uppercase tracking-widest text-outline-variant">Your Balance</p>
                <p className="font-headline font-black text-2xl text-surface-container-lowest">{cineCredits.toLocaleString()} CC</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Market stats */}
      <div className="bg-surface-container border-b border-outline-variant/30 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-4 gap-8 text-center">
            {[
              { label: "Active Listings", value: marketListings.length.toString(), color: "text-on-surface" },
              { label: "24h Volume", value: "14,200 CC", color: "text-primary" },
              { label: "Filmmaker Royalties Paid", value: "12,420 CC", color: "text-tertiary" },
              { label: "Protocol Fee", value: "5%", color: "text-secondary" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className={`font-headline font-black text-2xl ${stat.color}`}>{stat.value}</p>
                <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Filter tabs */}
        <div className="flex items-center justify-between mb-10 border-b-2 border-on-surface pb-4">
          <div className="flex space-x-6 overflow-x-auto">
            {(["All", "Rental", "Ownership", "Collector"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`font-label text-sm uppercase tracking-widest whitespace-nowrap transition-colors pb-1 ${
                  filter === f
                    ? "text-primary font-bold border-b-2 border-primary"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button className="hidden md:flex items-center font-label text-sm uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>

        {/* Listings grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filtered.map((listing) => {
            const canAfford = cineCredits >= listing.askPrice;
            const premiumPct = Math.round(((listing.askPrice - listing.originalPrice) / listing.originalPrice) * 100);

            return (
              <div
                key={listing.id}
                className="bg-surface-container-lowest border border-outline-variant shadow-film hover:-translate-y-1 hover:shadow-film-hover transition-all duration-300 overflow-hidden relative group"
              >
                {/* Token type badge */}
                <div
                  className={`absolute top-4 left-4 z-10 font-label text-xs uppercase tracking-widest px-3 py-1 font-bold ${
                    listing.tokenType === "Collector"
                      ? "bg-secondary text-white"
                      : listing.tokenType === "Ownership"
                      ? "bg-primary text-white"
                      : "bg-on-surface text-surface-container-lowest"
                  }`}
                >
                  {listing.tokenType}
                </div>

                <div className="flex">
                  <div className="w-40 h-40 flex-shrink-0 relative overflow-hidden">
                    <img
                      src={listing.filmImage}
                      alt={listing.filmTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-surface-container-lowest/20" />
                  </div>

                  <div className="flex-1 p-6">
                    <h3 className="font-headline font-bold text-xl uppercase tracking-tight mb-1">
                      {listing.filmTitle}
                    </h3>
                    <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-4">
                      Token {listing.tokenNumber} · Seller {listing.seller}
                    </p>

                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-1">Ask Price</p>
                        <p className="font-headline font-black text-2xl">{listing.askPrice.toLocaleString()} CC</p>
                        <p className="font-label text-xs text-on-surface-variant">= ${(listing.askPrice * 0.10).toFixed(0)}</p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block font-label text-xs uppercase tracking-widest px-2 py-1 font-bold ${
                            premiumPct > 0 ? "bg-tertiary/10 text-tertiary" : "bg-error/10 text-error"
                          }`}
                        >
                          {premiumPct > 0 ? "+" : ""}{premiumPct}% vs mint
                        </span>
                      </div>
                    </div>

                    <div className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-4 space-y-1">
                      <div className="flex justify-between">
                        <span>Filmmaker royalty (10%)</span>
                        <span>{Math.round(listing.askPrice * 0.10).toLocaleString()} CC</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Protocol fee (5%)</span>
                        <span>{Math.round(listing.askPrice * 0.05).toLocaleString()} CC</span>
                      </div>
                      <div className="flex justify-between font-bold text-on-surface">
                        <span>Seller receives</span>
                        <span>{listing.sellerReceives.toLocaleString()} CC</span>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      variant={canAfford ? "primary" : "outline"}
                      size="sm"
                      disabled={!canAfford}
                    >
                      {canAfford ? "Buy Now" : `Need ${(listing.askPrice - cineCredits).toLocaleString()} more CC`}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-24">
            <p className="font-headline font-bold text-3xl uppercase tracking-tight text-on-surface-variant mb-4">
              No {filter} listings
            </p>
            <p className="font-body text-on-surface-variant">Check back soon or browse other token types.</p>
          </div>
        )}

        {/* Fee info */}
        <div className="mt-16 bg-surface-container-lowest border border-outline-variant p-8 relative overflow-hidden">
          <RainbowStripe className="absolute top-0 left-0 h-1" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { label: "Filmmaker Royalty", value: "10%", desc: "Auto-distributed on every resale" },
              { label: "Protocol Fee", value: "5%", desc: "To CineChain treasury" },
              { label: "Seller Receives", value: "85%", desc: "Of the final sale price" },
            ].map((item) => (
              <div key={item.label}>
                <p className="font-headline font-black text-4xl text-primary mb-1">{item.value}</p>
                <p className="font-label text-sm uppercase tracking-widest font-bold mb-1">{item.label}</p>
                <p className="font-body text-sm text-on-surface-variant">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
