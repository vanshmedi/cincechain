import { useState, useEffect } from "react";
import { Button } from "../components/ui/Button";
import { RainbowStripe } from "../components/ui/RainbowStripe";
import { Polaroid } from "../components/ui/Polaroid";
import { Star, Award, TrendingUp, Film } from "lucide-react";
import type { DbFilm } from "../lib/supabase";
import { fetchDbFilms } from "../lib/auth";

interface CuratorProfileScreenProps {
  curatorHandle: string;
  setView: (view: string, filmId?: string, curatorHandle?: string) => void;
}

// Inline mock curator profile to preserve UX until a backend table is added
const fallbackCurator = {
  id: 1,
  handle: "lensflare",
  displayName: "Nadine R.",
  bio: "Former festival programmer turned decentralized cinema advocate. Searching for bold voices in Latin American sci-fi and global documentaries.",
  avatar: "NR",
  memberSince: "2023",
  reputation: 94,
  endorsements: 12,
  totalVolume: 450000,
};

export function CuratorProfileScreen({ curatorHandle, setView }: CuratorProfileScreenProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [dbFilms, setDbFilms] = useState<DbFilm[]>([]);

  useEffect(() => {
    fetchDbFilms().then(setDbFilms);
  }, []);

  const curator = fallbackCurator;
  curator.handle = curatorHandle || fallbackCurator.handle;
  
  // Use recent DB films as endorsed films
  const endorsedFilms = dbFilms.slice(0, 3);

  const reputationColor =
    curator.reputation >= 90 ? "text-primary" : curator.reputation >= 75 ? "text-tertiary" : "text-on-surface";

  return (
    <div className="w-full pt-16 bg-surface min-h-screen">
      {/* Hero banner */}
      <div className="w-full bg-on-surface pt-20 pb-16 relative overflow-hidden">
        <RainbowStripe className="absolute top-0 left-0 h-3 w-full" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            {/* Avatar */}
            <div className="w-24 h-24 bg-primary text-white flex items-center justify-center font-headline font-black text-3xl shadow-film flex-shrink-0">
              {curator.avatar}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-3 mb-3">
                <span className="inline-flex items-center bg-secondary text-white font-label text-xs uppercase tracking-widest px-3 py-1 font-bold">
                  <Star className="h-3 w-3 mr-1" />
                  Verified Curator
                </span>
                <span className="inline-flex items-center bg-surface-variant/10 border border-surface-variant/20 text-outline-variant font-label text-xs uppercase tracking-widest px-3 py-1">
                  Since {curator.memberSince}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-headline font-black uppercase tracking-tighter text-surface-container-lowest mb-2">
                {curator.displayName}
              </h1>
              <p className="font-label text-sm uppercase tracking-widest text-outline-variant mb-3">
                @{curator.handle}
              </p>
              <p className="font-body text-lg text-surface-variant max-w-xl">{curator.bio}</p>
            </div>

            {/* Reputation score */}
            <div className="bg-surface-container-lowest/10 border border-surface-variant/20 p-6 text-center flex-shrink-0">
              <p className="font-label text-xs uppercase tracking-widest text-outline-variant mb-2">Reputation</p>
              <p className={`font-headline font-black text-5xl ${reputationColor}`}>{curator.reputation}</p>
              <p className="font-label text-xs uppercase tracking-widest text-outline-variant mt-1">/100</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-surface-container border-b border-outline-variant/30 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { label: "Films Endorsed", value: curator.endorsements.toString(), color: "text-primary" },
              { label: "Total Curated Volume", value: `${(curator.totalVolume / 1000).toFixed(1)}K CC`, color: "text-secondary" },
              { label: "Reputation Score", value: `${curator.reputation}/100`, color: "text-tertiary" },
            ].map((s) => (
              <div key={s.label}>
                <p className={`font-headline font-black text-3xl ${s.color}`}>{s.value}</p>
                <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Endorsed films */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-8 border-b-2 border-on-surface pb-4">
              <Film className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-3xl font-headline font-bold uppercase tracking-tight">Endorsed Films</h2>
            </div>
            
            {endorsedFilms.length === 0 && (
              <p className="text-surface-variant italic font-body">No films endorsed yet or loading...</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {endorsedFilms.map((film) => (
                <div
                  key={film.id}
                  className="group cursor-pointer"
                  onClick={() => setView("film", String(film.id))}
                >
                  <div className="relative">
                    <Polaroid
                      imageUrl={film.poster_url || `https://picsum.photos/seed/${film.id}/400/300`}
                      title={film.title}
                      subtitle={`${film.genre || "Indie"} · ${film.year || "2024"}`}
                    />
                    {/* Curator badge overlay */}
                    <div className="absolute top-2 left-2 bg-secondary text-white font-label text-xs uppercase tracking-widest px-2 py-1 font-bold flex items-center">
                      <Star className="h-3 w-3 mr-1" />
                      Endorsed
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Curation activity */}
            <div className="bg-on-surface text-surface-container-lowest p-8 relative overflow-hidden shadow-film">
              <RainbowStripe className="absolute top-0 left-0 h-2" />
              <div className="flex items-center mb-6 border-b border-surface-variant/20 pb-4">
                <TrendingUp className="h-5 w-5 text-primary mr-3" />
                <h3 className="text-2xl font-headline font-bold uppercase tracking-tight">Activity</h3>
              </div>
              <div className="space-y-4">
                {endorsedFilms.map((film) => (
                  <div key={film.id} className="flex items-center justify-between py-2 border-b border-surface-variant/10">
                    <div>
                      <p className="font-body text-sm font-bold text-surface-container-lowest">{film.title}</p>
                      <p className="font-label text-xs uppercase tracking-widest text-outline-variant">Endorsed</p>
                    </div>
                    <span className="font-label text-xs uppercase tracking-widest text-outline-variant">
                      {film.genre || "Indie"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Curator badge info */}
            <div className="bg-surface-container-lowest border border-outline-variant p-6 shadow-film relative overflow-hidden">
              <RainbowStripe className="absolute top-0 left-0 h-1" />
              <div className="flex items-center mb-4">
                <Star className="h-6 w-6 text-secondary mr-3" />
                <h3 className="text-xl font-headline font-bold uppercase tracking-tight">Curator Badge</h3>
              </div>
              <p className="font-body text-sm text-on-surface-variant mb-6 leading-relaxed">
                The Curator badge is earned through active endorsement history and community validation.
                Curators with score &gt;85 gain <strong>Curator CinePass</strong> benefits automatically.
              </p>
              <Button 
                variant={isFollowing ? "primary" : "outline"} 
                className="w-full text-sm"
                onClick={() => {
                  setIsFollowing(!isFollowing);
                  if (!isFollowing) {
                    alert("You are now subscribed to this curator's on-chain endorsements!");
                  }
                }}
              >
                {isFollowing ? "Following" : "Follow Curator"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
