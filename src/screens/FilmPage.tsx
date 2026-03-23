import { useState } from "react";
import { Button } from "../components/ui/Button";
import { RainbowStripe } from "../components/ui/RainbowStripe";
import { useEffect } from "react";
import { type DbFilm } from "../lib/supabase";
import { fetchDbFilmById } from "../lib/auth";
import {
  ArrowLeft,
  Star,
  Award,
  Clock,
  Users,
  ShieldCheck,
  CheckCircle2,
  Fingerprint,
  Wallet,
} from "lucide-react";

interface FilmPageProps {
  filmId: string;
  setView: (view: string, filmId?: string, curatorHandle?: string) => void;
  onPurchase: (filmId: string, tier: string, price: number) => void;
  cineCredits: number;
}

export function FilmPage({ filmId, setView, onPurchase, cineCredits }: FilmPageProps) {
  const [film, setFilm] = useState<DbFilm | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  useEffect(() => {
    fetchDbFilmById(filmId).then((data) => {
      setFilm(data);
      setLoading(false);
    });
  }, [filmId]);

  if (loading || !film) {
    return (
      <div className="w-full pt-32 pb-16 bg-surface min-h-screen text-center text-on-surface-variant">
        Loading film details...
      </div>
    );
  }

  const meta = (film.revenue_split as any) || {};
  const status = meta.status || "Live";
  const fundingRaised = meta.fundingRaised || 0;
  const fundingGoal = meta.fundingGoal || 1;
  const backers = meta.backers || 0;
  const festivalBadges = meta.festivalBadges || [];
  const curatorEndorsed = meta.curatorEndorsed || false;
  const curatorName = meta.curatorName || "";
  
  const tokens = meta.tokens || {
    rental: { price: 150, supply: 5000, remaining: 5000 },
    ownership: { price: 500, supply: 1000, remaining: 1000 },
    collector: { price: 2500, supply: 100, remaining: 100 }
  };

  const tiers = [
    {
      key: "rental",
      name: "Rental",
      description: "48-hour streaming access. Non-transferable.",
      price: tokens.rental.price,
      supply: tokens.rental.supply,
      remaining: tokens.rental.remaining,
      color: "border-outline-variant",
      highlight: false,
    },
    {
      key: "ownership",
      name: "Ownership",
      description: "Permanent streaming rights. Transferable. Revenue share eligible.",
      price: tokens.ownership.price,
      supply: tokens.ownership.supply,
      remaining: tokens.ownership.remaining,
      color: "border-primary",
      highlight: true,
    },
    {
      key: "collector",
      name: "Collector",
      description: "Limited edition FLT. Resaleable on secondary market. 10% royalty to filmmaker on resale.",
      price: tokens.collector.price,
      supply: tokens.collector.supply,
      remaining: tokens.collector.remaining,
      color: "border-secondary",
      highlight: false,
    },
  ] as const;

  const fundingPct = Math.min(100, Math.round((fundingRaised / fundingGoal) * 100));

  return (
    <div className="w-full pt-16 bg-surface min-h-screen">
      {/* Hero */}
      <section className="relative w-full h-[60vh] bg-on-surface overflow-hidden flex items-end pb-12">
        <div className="absolute inset-0 z-0">
          <img
            src={film.poster_url || ""}
            alt={film.title}
            className="w-full h-full object-cover opacity-30 mix-blend-luminosity"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-on-surface via-on-surface/60 to-transparent" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <button
            onClick={() => setView("gallery")}
            className="flex items-center text-outline-variant hover:text-surface-container-lowest font-label text-xs uppercase tracking-widest mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Gallery
          </button>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {festivalBadges.map((badge: string) => (
              <span
                key={badge}
                className="inline-flex items-center bg-primary text-white font-label text-xs uppercase tracking-widest px-3 py-1 font-bold"
              >
                <Award className="h-3 w-3 mr-1" />
                {badge}
              </span>
            ))}
            {curatorEndorsed && (
              <span className="inline-flex items-center bg-secondary text-white font-label text-xs uppercase tracking-widest px-3 py-1 font-bold">
                <Star className="h-3 w-3 mr-1" />
                Curator Endorsed — {curatorName}
              </span>
            )}
          </div>

          <h1 className="text-5xl md:text-7xl font-headline font-black uppercase tracking-tighter text-surface-container-lowest leading-none mb-4">
            {film.title}
          </h1>
          <div className="flex flex-wrap gap-6 text-surface-variant font-label text-sm uppercase tracking-widest">
            <span>Dir. {film.director || "Unknown"}</span>
            <span>{film.year}</span>
            <span>{film.genre || "Independent"}</span>
            <span className="flex items-center"><Clock className="h-4 w-4 mr-1" />{film.runtime ? `${Math.floor(film.runtime / 60)} min` : "90 min"}</span>
            <span className="flex items-center"><Users className="h-4 w-4 mr-1" />{backers.toLocaleString()} backers</span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Left col — info */}
          <div className="lg:col-span-2 space-y-12">
            {/* Funding progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold">
                  Funding Progress
                </span>
                <span className="font-headline font-black text-2xl">{fundingPct}%</span>
              </div>
              <div className="w-full h-3 bg-surface-container-high overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-1000"
                  style={{ width: `${fundingPct}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 font-label text-xs text-on-surface-variant uppercase tracking-widest">
                <span>{fundingRaised.toLocaleString()} CC raised</span>
                <span>Goal: {fundingGoal.toLocaleString()} CC</span>
              </div>
            </div>

            {/* Synopsis */}
            <div>
              <h2 className="text-3xl font-headline font-bold uppercase tracking-tight mb-4 border-b-2 border-on-surface pb-2">
                Synopsis
              </h2>
              <p className="font-body text-on-surface-variant text-lg leading-relaxed">
                {film.description}
              </p>
            </div>

            {/* Credits */}
            <div>
              <h2 className="text-3xl font-headline font-bold uppercase tracking-tight mb-6 border-b-2 border-on-surface pb-2">
                Credits & Revenue Split
              </h2>
              <div className="bg-surface-container-lowest border border-outline-variant p-8 shadow-film relative overflow-hidden">
                <RainbowStripe className="absolute top-0 left-0 h-1" />
                <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-4">
                  On-chain revenue distribution per transaction
                </p>
                <div className="space-y-4">
                  {[
                    { label: `Director — ${film.director || 'Unknown'}`, pct: meta.director || 60, color: "bg-primary" },
                    { label: "Producer / Crew", pct: meta.producer ? (meta.producer + (meta.crew || 0)) : 35, color: "bg-secondary" },
                    { label: "Protocol Fee (CineChain)", pct: meta.protocol || 5, color: "bg-outline-variant" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between mb-1">
                        <span className="font-body text-sm text-on-surface-variant">{item.label}</span>
                        <span className="font-headline font-bold">{item.pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-surface-container-high overflow-hidden">
                        <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 font-label text-xs uppercase tracking-widest text-outline-variant">
                  Resale royalty: 10% back to filmmaker • Protocol fee: 5%
                </p>
              </div>
            </div>

            {/* On-chain info */}
            <div>
              <h2 className="text-3xl font-headline font-bold uppercase tracking-tight mb-6 border-b-2 border-on-surface pb-2">
                On-Chain Details
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: "Chain", value: "Ethereum L2" },
                  { label: "Standard", value: "ERC-1155" },
                  { label: "Watermark", value: "Enabled" },
                  { label: "Protocol Fee", value: "5%" },
                  { label: "Resale Royalty", value: "10%" },
                  { label: "Status", value: status },
                ].map((item) => (
                  <div key={item.label} className="bg-surface-container-lowest border border-outline-variant p-4">
                    <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-1">{item.label}</p>
                    <p className="font-headline font-bold text-lg">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right col — token tiers */}
          <div className="space-y-6">
            <h2 className="text-2xl font-headline font-bold uppercase tracking-tight border-b-2 border-on-surface pb-2">
              Acquire Access
            </h2>

            <div className="bg-surface-container-lowest border border-outline-variant p-4 flex items-center justify-between">
              <div className="flex items-center">
                <Wallet className="h-5 w-5 text-primary mr-3" />
                <span className="font-label text-xs uppercase tracking-widest font-bold">Your Balance</span>
              </div>
              <span className="font-headline font-black text-xl">{cineCredits.toLocaleString()} CC</span>
            </div>

            {tiers.map((tier) => {
              const soldOut = tier.remaining === 0;
              const canAfford = cineCredits >= tier.price;
              const isSelected = selectedTier === tier.key;
              return (
                <div
                  key={tier.key}
                  onClick={() => !soldOut && setSelectedTier(tier.key)}
                  className={`border-2 p-6 cursor-pointer transition-all duration-200 relative ${
                    isSelected ? "border-primary bg-primary/5" : tier.color + " bg-surface-container-lowest hover:bg-surface-container"
                  } ${soldOut ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {tier.highlight && !isSelected && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
                  )}
                  {isSelected && <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-primary" />}
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-headline font-black uppercase text-xl tracking-tight">{tier.name}</h3>
                    <div className="text-right">
                      <p className="font-headline font-black text-2xl">{tier.price.toLocaleString()} CC</p>
                      <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest">
                        = ${(tier.price * 0.10).toFixed(0)}
                      </p>
                    </div>
                  </div>
                  <p className="font-body text-sm text-on-surface-variant mb-4">{tier.description}</p>
                  <div className="flex justify-between font-label text-xs uppercase tracking-widest text-on-surface-variant">
                    <span>{tier.remaining.toLocaleString()} / {tier.supply.toLocaleString()} remaining</span>
                    {soldOut && <span className="text-error font-bold">Sold Out</span>}
                  </div>
                </div>
              );
            })}

            {selectedTier && (
              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  const tier = tiers.find((t) => t.key === selectedTier)!;
                  onPurchase(film.id, tier.name, tier.price);
                }}
                disabled={cineCredits < (tiers.find((t) => t.key === selectedTier)?.price ?? Infinity)}
              >
                Mint {tiers.find((t) => t.key === selectedTier)?.name} Token
              </Button>
            )}

            <div className="flex items-start p-4 bg-surface-container border border-outline-variant/50">
              <ShieldCheck className="h-5 w-5 text-tertiary mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-label text-xs uppercase tracking-widest font-bold text-tertiary mb-1">Watermark Protected</p>
                <p className="font-body text-xs text-on-surface-variant">
                  Your session ID will be embedded invisibly. Piracy is auto-detected on-chain.
                </p>
              </div>
            </div>

            <div className="flex items-center p-4 bg-surface-container border border-outline-variant/50">
              <Fingerprint className="h-5 w-5 text-outline mr-3 flex-shrink-0" />
              <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
                Session ID assigned at mint time
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
