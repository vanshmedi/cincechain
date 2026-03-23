import { useState, useEffect } from "react";
import { Button } from "../components/ui/Button";
import { RainbowStripe } from "../components/ui/RainbowStripe";
import { ShoppingBag, Tag, TrendingUp, ArrowUpRight, Filter, Hexagon, LogIn } from "lucide-react";
import { marketListings as mockListings } from "../data/mockData";
import type { DbUser, DbMarketListing } from "../lib/supabase";
import { fetchMarketListings, cancelMarketListing } from "../lib/auth";

interface MarketScreenProps {
  cineCredits: number;
  setView: (view: string, filmId?: number, curatorHandle?: string) => void;
  selectedMarketItem: number | null;
  currentUser: DbUser | null;
}

const tokenTypeColors: Record<string, string> = {
  Rental: "bg-tertiary/10 text-tertiary",
  Ownership: "bg-primary/10 text-primary",
  Collector: "bg-secondary/10 text-secondary",
};

export function MarketScreen({ cineCredits, setView, selectedMarketItem, currentUser }: MarketScreenProps) {
  const [filterType, setFilterType] = useState<string>("All");
  const [dbListings, setDbListings] = useState<DbMarketListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDbListings();
  }, []);

  const loadDbListings = async () => {
    setLoading(true);
    const listings = await fetchMarketListings();
    setDbListings(listings);
    setLoading(false);
  };

  const handleDelist = async (listingId: string) => {
    if (!currentUser) return;
    try {
      await cancelMarketListing(listingId, currentUser.id);
      setDbListings(prev => prev.filter(l => l.id !== listingId));
      alert("Listing cancelled.");
    } catch (err) {
      console.error("Delist failed:", err);
    }
  };

  const handleBuyDbListing = (listing: DbMarketListing) => {
    if (!currentUser) {
      alert("Connect your wallet to purchase.");
      return;
    }
    if (cineCredits < listing.ask_price) {
      alert(`Insufficient CC. You need ${listing.ask_price} CC but have ${cineCredits} CC.`);
      return;
    }
    alert(`Purchase confirmed! ${listing.film_title} — ${listing.token_type} acquired for ${listing.ask_price} CC.`);
    setDbListings(prev => prev.filter(l => l.id !== listing.id));
  };

  const filteredMockListings = mockListings.filter(
    (item) => filterType === "All" || item.tokenType === filterType
  );

  const filteredDbListings = dbListings.filter(
    (item) => filterType === "All" || item.token_type === filterType
  );

  const getSellerName = (seller: any) => {
    if (!seller) return "Unknown";
    return seller.display_name || (seller.wallet_address ? `0x${seller.wallet_address.slice(2, 6)}...${seller.wallet_address.slice(-4)}` : "Anon");
  };

  return (
    <div className="w-full pt-16 bg-surface min-h-screen">
      {/* Header */}
      <div className="w-full bg-on-surface pt-20 pb-16 relative overflow-hidden">
        <RainbowStripe className="absolute top-0 left-0 h-3 w-full" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-surface-variant/10 border border-surface-variant/20 px-4 py-2 mb-6">
            <ShoppingBag className="h-4 w-4 text-primary" />
            <span className="font-label text-xs uppercase tracking-widest text-outline-variant">
              Peer-to-Peer Exchange
            </span>
          </div>
          <h1 className="text-6xl md:text-8xl font-headline font-black uppercase tracking-tighter text-surface-container-lowest mb-4">
            Market
          </h1>
          <p className="text-xl font-body text-surface-variant max-w-2xl">
            The secondary market. Buy and sell cinema tokens on-chain. 10% resale royalty to filmmakers. 5% protocol fee.
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-surface-container border-b border-outline-variant/30 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-4 gap-8 text-center">
            {[
              { label: "Active Listings", value: (filteredMockListings.length + filteredDbListings.length).toString(), color: "text-primary" },
              { label: "24h Volume", value: "12,400 CC", color: "text-on-surface" },
              { label: "Resale Royalty", value: "10%", color: "text-secondary" },
              { label: "Protocol Fee", value: "5%", color: "text-tertiary" },
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
        {/* Filter bar */}
        <div className="flex items-center gap-3 mb-10 border-b-2 border-on-surface pb-6">
          <Filter className="h-5 w-5 text-on-surface-variant" />
          <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold mr-2">Filter:</span>
          {["All", "Rental", "Ownership", "Collector"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`font-label text-xs uppercase tracking-widest px-4 py-2 transition-all ${
                filterType === type
                  ? "bg-on-surface text-surface font-bold shadow-hard"
                  : "bg-surface-container border border-outline-variant text-on-surface-variant hover:border-on-surface"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {/* DB Listings first */}
          {filteredDbListings.map((listing) => {
            const isOwn = currentUser?.id === listing.seller_id;
            return (
              <div
                key={listing.id}
                className="bg-surface-container-lowest border border-outline-variant shadow-film overflow-hidden hover:-translate-y-1 hover:shadow-film-hover transition-all duration-300 relative"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-48 h-32 flex-shrink-0">
                    {listing.film_image ? (
                      <img src={listing.film_image} alt={listing.film_title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full bg-surface-container flex items-center justify-center">
                        <Tag className="h-8 w-8 text-outline-variant" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className={`px-2 py-1 font-label text-xs uppercase tracking-widest font-bold ${tokenTypeColors[listing.token_type] || "bg-surface-container text-on-surface-variant"}`}>
                        {listing.token_type}
                      </span>
                      {listing.token_number && (
                        <span className="font-mono text-xs text-outline-variant">{listing.token_number}</span>
                      )}
                      <span className="bg-primary/5 border border-primary/20 px-2 py-1 font-label text-[10px] uppercase tracking-widest text-primary font-bold">
                        User Listed
                      </span>
                    </div>
                    <h3 className="text-xl font-headline font-bold uppercase tracking-tight mb-1">{listing.film_title}</h3>
                    <p className="font-body text-sm text-on-surface-variant mb-1">Seller: {getSellerName(listing.seller)}</p>
                    {listing.description && (
                      <p className="font-body text-sm text-on-surface-variant italic">{listing.description}</p>
                    )}
                  </div>
                  <div className="flex flex-col justify-center items-end p-6 border-t md:border-t-0 md:border-l border-outline-variant md:w-48">
                    <p className="font-headline font-black text-2xl text-primary">{listing.ask_price.toLocaleString()} CC</p>
                    <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-4">
                      ${(listing.ask_price * 0.10).toFixed(2)} USD
                    </p>
                    {isOwn ? (
                      <Button size="sm" variant="outline" className="w-full text-error border-error hover:bg-error hover:text-white" onClick={() => handleDelist(listing.id)}>
                        Delist
                      </Button>
                    ) : (
                      <Button size="sm" className="w-full" onClick={() => handleBuyDbListing(listing)} disabled={cineCredits < listing.ask_price}>
                        {cineCredits >= listing.ask_price ? "Buy Now" : "Insufficient CC"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Mock Listings */}
          {filteredMockListings.map((listing) => (
            <div
              key={listing.id}
              className="bg-surface-container-lowest border border-outline-variant shadow-film overflow-hidden hover:-translate-y-1 hover:shadow-film-hover transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-48 h-32 flex-shrink-0">
                  <img
                    src={listing.image}
                    alt={listing.filmTitle}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 p-6">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className={`px-2 py-1 font-label text-xs uppercase tracking-widest font-bold ${tokenTypeColors[listing.tokenType] || "bg-surface-container text-on-surface-variant"}`}>
                      {listing.tokenType}
                    </span>
                    <span className="font-mono text-xs text-outline-variant">#{listing.tokenNumber}</span>
                  </div>
                  <h3 className="text-xl font-headline font-bold uppercase tracking-tight mb-1">{listing.filmTitle}</h3>
                  <p className="font-body text-sm text-on-surface-variant">
                    Seller: {listing.seller}
                  </p>
                </div>
                <div className="flex flex-col justify-center items-end p-6 border-t md:border-t-0 md:border-l border-outline-variant md:w-48">
                  <p className="font-headline font-black text-2xl text-primary">{listing.askPriceCC.toLocaleString()} CC</p>
                  <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-1">
                    ${listing.askPriceUSD} USD
                  </p>
                  <p className="font-label text-[10px] text-outline-variant uppercase tracking-widest mb-4">
                    Platform: {listing.platformFee}% · Royalty: {listing.royaltyFee}%
                  </p>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      if (cineCredits < listing.askPriceCC) {
                        alert(`Not enough CineCredits. You need ${listing.askPriceCC} CC.`);
                      } else {
                        alert(`Purchase confirmed! ${listing.filmTitle} ${listing.tokenType} #${listing.tokenNumber} acquired for ${listing.askPriceCC} CC.`);
                      }
                    }}
                    disabled={cineCredits < listing.askPriceCC}
                  >
                    {cineCredits >= listing.askPriceCC ? "Buy Now" : "Insufficient CC"}
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {filteredMockListings.length === 0 && filteredDbListings.length === 0 && (
            <div className="text-center py-16 bg-surface-container-lowest border border-outline-variant">
              <ShoppingBag className="h-16 w-16 text-outline-variant mx-auto mb-4" />
              <p className="font-headline font-bold text-xl uppercase tracking-tight text-on-surface-variant mb-2">No Listings Found</p>
              <p className="font-body text-sm text-on-surface-variant">
                No {filterType !== "All" ? filterType : ""} tokens are currently listed. Check back later or list your own from the Vault.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
