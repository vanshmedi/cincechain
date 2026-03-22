import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Polaroid } from "../components/ui/Polaroid";
import { ArrowRight, PlayCircle, Hexagon, Ticket, Zap, Star, Award, Wallet } from "lucide-react";

interface LandingScreenProps {
  setView: (view: string) => void;
  onConnect: () => void;
}

// Film marquee data for scrolling ticker
const marqueeItems = [
  "New Mint: \"The Silent Echo\" — Collector Token #007 sold",
  "Governance: CIP-042 passes with 12,847 votes",
  "Neon Dreams: Secondary market volume 6,000 CC",
  "Protocol fee reduced to 5% — CIP-041 implemented",
  "Curator endorsed: \"Concrete Jungle\" joins top picks",
];

export function LandingScreen({ setView, onConnect }: LandingScreenProps) {
  const filmPolaroids = [
    { imageUrl: "https://picsum.photos/seed/film1/400/300", title: "Neon Dreams", subtitle: "Sci-Fi / 2024" },
    { imageUrl: "https://picsum.photos/seed/film3/400/300", title: "The Silent Echo", subtitle: "Drama / 2024" },
    { imageUrl: "https://picsum.photos/seed/film2/400/300", title: "The Last Heist", subtitle: "Action / 2023" },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-surface-container-lowest z-[-1]" />
        {/* Decorative scattered polaroids */}
        <div className="absolute top-20 left-10 -rotate-12 opacity-40 hidden lg:block">
          <Polaroid
            imageUrl={filmPolaroids[0].imageUrl}
            title={filmPolaroids[0].title}
            subtitle={filmPolaroids[0].subtitle}
            className="w-64"
          />
        </div>
        <div className="absolute bottom-20 right-10 rotate-6 opacity-40 hidden lg:block">
          <Polaroid
            imageUrl={filmPolaroids[1].imageUrl}
            title={filmPolaroids[1].title}
            subtitle={filmPolaroids[1].subtitle}
            className="w-64"
          />
        </div>
        <div className="absolute top-40 right-24 -rotate-3 opacity-20 hidden xl:block">
          <Polaroid
            imageUrl={filmPolaroids[2].imageUrl}
            title={filmPolaroids[2].title}
            subtitle={filmPolaroids[2].subtitle}
            className="w-48"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center space-x-2 bg-surface-variant px-4 py-2 mb-8 border border-outline-variant">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
              Protocol v2.1 Live · 5% Protocol Fee · 1 CC = $0.10
            </span>
          </div>
          <h1 className="text-7xl md:text-9xl font-headline font-black uppercase tracking-tighter leading-[0.85] mb-8 text-on-surface">
            Film. <br />
            <span className="rainbow-text">Unchained.</span>
          </h1>
          <p className="text-xl md:text-2xl font-body text-on-surface-variant max-w-2xl mx-auto mb-12 leading-relaxed">
            The decentralized studio and distribution network. Fund, create, and
            own the future of cinema without intermediaries.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button size="lg" className="group" onClick={() => setView("gallery")}>
              Enter Gallery
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="group" onClick={() => setView("submit")}>
              Submit Film
              <PlayCircle className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Marquee Ticker — animated film title scroll */}
      <div className="w-full bg-on-surface text-surface py-4 overflow-hidden border-y border-outline-variant/30 relative flex items-center">
        <div className="flex whitespace-nowrap animate-[marquee_30s_linear_infinite]">
          {[...Array(4)].map((_, i) =>
            marqueeItems.map((item, j) => (
              <span
                key={`${i}-${j}`}
                className="mx-8 font-label text-sm uppercase tracking-widest flex items-center"
              >
                <Hexagon className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                {item}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Process Section */}
      <section className="py-32 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-headline font-black uppercase tracking-tighter mb-6">
              The New Paradigm
            </h2>
            <p className="text-xl font-body text-on-surface-variant max-w-3xl mx-auto">
              We are dismantling the traditional studio system. Here is how the
              collective operates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Fund", color: "border-primary", desc: "Creators pitch their vision directly to the collective. Backers purchase fractional ownership tokens, funding production without studio interference.", view: "gallery" },
              { num: "02", title: "Create", color: "border-secondary", desc: "Production updates, behind-the-scenes access, and governance decisions are shared transparently with token holders via the Studio dashboard.", view: "studio" },
              { num: "03", title: "Distribute", color: "border-tertiary", desc: "Films are minted as unique digital assets. Revenue from streaming, rentals, and secondary sales flows automatically to token holders via smart contracts.", view: "market" },
            ].map(({ num, title, color, desc, view }) => (
              <div
                key={num}
                className={`bg-surface-container-lowest p-10 border-t-8 ${color} shadow-film hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden group cursor-pointer`}
                onClick={() => setView(view)}
              >
                <div className="absolute -right-10 -top-10 text-[10rem] font-headline font-black text-surface-variant/30 leading-none group-hover:text-primary/10 transition-colors">
                  {num}
                </div>
                <h3 className="text-3xl font-headline font-bold uppercase tracking-tight mb-4 relative z-10">{title}</h3>
                <p className="font-body text-on-surface-variant relative z-10">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CinePass Access Tiers — PRD-compliant: Observer / Curator / Auteur */}
      <section className="py-32 bg-surface-container-low border-y border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div className="max-w-2xl">
              <h2 className="text-5xl md:text-6xl font-headline font-black uppercase tracking-tighter mb-4">
                CinePass Tiers
              </h2>
              <p className="text-lg font-body text-on-surface-variant">
                Join the collective at a level that suits your commitment to independent cinema.
              </p>
            </div>
            <Button variant="outline" className="mt-6 md:mt-0" onClick={() => setView("pass")}>
              View All Plans
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Observer", price: "$12/mo", cc: "120 CC/mo", features: ["Unlimited streaming", "Public gallery access", "Community forum"], colorBar: "bg-on-surface", icon: <Ticket className="h-8 w-8 text-outline" /> },
              { name: "Curator", price: "$22/mo", cc: "220 CC/mo", features: ["All Observer features", "4K / HDR streaming", "Endorse films & earn reputation", "Early access to mints"], colorBar: "bg-primary", icon: <Star className="h-8 w-8 text-primary" />, recommended: true },
              { name: "Auteur", price: "$45/mo", cc: "450 CC/mo", features: ["All Curator features", "Governance voting rights", "Revenue share", "Filmmaker credentials"], colorBar: "bg-secondary", icon: <Award className="h-8 w-8 text-secondary" /> },
            ].map((tier) => (
              <div
                key={tier.name}
                className={`bg-surface-container-lowest border p-8 relative overflow-hidden shadow-film hover:-translate-y-1 transition-transform cursor-pointer ${
                  tier.recommended ? "border-primary" : "border-outline-variant"
                }`}
                onClick={() => setView("pass")}
              >
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${tier.colorBar}`} />
                {tier.recommended && (
                  <div className="absolute top-4 right-4 bg-primary text-white font-label text-xs uppercase tracking-widest px-2 py-1 font-bold">
                    Recommended
                  </div>
                )}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-headline font-bold uppercase tracking-tight mb-1">{tier.name}</h3>
                    <p className="font-headline font-black text-3xl">{tier.price}</p>
                    <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">{tier.cc}</p>
                  </div>
                  {tier.icon}
                </div>
                <ul className="space-y-3 font-body text-on-surface-variant text-sm">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-primary mr-3 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-8" variant={tier.recommended ? "primary" : "outline"} onClick={(e) => { e.stopPropagation(); setView("pass"); }}>
                  Get {tier.name}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA connect wallet section */}
      <section className="py-32 bg-on-surface text-surface-container-lowest relative overflow-hidden">
        <div className="absolute inset-0 rainbow-bg opacity-[0.08]" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-headline font-black uppercase tracking-tighter mb-6">
            Ready to Join?
          </h2>
          <p className="text-xl font-body text-surface-variant mb-12 max-w-2xl mx-auto">
            Connect your wallet or sign in with email via Privy. Get 2,500 CineCredits (= $250) to start exploring.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              size="lg"
              className="bg-primary text-white group"
              onClick={onConnect}
            >
              <Wallet className="mr-2 h-5 w-5" />
              Connect Wallet
            </Button>
            <Button size="lg" variant="outline" className="border-surface-container-lowest text-surface-container-lowest hover:bg-surface-container-lowest hover:text-on-surface" onClick={() => setView("gallery")}>
              Browse Without Wallet
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
