import { useState, useEffect } from "react";
import { Button } from "../components/ui/Button";
import { RainbowStripe } from "../components/ui/RainbowStripe";
import {
  Film, BarChart3, Users, Settings, Shield, Upload, TrendingUp, DollarSign, Eye, 
  Layers, Calendar, ChevronRight, LogIn, Save, ShieldAlert, ExternalLink, Download
} from "lucide-react";
import type { DbUser, DbFilm } from "../lib/supabase";
import { fetchFilmmakerFilms, updateUserProfile } from "../lib/auth";

interface StudioScreenProps {
  setView: (view: string, filmId?: string, curatorHandle?: string) => void;
  currentUser: DbUser | null;
}

type StudioTab = "overview" | "projects" | "analytics" | "rights" | "piracy" | "settings";

const tabItems: { id: StudioTab; label: string; icon: typeof Film }[] = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "projects", label: "My Films", icon: Film },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
  { id: "rights", label: "Rights & Contracts", icon: Layers },
  { id: "piracy", label: "Piracy", icon: Shield },
  { id: "settings", label: "Settings", icon: Settings },
];

export function StudioScreen({ setView, currentUser }: StudioScreenProps) {
  const [activeTab, setActiveTab] = useState<StudioTab>("overview");
  const [dbFilms, setDbFilms] = useState<DbFilm[]>([]);
  const [displayName, setDisplayName] = useState(currentUser?.display_name || "");
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar_url || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchFilmmakerFilms(currentUser.id).then(setDbFilms);
    }
  }, [currentUser]);

  const handleSaveSettings = async () => {
    if (!currentUser) return;
    setSaving(true);
    try {
      await updateUserProfile(currentUser.id, {
        display_name: displayName || undefined,
        avatar_url: avatarUrl || undefined,
      });
      alert("Profile updated!");
    } catch (err) {
      console.error("Failed to update:", err);
    }
    setSaving(false);
  };

  const quickStats = [
    { label: "Total Films", value: dbFilms.length.toString(), color: "text-primary", icon: Film },
    { label: "Total Revenue", value: "24,800 CC", color: "text-secondary", icon: DollarSign },
    { label: "Token Holders", value: "1,247", color: "text-tertiary", icon: Users },
    { label: "Active Streams", value: "89", color: "text-on-surface", icon: Eye },
  ];
  
  // Empty array until user adds the piracy_detections table
  const dbPiracyDetections: any[] = [];

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar */}
      <aside className="w-64 bg-on-surface text-surface-container-lowest flex flex-col fixed inset-y-0 left-0 z-30">
        <RainbowStripe className="h-1" />
        
        <div className="p-6">
          <div className="flex items-center mb-8 cursor-pointer" onClick={() => setView("landing")}>
            <Film className="h-6 w-6 text-primary" />
            <span className="ml-2 font-headline font-black text-xl tracking-tighter uppercase">
              Cine<span className="text-primary">Chain</span>
            </span>
          </div>

          <div className="flex items-center mb-8 p-3 bg-surface-variant/10 border border-surface-variant/20">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-headline font-bold text-sm mr-3">
              {currentUser?.display_name ? currentUser.display_name.slice(0, 2).toUpperCase() : (currentUser?.wallet_address ? currentUser.wallet_address.slice(2, 4).toUpperCase() : "??")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-headline font-bold text-sm uppercase tracking-tight truncate">
                {currentUser?.display_name || (currentUser?.wallet_address ? `0x${currentUser.wallet_address.slice(2, 6)}...${currentUser.wallet_address.slice(-4)}` : "Not Connected")}
              </p>
              <p className="font-label text-[10px] uppercase tracking-widest text-outline-variant">Filmmaker</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {tabItems.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-4 py-3 font-label text-sm uppercase tracking-widest transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-white font-bold"
                    : "text-surface-variant hover:text-surface-container-lowest hover:bg-surface-variant/10"
                }`}
              >
                <Icon className="h-4 w-4 mr-3" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-surface-variant/20">
          <Button className="w-full bg-primary text-white" size="sm" onClick={() => setView("submit")}>
            <Upload className="h-4 w-4 mr-2" />
            New Upload
          </Button>
          <button onClick={() => setView("landing")} className="w-full mt-3 font-label text-[10px] uppercase tracking-widest text-outline-variant hover:text-surface-container-lowest transition-colors text-center py-2">
            ← Back to Platform
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div>
            <div className="flex justify-between items-end mb-8 border-b-2 border-on-surface pb-4">
              <div>
                <h1 className="text-4xl font-headline font-black uppercase tracking-tighter mb-2">Studio Dashboard</h1>
                <p className="font-body text-on-surface-variant">Manage your films, revenue, and distribution.</p>
              </div>
              <Button variant="outline" onClick={() => setView("revenue")}>
                <DollarSign className="h-4 w-4 mr-2" />
                Revenue Dashboard
              </Button>
            </div>

            <div className="grid grid-cols-4 gap-6 mb-12">
              {quickStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="bg-surface-container-lowest border border-outline-variant p-6 shadow-film relative overflow-hidden">
                    <RainbowStripe className="absolute top-0 left-0 h-1" />
                    <div className="flex items-center justify-between mb-4">
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <p className={`font-headline font-black text-3xl ${stat.color}`}>{stat.value}</p>
                    <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mt-1">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Recent Films */}
            <h2 className="text-2xl font-headline font-bold uppercase tracking-tight mb-6 border-b-2 border-on-surface pb-3">
              Recent Projects
            </h2>
            <div className="space-y-4">
              {dbFilms.slice(0, 3).map((film) => (
                <div key={film.id} className="bg-surface-container-lowest border border-outline-variant p-4 flex items-center shadow-film hover:shadow-film-hover transition-all duration-300">
                  <img src={film.poster_url || `https://picsum.photos/seed/${film.id}/100/60`} alt={film.title} className="w-20 h-14 object-cover mr-4" referrerPolicy="no-referrer" />
                  <div className="flex-1">
                    <h3 className="font-headline font-bold uppercase tracking-tight">{film.title}</h3>
                    <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">{film.upload_status} · {film.genre || "Independent"}</p>
                  </div>
                  <span className={`px-3 py-1 font-label text-xs uppercase tracking-widest font-bold ${
                    film.upload_status === "live" ? "bg-tertiary/10 text-tertiary" : "bg-outline/10 text-outline"
                  }`}>
                    {film.upload_status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MY FILMS */}
        {activeTab === "projects" && (
          <div>
            <div className="flex justify-between items-end mb-8 border-b-2 border-on-surface pb-4">
              <h1 className="text-4xl font-headline font-black uppercase tracking-tighter">My Films</h1>
              <Button onClick={() => setView("submit")}>
                <Upload className="h-4 w-4 mr-2" />
                Upload New Film
              </Button>
            </div>

            {/* DB Films first */}
            {dbFilms.length > 0 && (
              <div className="mb-8">
                <h3 className="font-label text-xs uppercase tracking-widest text-primary font-bold mb-4">Your Uploads</h3>
                <div className="space-y-4">
                  {dbFilms.map((film) => (
                    <div key={film.id} className="bg-surface-container-lowest border border-outline-variant p-6 shadow-film relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                      <div className="flex items-center">
                        <img src={film.poster_url || `https://picsum.photos/seed/${film.id}/120/80`} alt={film.title} className="w-28 h-20 object-cover mr-6" referrerPolicy="no-referrer" />
                        <div className="flex-1">
                          <h3 className="font-headline font-bold text-xl uppercase tracking-tight mb-1">{film.title}</h3>
                          <p className="font-body text-sm text-on-surface-variant mb-2">{film.description || "No description"}</p>
                          <div className="flex gap-4 font-label text-xs uppercase tracking-widest text-on-surface-variant">
                            <span>Dir: {film.director || "—"}</span>
                            <span>Year: {film.year || "—"}</span>
                            <span>Genre: {film.genre || "—"}</span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <span className={`px-3 py-1 font-label text-xs uppercase tracking-widest font-bold ${
                            film.upload_status === "live" ? "bg-tertiary/10 text-tertiary" :
                            film.upload_status === "processing" ? "bg-secondary/10 text-secondary" :
                            "bg-outline/10 text-outline"
                          }`}>
                            {film.upload_status}
                          </span>
                          <p className="font-label text-[10px] text-outline-variant mt-2 uppercase tracking-widest">
                            {new Date(film.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {dbFilms.length === 0 && (
              <div className="text-center py-12 bg-surface-container-lowest border border-outline-variant shadow-film mt-8">
                <Upload className="h-12 w-12 text-outline-variant mx-auto mb-4" />
                <p className="font-headline font-bold text-xl uppercase tracking-tight text-on-surface-variant mb-2">No uploads yet</p>
                <p className="font-body text-sm text-on-surface-variant mb-4">Submit your first film to see it listed here.</p>
                <Button onClick={() => setView("submit")}>Submit a Film</Button>
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS */}
        {activeTab === "analytics" && (
          <div>
            <h1 className="text-4xl font-headline font-black uppercase tracking-tighter mb-8 border-b-2 border-on-surface pb-4">
              Analytics
            </h1>

            <div className="grid grid-cols-3 gap-6 mb-12">
              {[
                { label: "Total Views", value: "12,847", change: "+18%", color: "text-primary" },
                { label: "Token Sales", value: "342", change: "+7%", color: "text-secondary" },
                { label: "Revenue (30d)", value: "8,420 CC", change: "+24%", color: "text-tertiary" },
              ].map((stat) => (
                <div key={stat.label} className="bg-surface-container-lowest border border-outline-variant p-6 shadow-film relative overflow-hidden">
                  <RainbowStripe className="absolute top-0 left-0 h-1" />
                  <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-2">{stat.label}</p>
                  <div className="flex items-end justify-between">
                    <p className={`font-headline font-black text-3xl ${stat.color}`}>{stat.value}</p>
                    <span className="font-label text-xs uppercase tracking-widest text-tertiary font-bold">{stat.change}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Monthly chart placeholder */}
            <div className="bg-surface-container-lowest border border-outline-variant p-8 shadow-film relative overflow-hidden mb-8">
              <RainbowStripe className="absolute top-0 left-0 h-1" />
              <h3 className="text-xl font-headline font-bold uppercase tracking-tight mb-6">Revenue Over Time</h3>
              <div className="flex items-end h-48 gap-3">
                {[35, 52, 41, 68, 55, 72, 61, 85, 78, 92, 88, 95].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-primary/80 hover:bg-primary transition-colors rounded-t" style={{ height: `${val}%` }} />
                    <span className="font-label text-[10px] text-on-surface-variant mt-2">
                      {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top performing tokens */}
            <div className="bg-surface-container-lowest border border-outline-variant p-8 shadow-film relative overflow-hidden">
              <RainbowStripe className="absolute top-0 left-0 h-1" />
              <h3 className="text-xl font-headline font-bold uppercase tracking-tight mb-6">Top Performing Tokens</h3>
              <div className="space-y-4">
                {[
                  { film: "Neon Dreams", type: "Collector", sold: 142, revenue: "5,680 CC" },
                  { film: "The Last Heist", type: "Ownership", sold: 89, revenue: "8,900 CC" },
                  { film: "Concrete Jungle", type: "Rental", sold: 312, revenue: "3,120 CC" },
                ].map((item) => (
                  <div key={item.film} className="flex items-center p-4 border border-outline-variant/50 hover:border-on-surface transition-colors">
                    <div className="flex-1">
                      <h4 className="font-headline font-bold uppercase tracking-tight">{item.film}</h4>
                      <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">{item.type} Tokens</p>
                    </div>
                    <div className="text-center px-6">
                      <p className="font-headline font-bold text-lg">{item.sold}</p>
                      <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-headline font-bold text-lg text-primary">{item.revenue}</p>
                      <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RIGHTS & CONTRACTS */}
        {activeTab === "rights" && (
          <div>
            <h1 className="text-4xl font-headline font-black uppercase tracking-tighter mb-8 border-b-2 border-on-surface pb-4">
              Rights & Contracts
            </h1>

            <div className="space-y-6">
              {dbFilms.slice(0, 3).map((film) => (
                <div key={film.id} className="bg-surface-container-lowest border border-outline-variant p-8 shadow-film relative overflow-hidden">
                  <RainbowStripe className="absolute top-0 left-0 h-1" />
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-headline font-bold uppercase tracking-tight mb-1">{film.title}</h3>
                      <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Content ID: {film.id}</p>
                    </div>
                    <span className="px-3 py-1 font-label text-xs uppercase tracking-widest font-bold bg-tertiary/10 text-tertiary">
                      Active
                    </span>
                  </div>

                  <h4 className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-4">Revenue Split (On-Chain)</h4>
                  <div className="space-y-3 mb-6">
                    {[
                      { party: "Director", pct: 40, color: "bg-primary" },
                      { party: "Producer", pct: 30, color: "bg-secondary" },
                      { party: "Crew", pct: 20, color: "bg-tertiary" },
                      { party: "Protocol", pct: 10, color: "bg-outline-variant" },
                    ].map((item) => (
                      <div key={item.party} className="flex items-center gap-4">
                        <span className="w-24 font-label text-xs uppercase tracking-widest text-on-surface-variant">{item.party}</span>
                        <div className="flex-1 h-2 bg-surface-container-high overflow-hidden">
                          <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                        </div>
                        <span className="font-headline font-bold w-12 text-right">{item.pct}%</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4 font-label text-xs uppercase tracking-widest text-on-surface-variant">
                    <span>Territory: Global</span>
                    <span>Duration: Perpetual</span>
                    <span>Resale Royalty: 10%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PIRACY */}
        {activeTab === "piracy" && (
          <div>
            <div className="flex items-center justify-between mb-8 border-b-2 border-on-surface pb-4">
              <h1 className="text-4xl font-headline font-black uppercase tracking-tighter flex items-center">
                <ShieldAlert className="h-8 w-8 text-error mr-3" />
                Piracy Detections
              </h1>
              <Button variant="outline" size="sm" onClick={() => alert("Forensic report exported!")}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8">
              {[
                { label: "Active", value: dbPiracyDetections.filter(d => d.status !== "Resolved").length.toString(), color: "text-error" },
                { label: "Resolved", value: dbPiracyDetections.filter(d => d.status === "Resolved").length.toString(), color: "text-tertiary" },
                { label: "Films Monitored", value: "6", color: "text-on-surface" },
              ].map((s) => (
                <div key={s.label} className="bg-surface-container-lowest border border-outline-variant p-6 text-center shadow-film">
                  <p className={`font-headline font-black text-3xl ${s.color}`}>{s.value}</p>
                  <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {dbPiracyDetections.map((detection) => (
                <div key={detection.id} className="bg-surface-container-lowest border border-outline-variant p-6 shadow-film flex items-center">
                  <img src={detection.filmImage} alt={detection.filmTitle} className="w-16 h-12 object-cover mr-4" referrerPolicy="no-referrer" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-headline font-bold uppercase tracking-tight">{detection.filmTitle}</h3>
                    <p className="font-mono text-xs text-on-surface-variant truncate">{detection.sourceUrl}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className={`px-2 py-1 font-label text-xs uppercase tracking-widest font-bold ${
                      detection.severity === "High" ? "bg-error/10 text-error" :
                      detection.severity === "Medium" ? "bg-tertiary/10 text-tertiary" :
                      "bg-surface-container text-outline"
                    }`}>
                      {detection.severity}
                    </span>
                    <span className={`px-2 py-1 font-label text-xs uppercase tracking-widest font-bold ${
                      detection.status === "Resolved" ? "bg-tertiary/10 text-tertiary" :
                      detection.status === "DMCA Sent" ? "bg-secondary/10 text-secondary" :
                      "bg-error/10 text-error"
                    }`}>
                      {detection.status}
                    </span>
                    <Button size="sm" variant="outline" onClick={() => alert("DMCA notice sent!")}>
                      Send DMCA
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === "settings" && (
          <div>
            <h1 className="text-4xl font-headline font-black uppercase tracking-tighter mb-8 border-b-2 border-on-surface pb-4">
              Settings
            </h1>

            <div className="max-w-2xl">
              <div className="bg-surface-container-lowest border border-outline-variant p-8 shadow-film relative overflow-hidden mb-8">
                <RainbowStripe className="absolute top-0 left-0 h-1" />
                <h3 className="text-xl font-headline font-bold uppercase tracking-tight mb-6">Profile</h3>

                <div className="space-y-6">
                  <div>
                    <label className="block font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-2">Wallet Address</label>
                    <p className="font-mono text-sm bg-surface-container-low border border-outline-variant p-3 text-on-surface-variant">
                      {currentUser?.wallet_address || "Not connected"}
                    </p>
                  </div>
                  <div>
                    <label className="block font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-2">Display Name</label>
                    <input
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder="Enter your display name..."
                      className="w-full bg-surface-container-low border border-outline-variant p-3 font-body text-on-surface focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-2">Avatar URL</label>
                    <input
                      value={avatarUrl}
                      onChange={e => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.png"
                      className="w-full bg-surface-container-low border border-outline-variant p-3 font-body text-on-surface focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <Button onClick={handleSaveSettings} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant p-8 shadow-film relative overflow-hidden">
                <RainbowStripe className="absolute top-0 left-0 h-1" />
                <h3 className="text-xl font-headline font-bold uppercase tracking-tight mb-6">Account</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">CineCredit Balance</span>
                    <span className="font-headline font-bold text-lg text-primary">{currentUser?.credit_balance?.toLocaleString() || 0} CC</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">CinePass Tier</span>
                    <span className="font-headline font-bold">{currentUser?.cinepass_tier ? currentUser.cinepass_tier.charAt(0).toUpperCase() + currentUser.cinepass_tier.slice(1) : "None"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">KYC Status</span>
                    <span className={`font-label text-xs uppercase tracking-widest font-bold ${
                      currentUser?.kyc_status === "approved" ? "text-tertiary" : "text-outline"
                    }`}>
                      {currentUser?.kyc_status || "None"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Member Since</span>
                    <span className="font-body text-sm">{currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString() : "—"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
