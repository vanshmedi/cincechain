import { useState, useEffect } from "react";
import { Button } from "../components/ui/Button";
import { ArrowRight, PlayCircle, Ticket, Star, Award, Wallet } from "lucide-react";
import type { DbFilm } from "../lib/supabase";
import { fetchDbFilms } from "../lib/auth";

interface LandingScreenProps {
  setView: (view: string, filmId?: number, curatorHandle?: string) => void;
  onConnect: () => void;
}

// ─── Polaroid images from Stitch ───────────────────────────────────────────
const stitchPolaroids = [
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCEsOjC_gJlu8oHgfk_O6j_GJc3t83qLV-B41u5NC62jonNcJhdUPyZiRoQDTHKEid2h0yF5-rbvhucjgoQzZNFeIwE66kFFQZpnRaDiMMLrhghzxAbAWpsBaoqO0cmy9rbTvALqPXDnaYiac47IB50YmiBJwpg1hwCjPr5db5qxaubVFoUWgGk5Mp-8x2Vkq9VKykXXb73K-Vpa3tF6RFvojIpWOQ9KHjbEkLvge66JDIyoYab8BJPKCBn9cOYpniBhxQyOItxmco",
    label: "Roll #001: Genesis",
    posClass: "top-[20%] left-[10%] w-64 -rotate-6",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCsXF_MD5ySTFkaR9DqTnP4BAbm1GPvm_vBZsZkOn4h7hhI3BJTT1UGn3gqDuJq3rQhciaGpuW_KEv9HrE5nV_WDsUqmCjDBXwnZPzDpzmB8VjbpRRMSiMeHoH-7HXNNtwx9bhyC7_pw2OI1HzGLypu94x8Rp3L3_PSH-le7jJAiv2J5TaHEibmojKHxgIsz_IcLDhRUAxcGUPQg5FZpyM6PzmVckY36yRdZwtocJhOyBl9QRKP0QE7pGev00okuGo9jRI4Qns-nM0",
    label: "Frame #442: Noir",
    posClass: "top-[15%] right-[10%] w-56 rotate-12",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDxzy9SJxGDYQEqyxPj45FJO7nYSlXxFP3tQavLuYEBX7OcJfhQkjFqzu622eIqkR8T7T0HA1c42ZZ7hJQjjvvhFC2raXJ2N3xs-phG8YFF3lgr62fFS6iNEgfIH0X0iCcCFdF2FF22D1Yxj3Fb2MCcnYhIy4sY36-8A_wAqG45IdBCiT3dOoqnfbzWJZaeeyC55t7PzrBIl3jsZXly5XdRQhUCgRphf2tDe0GlcVXUXegdt9WpmGoTn-BtQKPMWJoX6v9QYZF8zCo",
    label: "Batch #90: Neon",
    posClass: "bottom-[10%] left-[15%] w-60 -rotate-12",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_k5d6rGqBankrBauktuzfsbafVynCjSyr010GaMNg_SBQKadLxsHG7sHbhuywu98BCY6IVT7S0LRzv5bV7YSXGciYKExmV3HUaPCIuImdxY1tnllnpNFS-ciQp43GO_zzsSNz3tG-q6s7JazuHTqVR7M_i6nD7swi4emS5SCIzDgxplDo04X2ZtQ-Obd7S_Q_JE_cVciBuCPiVpYyCvy5BmmExEcyUJjrt6NvkJCMyqWR0iSdH7nZU3K5H9HhtU-RiRL2JC1n7HY",
    label: "Stock #112: Archive",
    posClass: "bottom-[15%] right-[15%] w-72 rotate-3",
  },
];

