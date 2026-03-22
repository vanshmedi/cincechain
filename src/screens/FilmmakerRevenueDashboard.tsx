import { useState } from "react";
import { Button } from "../components/ui/Button";
import { RainbowStripe } from "../components/ui/RainbowStripe";
import { films } from "../data/mockData";
import { BarChart3, TrendingUp, Film, DollarSign, ArrowUpRight } from "lucide-react";

interface FilmmakerRevenueDashboardProps {
  setView: (view: string, filmId?: number, curatorHandle?: string) => void;
}

// Mock revenue data per film
const revenueByFilm = films.slice(0, 3).map((film) => ({
  filmId: film.id,
  title: film.title,
  image: film.image,
  status: film.status,
  totalRevenue: Math.round(film.fundingRaised * film.revenueSplit.director / 100),
  rentalRevenue: Math.round(film.tokens.rental.price * (film.tokens.rental.supply - film.tokens.rental.remaining) * film.revenueSplit.director / 100),
  ownershipRevenue: Math.round(film.tokens.ownership.price * (film.tokens.ownership.supply - film.tokens.ownership.remaining) * film.revenueSplit.director / 100),
  collectorRevenue: Math.round(film.tokens.collector.price * (film.tokens.collector.supply - film.tokens.collector.remaining) * film.revenueSplit.director / 100),
  secondaryRoyalties: Math.round(8400 * film.id * 0.1 * film.revenueSplit.director / 100),
  protocolFees: Math.round(film.fundingRaised * 0.05),
  lastTransaction: `${film.id * 3}h ago`,
  split: film.revenueSplit,
}));

const totalRevenue = revenueByFilm.reduce((sum, f) => sum + f.totalRevenue, 0);

