import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Polaroid } from "../components/ui/Polaroid";
import { PlayCircle, RefreshCw, Filter, Star, Award } from "lucide-react";
import { films } from "../data/mockData";

interface GalleryScreenProps {
  setView: (view: string, filmId?: number) => void;
}

type FilterType = "All" | "Now Minting" | "Funded" | "Released" | "Sci-Fi" | "Drama" | "Documentary";

export function GalleryScreen({ setView }: GalleryScreenProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");

  const filters: FilterType[] = ["All", "Now Minting", "Funded", "Released", "Sci-Fi", "Drama", "Documentary"];

  const filteredFilms = films.filter((film) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Now Minting" || activeFilter === "Funded" || activeFilter === "Released") {
      return film.status === activeFilter;
    }
    return film.genre === activeFilter;
  });

  const featured = films[0]; // The Silent Echo

  return (
    <div className="w-full pt-16">
      {/* Featured Film Hero */}
      <section className="relative w-full h-[70vh] bg-on-surface overflow-hidden flex items-end pb-16">
        <div className="absolute inset-0 z-0">
          <img
            src={featured.image}
            alt={featured.title}
            className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-on-surface via-on-surface/50 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="flex flex-col md:flex-row justify-between items-end">
            <div className="max-w-3xl">
              {/* Festival badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {featured.festivalBadges.map((badge) => (
                  <span key={badge} className="inline-flex items-center bg-primary text-white font-label text-xs uppercase tracking-widest px-3 py-1 font-bold">
                    <Award className="h-3 w-3 mr-1" />
                    {badge}
                  </span>
                ))}
                {featured.curatorEndorsed && (
                  <span className="inline-flex items-center bg-secondary text-white font-label text-xs uppercase tracking-widest px-3 py-1 font-bold">
                    <Star className="h-3 w-3 mr-1" />
                    Curator Endorsed
                  </span>
                )}
              </div>
              <div className="inline-flex items-center space-x-2 bg-primary px-3 py-1 mb-6 text-white font-label text-xs uppercase tracking-widest font-bold">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Now Minting
              </div>
              <h1 className="text-6xl md:text-8xl font-headline font-black uppercase tracking-tighter text-surface-container-lowest leading-none mb-4">
                {featured.title}
              </h1>
              <p className="text-xl font-body text-surface-variant mb-8 max-w-2xl">
                {featured.synopsis.substring(0, 120)}...
              </p>
              <div className="flex space-x-4">
                <Button size="lg" className="group" onClick={() => setView("film", featured.id)}>
                  <PlayCircle className="mr-2 h-5 w-5" />
                  View Film
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-surface-container-lowest text-surface-container-lowest hover:bg-surface-container-lowest hover:text-on-surface"
                  onClick={() => setView("film", featured.id)}
                >
                  Mint Access
                </Button>
              </div>
            </div>
            <div className="hidden md:block text-right mt-8 md:mt-0">
              <p className="font-label text-sm uppercase tracking-widest text-outline-variant mb-2">Funding Goal</p>
              <p className="font-headline font-black text-4xl text-surface-container-lowest">
                {Math.round((featured.fundingRaised / featured.fundingGoal) * 100)}%
              </p>
              <div className="w-48 h-2 bg-surface-variant/20 mt-2">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${Math.round((featured.fundingRaised / featured.fundingGoal) * 100)}%` }}
                />
              </div>
              <p className="font-label text-xs mt-2 text-outline-variant uppercase tracking-widest">
                {featured.backers} backers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="sticky top-16 z-30 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex space-x-6 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`font-label text-sm uppercase tracking-widest whitespace-nowrap transition-colors pb-1 ${
                  activeFilter === filter
                    ? "text-primary font-bold border-b-2 border-primary"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          <button className="hidden md:flex items-center font-label text-sm uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {filteredFilms.map((film) => (
              <div
                key={film.id}
                className="cursor-pointer group relative"
                onClick={() => setView("film", film.id)}
              >
                {/* Festival badge overlay */}
                {film.festivalBadges.length > 0 && (
                  <div className="absolute top-2 left-2 z-10 bg-primary text-white font-label text-xs uppercase tracking-widest px-2 py-1 font-bold flex items-center">
                    <Award className="h-3 w-3 mr-1" />
                    {film.festivalBadges[0]}
                  </div>
                )}
                {/* Curator badge overlay */}
                {film.curatorEndorsed && (
                  <div className="absolute top-2 right-2 z-10 bg-secondary text-white font-label text-xs uppercase tracking-widest px-2 py-1 font-bold flex items-center">
                    <Star className="h-3 w-3 mr-1" />
                    Curated
                  </div>
                )}
                <Polaroid
                  imageUrl={film.image}
                  title={film.title}
                  subtitle={`${film.genre} · ${film.year}`}
                  className="group-hover:-translate-y-2 transition-transform duration-300"
                />
                <div className="mt-3 flex justify-between items-center px-1">
                  <span className={`inline-block px-2 py-1 font-label text-xs uppercase tracking-widest font-bold ${
                    film.status === "Now Minting" ? "bg-primary/10 text-primary" :
                    film.status === "Funded" ? "bg-tertiary/10 text-tertiary" :
                    "bg-surface-container text-on-surface-variant"
                  }`}>
                    {film.status}
                  </span>
                  <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
                    From {film.tokens.rental.price} CC
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredFilms.length === 0 && (
            <div className="text-center py-24">
              <p className="font-headline font-bold text-3xl uppercase tracking-tight text-on-surface-variant mb-2">
                No films match "{activeFilter}"
              </p>
              <Button variant="outline" onClick={() => setActiveFilter("All")}>Show All</Button>
            </div>
          )}

          <div className="mt-20 text-center">
            <Button variant="outline" size="lg" className="group">
              <RefreshCw className="mr-2 h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
              Load More
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
