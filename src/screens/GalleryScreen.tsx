import { useState, useEffect } from "react";
import { Polaroid } from "../components/ui/Polaroid";
import { RainbowStripe } from "../components/ui/RainbowStripe";
import { Button } from "../components/ui/Button";
import { Filter, SlidersHorizontal, ArrowUpRight, AlertCircle, Star, Hexagon } from "lucide-react";

import type { DbFilm } from "../lib/supabase";
import { fetchDbFilms } from "../lib/auth";

interface GalleryScreenProps {
  setView: (view: string, filmId?: string, curatorHandle?: string) => void;
}

const genres = ["All", "Sci-Fi", "Crime", "Drama", "Documentary", "Horror", "Fantasy"];
const statuses = ["All", "Now Minting", "Funded", "In Production", "Released"];

export function GalleryScreen({ setView }: GalleryScreenProps) {
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [dbFilms, setDbFilms] = useState<DbFilm[]>([]);

  useEffect(() => {
    fetchDbFilms().then(setDbFilms);
  }, []);

  // Convert DB films to a common display structure
  const dbFilmCards = dbFilms.filter(
    (f) =>
      (selectedGenre === "All" || f.genre === selectedGenre) &&
      (selectedStatus === "All" || selectedStatus === "Now Minting") // DB films default to "live" status
  );

  // Featured film
  const featured = dbFilmCards.length > 0 ? dbFilmCards[0] : null;

  const featuredMeta = featured ? (featured.revenue_split as any) : null;

  return (
    <div className="w-full pt-16 bg-surface min-h-screen">
      {/* Header */}
      <div className="w-full bg-on-surface pt-20 pb-16 relative overflow-hidden">
        <RainbowStripe className="absolute top-0 left-0 h-3 w-full" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-surface-variant/10 border border-surface-variant/20 px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="font-label text-xs uppercase tracking-widest text-outline-variant">
              {dbFilmCards.length} Films Available
            </span>
          </div>
          <h1 className="text-6xl md:text-8xl font-headline font-black uppercase tracking-tighter text-surface-container-lowest mb-6">
            The Gallery
          </h1>
          <p className="text-xl font-body text-surface-variant max-w-2xl">
            Browse the collective's cinema catalog. Fund new projects, purchase tokens, and access decentralized films.
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-surface-container border-b border-outline-variant/30 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center mr-4">
              <Filter className="h-4 w-4 text-on-surface-variant mr-2" />
              <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold">Filters:</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`font-label text-[11px] uppercase tracking-widest px-3 py-1.5 transition-all ${
                    selectedGenre === genre
                      ? "bg-on-surface text-surface font-bold shadow-hard"
                      : "bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:border-on-surface"
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
            <div className="w-px h-6 bg-outline-variant/50 hidden md:block" />
            <div className="flex gap-2 flex-wrap">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`font-label text-[11px] uppercase tracking-widest px-3 py-1.5 transition-all ${
                    selectedStatus === status
                      ? "bg-on-surface text-surface font-bold shadow-hard"
                      : "bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:border-on-surface"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Featured film */}
        {featured && (
          <div
            className="mb-16 bg-on-surface text-surface-container-lowest p-8 md:p-12 shadow-film relative overflow-hidden cursor-pointer group"
            onClick={() => setView("film", featured.id)}
          >
            <RainbowStripe className="absolute top-0 left-0 h-2" />
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/2 aspect-video bg-surface-container overflow-hidden">
                <img src={featured.image} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
              </div>
              <div className="md:w-1/2 flex flex-col justify-center">
                <div className="flex gap-3 items-center mb-4">
                  <span className="px-3 py-1 font-label text-xs uppercase tracking-widest font-bold bg-primary text-white">{featuredMeta?.status || 'Live'}</span>
                  {featuredMeta?.curatorEndorsed && (
                    <span className="flex items-center px-2 py-1 font-label text-xs uppercase tracking-widest text-secondary">
                      <Star className="h-3 w-3 mr-1" fill="currentColor" />
                      Curator Pick
                    </span>
                  )}
                </div>
                <h2 className="text-4xl md:text-5xl font-headline font-black uppercase tracking-tighter mb-3">{featured.title}</h2>
                <p className="font-body text-surface-variant mb-6">{featured.description?.substring(0, 150)}...</p>
                <div className="flex gap-6">
                  <div>
                    <p className="font-headline font-black text-2xl text-primary">{featuredMeta?.fundingRaised?.toLocaleString() || 0} CC</p>
                    <p className="font-label text-xs uppercase tracking-widest text-outline-variant">Raised</p>
                  </div>
                  <div>
                    <p className="font-headline font-black text-2xl">{featuredMeta?.backers || 0}</p>
                    <p className="font-label text-xs uppercase tracking-widest text-outline-variant">Backers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DB Films Grid */}
        <div className="flex items-center justify-between mb-8 border-b-2 border-on-surface pb-3">
          <h3 className="text-2xl font-headline font-bold uppercase tracking-tight">All Films</h3>
          <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">{dbFilmCards.length} films</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {dbFilmCards.map((film) => {
            const meta = film.revenue_split as any;
            return (
              <div key={film.id} className="group cursor-pointer" onClick={() => setView("film", film.id)}>
                <div className="relative">
                  <Polaroid
                    imageUrl={film.poster_url || ""}
                    title={film.title}
                    subtitle={`${film.director || "Unknown"} · ${film.year} · ${film.genre || "Independent"}`}
                  />
                  <div className="absolute top-6 left-6 flex gap-2">
                    <span className={`px-2 py-1 font-label text-xs uppercase tracking-widest font-bold ${
                      meta?.status === "Now Minting" ? "bg-primary text-white" :
                      meta?.status === "Funded" ? "bg-tertiary text-white" :
                      meta?.status === "Released" ? "bg-secondary text-white" :
                      "bg-on-surface text-surface"
                    }`}>
                      {meta?.status || 'Live'}
                    </span>
                    {meta?.curatorEndorsed && (
                      <span className="px-2 py-1 font-label text-xs uppercase tracking-widest font-bold bg-secondary/90 text-white flex items-center">
                        <Star className="h-3 w-3 mr-1" fill="currentColor" />
                        Pick
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {dbFilmCards.length === 0 && (
          <div className="text-center py-16 bg-surface-container-lowest border border-outline-variant">
            <AlertCircle className="h-12 w-12 text-outline-variant mx-auto mb-4" />
            <p className="font-headline font-bold text-xl uppercase tracking-tight text-on-surface-variant mb-2">No films found</p>
            <p className="font-body text-sm text-on-surface-variant mb-4">
              Try adjusting your filters.
            </p>
            <Button variant="outline" onClick={() => { setSelectedGenre("All"); setSelectedStatus("All"); }}>
              Reset Filters
            </Button>
          </div>
        )}

        <div className="mt-12 text-center">
          <Button variant="outline" size="lg" onClick={() => alert('More films loading...')}>
            Load More Films
          </Button>
        </div>
      </div>
    </div>
  );
}