export function FilmmakerRevenueDashboard({ setView }: FilmmakerRevenueDashboardProps) {
  const [selectedFilm, setSelectedFilm] = useState<number | null>(null);
  const selected = revenueByFilm.find((f) => f.filmId === selectedFilm) || revenueByFilm[0];

  return (
    <div className="w-full pt-16 bg-surface min-h-screen relative">
      <button
        onClick={() => setView('landing')}
        className="fixed top-4 left-4 z-50 flex items-center bg-surface-container-lowest border border-outline-variant px-4 py-2 font-label text-xs uppercase tracking-widest font-bold text-on-surface hover:text-primary hover:border-primary transition-all shadow-sm"
      >
        ⬅ Back to Platform
      </button>

      {/* Header */}
      <div className="w-full bg-on-surface pt-20 pb-12 relative overflow-hidden">
        <RainbowStripe className="absolute top-0 left-0 h-3 w-full" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-5xl md:text-7xl font-headline font-black uppercase tracking-tighter text-surface-container-lowest mb-4">
            Revenue Dashboard
          </h1>
          <p className="text-lg font-body text-surface-variant max-w-2xl">
            Real-time earnings breakdown per film, per transaction type. All figures in CineCredits (1 CC = $0.10).
          </p>
        </div>
      </div>

      {/* Top-line stats */}
      <div className="bg-surface-container border-b border-outline-variant/30 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-4 gap-8 text-center">
            {[
              { label: "Total Earned", value: `${totalRevenue.toLocaleString()} CC`, color: "text-primary" },
              { label: "Rental Revenue", value: `${revenueByFilm.reduce((s, f) => s + f.rentalRevenue, 0).toLocaleString()} CC`, color: "text-on-surface" },
              { label: "Ownership Sales", value: `${revenueByFilm.reduce((s, f) => s + f.ownershipRevenue, 0).toLocaleString()} CC`, color: "text-secondary" },
              { label: "Secondary Royalties", value: `${revenueByFilm.reduce((s, f) => s + f.secondaryRoyalties, 0).toLocaleString()} CC`, color: "text-tertiary" },
            ].map((s) => (
              <div key={s.label}>
                <p className={`font-headline font-black text-2xl ${s.color}`}>{s.value}</p>
                <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Film list */}
          <div className="space-y-4">
            <h2 className="text-2xl font-headline font-bold uppercase tracking-tight border-b-2 border-on-surface pb-3">
              Your Films
            </h2>
            {revenueByFilm.map((film) => (
              <div
                key={film.filmId}
                onClick={() => setSelectedFilm(film.filmId)}
                className={`flex items-center p-4 border cursor-pointer transition-all duration-200 ${
                  (selectedFilm === film.filmId || (!selectedFilm && film.filmId === revenueByFilm[0].filmId))
                    ? "border-primary bg-primary/5 shadow-film"
                    : "border-outline-variant bg-surface-container-lowest hover:border-on-surface"
                }`}
              >
                <img
                  src={film.image}
                  alt={film.title}
                  className="w-16 h-12 object-cover flex-shrink-0 mr-4"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-headline font-bold uppercase tracking-tight truncate">{film.title}</h3>
                  <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">{film.status}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-headline font-bold text-lg text-primary">{film.totalRevenue.toLocaleString()}</p>
                  <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">CC</p>
                </div>
              </div>
            ))}
          </div>

          {/* Film detail */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between border-b-2 border-on-surface pb-4">
              <h2 className="text-3xl font-headline font-bold uppercase tracking-tight flex items-center">
                <Film className="h-7 w-7 text-primary mr-3" />
                {selected.title}
              </h2>
              <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
                Last tx: {selected.lastTransaction}
              </span>
            </div>

            {/* Revenue breakdown bars */}
            <div className="bg-surface-container-lowest border border-outline-variant p-8 shadow-film relative overflow-hidden">
              <RainbowStripe className="absolute top-0 left-0 h-1" />
              <h3 className="text-xl font-headline font-bold uppercase tracking-tight mb-6">Revenue Breakdown</h3>
              <div className="space-y-6">
                {[
                  { label: "Rental Tokens (48h access)", value: selected.rentalRevenue, color: "bg-on-surface" },
                  { label: "Ownership Tokens (Permanent)", value: selected.ownershipRevenue, color: "bg-primary" },
                  { label: "Collector Tokens (FLT)", value: selected.collectorRevenue, color: "bg-secondary" },
                  { label: "Secondary Market Royalties (10%)", value: selected.secondaryRoyalties, color: "bg-tertiary" },
                ].map((item) => {
                  const pct = selected.totalRevenue > 0 ? Math.round((item.value / selected.totalRevenue) * 100) : 0;
                  return (
                    <div key={item.label}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-body text-sm text-on-surface-variant">{item.label}</span>
                        <div className="text-right">
                          <span className="font-headline font-bold">{item.value.toLocaleString()} CC</span>
                          <span className="font-label text-xs text-on-surface-variant ml-2">({pct}%)</span>
                        </div>
                      </div>
                      <div className="w-full h-3 bg-surface-container-high overflow-hidden">
                        <div
                          className={`h-full ${item.color} transition-all duration-1000`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-8 pt-6 border-t border-outline-variant/50 flex justify-between items-center">
                <span className="font-label text-sm uppercase tracking-widest font-bold text-on-surface-variant">Total (Your Share)</span>
                <span className="font-headline font-black text-3xl text-primary">{selected.totalRevenue.toLocaleString()} CC</span>
              </div>
            </div>

            {/* On-chain split preview */}
            <div className="bg-surface-container-lowest border border-outline-variant p-8 shadow-film relative overflow-hidden">
              <RainbowStripe className="absolute top-0 left-0 h-1" />
              <h3 className="text-xl font-headline font-bold uppercase tracking-tight mb-2">
                On-Chain Revenue Split
              </h3>
              <p className="font-body text-sm text-on-surface-variant mb-6">
                Per transaction, here's how the money flows automatically:
              </p>
              <div className="space-y-4">
                {[
                  { party: "Director (You)", pct: selected.split.director, color: "text-primary", bar: "bg-primary" },
                  { party: "Producer", pct: selected.split.producer, color: "text-secondary", bar: "bg-secondary" },
                  { party: "Crew", pct: selected.split.crew, color: "text-tertiary", bar: "bg-tertiary" },
                  { party: "Protocol Fee (CineChain)", pct: selected.split.protocol, color: "text-outline", bar: "bg-outline-variant" },
                ].map((item) => (
                  <div key={item.party} className="flex items-center gap-4">
                    <div className="w-40 flex-shrink-0">
                      <span className={`font-label text-xs uppercase tracking-widest font-bold ${item.color}`}>{item.party}</span>
                    </div>
                    <div className="flex-1 h-2 bg-surface-container-high overflow-hidden">
                      <div className={`h-full ${item.bar}`} style={{ width: `${item.pct}%` }} />
                    </div>
                    <span className="font-headline font-bold w-12 text-right">{item.pct}%</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 font-label text-xs uppercase tracking-widest text-outline-variant">
                Protocol fee fixed at 5%. Secondary resales: 10% royalty to filmmaker, 5% protocol fee.
              </p>
            </div>

            {/* Quick actions */}
            <div className="flex gap-4">
              <Button className="flex-1" onClick={() => setView("studio")}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Back to Studio
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => alert('Your USDC withdrawal request has been queued. Settlement occurs on the 1st of every month.')}>
                <DollarSign className="h-4 w-4 mr-2" />
                Withdraw CC
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