// ─── Access tier images from Stitch ────────────────────────────────────────
const accessTiers = [
  {
    key: "rental",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKgs4Gfs7CaIvOAqQGqoDhS_WuFxVYwny748kj9TXRuxoM04MstCrqS8y_ascRXrmlZSs2RBlfEwuyaTcfxmVmqizB9QHdcsyG-mSeQLDstwmCKCMl99zuX44-KpiusyHSMiWbuk4Zb27MmDJvBOWBa0IWBxaUUvM-7JXmyb52Td8q87EZpol7fyvnK1EqDgMUZxdDUr3YWUKQcrHyAeW-dy2gP4Y1_-fRnxQQi-nYOocfenOUVjdDLV4SU_r0ofHfQxfvfWAJVZE",
    imgAlt: "Hand holding a cinema ticket",
    name: "RENTAL",
    label: "48-HOUR STREAM",
    price: "$4.99",
    borderColor: "border-on-surface",
    labelColor: "text-on-surface-variant",
    featured: false,
  },
  {
    key: "ownership",
    img: "https://islandinthenet.com/wp-content/uploads/2020/09/Minolta_X-700_20200911_000202990006.jpg",
    imgAlt: "Stack of film canisters in color",
    name: "OWNERSHIP",
    label: "PERPETUAL ACCESS",
    price: "$24.99",
    borderColor: "border-primary",
    labelColor: "text-primary",
    featured: true,
  },
  {
    key: "collector",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD44BQwCSSYUmsecQ3zIHM0gE_bi5BWvF0mrEGowqFOVx44HXcUJ4ndwGlKfMor-W7mhgvTNB6Z5AZzmZ9IwYMQ4klI1OHMFVzdqlR2NQIK_FSeoMjdvpbGCWcxPVyAwX9cHSMS83n-zKZHs3Oi8eS7-0hra0XUF4pT70uXZakX-NQSNmxf8K2eZDP4h0N18bTNdOvKgsasWZw1UHDcqX7_n0nVHL6-lnv6oKB6Ta3ml_BiRkf8izPZxu6NjZnEDgtYpXUX_Iu9LBM",
    imgAlt: "Signed film script and clapboard",
    name: "COLLECTOR",
    label: "SIGNED SCRIPTS + NFT",
    price: "$199.00",
    borderColor: "border-on-surface",
    labelColor: "text-on-surface-variant",
    featured: false,
  },
];

export function LandingScreen({ setView, onConnect }: LandingScreenProps) {
  const [dbFilms, setDbFilms] = useState<DbFilm[]>([]);

  useEffect(() => {
    fetchDbFilms().then(setDbFilms);
  }, []);

  // Build marquee text: DB film titles first, then hardcoded
  const hardcodedTitles = ["THE LAST REEL", "NOIR ETERNAL", "CYBERPUNK 2088", "ANALOG DREAMS", "KODACHROME HEART"];
  const dbTitles = dbFilms.map(f => f.title.toUpperCase());
  const allTitles = [...dbTitles, ...hardcodedTitles];
  const marqueeText = allTitles.map(t => t + "\u00A0\u00A0•\u00A0\u00A0").join("");

  return (
    <div className="w-full">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <header className="relative min-h-screen bg-surface-container-lowest flex flex-col justify-center items-center overflow-hidden pt-20">
        {/* Giant rainbow stripe behind headline */}
        <div className="absolute w-full h-32 rainbow-bg opacity-10 top-1/2 -translate-y-1/2 -rotate-2 pointer-events-none" />

        <div className="relative z-10 text-center px-4">
          <h1 className="font-headline font-black text-7xl md:text-[10rem] leading-none tracking-tighter uppercase text-on-background">
            Film.<br />
            <span className="text-primary">Unchained.</span>
          </h1>
          <p className="font-label uppercase tracking-widest text-lg mt-8 text-on-surface-variant max-w-xl mx-auto">
            Decentralized Cinema Infrastructure for the Next Generation of Auteurs.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
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

        {/* Scattered polaroids (desktop only) */}
        <div className="hidden lg:block">
          {stitchPolaroids.map((p) => (
            <div
              key={p.label}
              className={`absolute ${p.posClass} p-4 pb-16 bg-white border border-surface-variant transition-all duration-500 hover:rotate-0 hover:scale-105 hover:z-50 hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)]`}
              style={{ boxShadow: "0 20px 40px rgba(27,28,25,0.08)" }}
            >
              <img
                src={p.src}
                alt={p.label}
                className="w-full aspect-square object-cover mb-4"
              />
              <span className="font-label text-xs uppercase text-on-surface-variant">{p.label}</span>
            </div>
          ))}
        </div>
      </header>

      <section className="w-full py-4 rainbow-bg overflow-hidden border-y-2 border-black/10">
        <div
          className="font-headline font-extrabold text-3xl text-white uppercase tracking-tighter whitespace-nowrap inline-block"
          style={{ animation: "marquee 30s linear infinite" }}
        >
          {marqueeText}{marqueeText}
        </div>
      </section>

      {/* ── THE PROCESS ───────────────────────────────────────────────────── */}
      <section className="py-24 px-8 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="mb-24">
            <h2 className="font-headline text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4">
              THE PROCESS
            </h2>
            <div className="h-2 w-32 bg-primary" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {/* Step 01 */}
            <div
              className="group relative p-12 min-h-[500px] flex flex-col justify-end overflow-hidden cursor-pointer"
              style={{ backgroundColor: "#E8383D" }}
              onClick={() => setView("gallery")}
            >
              <span className="absolute -top-10 -right-5 font-headline text-[15rem] leading-none font-black text-black/10 transition-transform group-hover:-translate-y-4 select-none">
                01
              </span>
              <div className="relative z-10">
                <h3 className="font-headline text-4xl font-black text-white uppercase mb-4">MINT THE VISION</h3>
                <p className="text-white/90 text-lg">
                  Upload your master cut. Direct ownership via the blockchain, immutable and permanent.
                </p>
              </div>
            </div>

            {/* Step 02 */}
            <div
              className="group relative p-12 min-h-[500px] flex flex-col justify-end overflow-hidden cursor-pointer"
              style={{ backgroundColor: "#F7D12E" }}
              onClick={() => setView("studio")}
            >
              <span className="absolute -top-10 -right-5 font-headline text-[15rem] leading-none font-black text-black/10 transition-transform group-hover:-translate-y-4 select-none">
                02
              </span>
              <div className="relative z-10">
                <h3 className="font-headline text-4xl font-black text-black uppercase mb-4">FRACTIONALIZE</h3>
                <p className="text-black/80 text-lg">
                  Issue tickets as tokens. Let your audience become your studio executives and backers.
                </p>
              </div>
            </div>

            {/* Step 03 */}
            <div
              className="group relative p-12 min-h-[500px] flex flex-col justify-end overflow-hidden cursor-pointer"
              style={{ backgroundColor: "#3B82C4" }}
              onClick={() => setView("market")}
            >
              <span className="absolute -top-10 -right-5 font-headline text-[15rem] leading-none font-black text-black/10 transition-transform group-hover:-translate-y-4 select-none">
                03
              </span>
              <div className="relative z-10">
                <h3 className="font-headline text-4xl font-black text-white uppercase mb-4">SCREEN WORLDWIDE</h3>
                <p className="text-white/90 text-lg">
                  Bypass gatekeepers. Stream to global audiences with automated royalty distribution.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ACCESS TIERS ──────────────────────────────────────────────────── */}
      <section className="py-24 bg-surface-container overflow-hidden">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="font-headline text-5xl md:text-7xl font-black uppercase tracking-tighter mb-16 text-center">
            ACCESS TIERS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {accessTiers.map((tier) => (
              <div
                key={tier.key}
                className={`bg-white p-6 pb-20 border border-surface-variant transition-all duration-300 hover:-translate-y-4 hover:shadow-[0_40px_80px_rgba(0,0,0,0.15)] flex flex-col cursor-pointer ${
                  tier.featured ? "scale-110 z-20" : ""
                }`}
                onClick={() => setView("pass")}
              >
                <div className="bg-surface-container mb-6 overflow-hidden">
                  <img
                    src={tier.img}
                    alt={tier.imgAlt}
                    className={`w-full aspect-square object-cover transition-all duration-700 ${
                      tier.featured ? "" : "grayscale hover:grayscale-0"
                    }`}
                  />
                </div>
                <div className="mt-auto">
                  <h4 className="font-headline text-3xl font-black uppercase mb-2">{tier.name}</h4>
                  <div className={`flex justify-between items-center border-t-2 ${tier.borderColor} pt-4`}>
                    <span className={`font-label text-sm uppercase ${tier.labelColor}`}>{tier.label}</span>
                    <span className="font-headline text-xl font-black text-primary">{tier.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CinePass Tiers (subscription plans) — PRESERVED UNTOUCHED ──── */}
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

      {/* ── CTA connect wallet — PRESERVED UNTOUCHED ─────────────────────── */}
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
