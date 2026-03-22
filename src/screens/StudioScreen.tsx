import React, { useState } from "react";
import { Button } from "../components/ui/Button";
import { RainbowStripe } from "../components/ui/RainbowStripe";
import {
  LayoutDashboard,
  UploadCloud,
  Settings,
  Users,
  BarChart3,
  Film,
  Plus,
  MoreVertical,
  ShieldAlert,
  DollarSign,
} from "lucide-react";
import { films } from "../data/mockData";

interface StudioScreenProps {
  setView: (view: string, filmId?: number, curatorHandle?: string) => void;
}

type StudioTab = "overview" | "projects" | "assets" | "team" | "analytics";

const myFilms = films.slice(0, 3);

export function StudioScreen({ setView }: StudioScreenProps) {
  const [activeTab, setActiveTab] = useState<StudioTab>("overview");

  const sidebarItems: { id: StudioTab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="h-5 w-5 mr-3" /> },
    { id: "projects", label: "Projects", icon: <Film className="h-5 w-5 mr-3" /> },
    { id: "assets", label: "Assets", icon: <UploadCloud className="h-5 w-5 mr-3" /> },
    { id: "team", label: "Team", icon: <Users className="h-5 w-5 mr-3" /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 className="h-5 w-5 mr-3" /> },
  ];

  const statusColors: Record<string, string> = {
    "In Production": "bg-tertiary/10 text-tertiary",
    "Post-Production": "bg-secondary/10 text-secondary",
    "Pre-Production": "bg-outline/10 text-outline",
    Released: "bg-primary/10 text-primary",
  };

  return (
    <div className="w-full pt-16 bg-surface min-h-screen flex flex-col md:flex-row relative">
      <button
        onClick={() => setView('landing')}
        className="fixed top-4 left-4 z-50 flex items-center bg-surface-container-lowest border border-outline-variant px-4 py-2 font-label text-xs uppercase tracking-widest font-bold text-on-surface hover:text-primary hover:border-primary transition-all shadow-sm"
      >
        ⬅ Back to Platform
      </button>

      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-surface-container-lowest border-r border-outline-variant/30 hidden md:flex flex-col h-[calc(100vh-4rem)] sticky top-16">
        <div className="p-6 border-b border-outline-variant/30">
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 bg-primary text-white flex items-center justify-center font-headline font-black text-xl mr-3">
              S1
            </div>
            <div>
              <h2 className="font-headline font-bold uppercase tracking-tight text-on-surface">Studio One</h2>
              <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Creator Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-4 py-3 font-label text-sm uppercase tracking-widest transition-colors text-left ${
                activeTab === item.id
                  ? "bg-surface-container text-primary font-bold border-l-4 border-primary"
                  : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-outline-variant/30 space-y-2">
          <button
            onClick={() => setView("revenue")}
            className="w-full flex items-center px-4 py-3 text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-label text-sm uppercase tracking-widest"
          >
            <DollarSign className="h-5 w-5 mr-3" />
            Revenue
          </button>
          <button
            onClick={() => setView("piracy")}
            className="w-full flex items-center px-4 py-3 text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-label text-sm uppercase tracking-widest"
          >
            <ShieldAlert className="h-5 w-5 mr-3" />
            Piracy
          </button>
          <button className="w-full flex items-center px-4 py-3 text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-label text-sm uppercase tracking-widest">
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 border-b-4 border-on-surface pb-6">
            <div>
              <h1 className="text-4xl md:text-6xl font-headline font-black uppercase tracking-tighter text-on-surface mb-2">
                Dashboard
              </h1>
              <p className="font-body text-on-surface-variant">
                Welcome back, Director. You have {myFilms.length} active projects.
              </p>
            </div>
            <Button className="mt-6 sm:mt-0" onClick={() => setView("submit")}>
              <Plus className="h-5 w-5 mr-2" />
              New Project
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            <div className="bg-surface-container-lowest border border-outline-variant p-6 shadow-film relative overflow-hidden cursor-pointer hover:-translate-y-1 transition-transform" onClick={() => setView("revenue")}>
              <RainbowStripe className="absolute top-0 left-0 h-1" />
              <p className="font-label text-xs uppercase tracking-widest text-outline-variant mb-2">Total Revenue Earned</p>
              <p className="font-headline font-black text-4xl text-on-surface">142,500 CC</p>
              <p className="font-body text-sm text-tertiary mt-2 font-bold flex items-center">
                <BarChart3 className="h-4 w-4 mr-1" /> +12% this month
              </p>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant p-6 shadow-film relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
              <p className="font-label text-xs uppercase tracking-widest text-outline-variant mb-2">Active Backers</p>
              <p className="font-headline font-black text-4xl text-on-surface">1,204</p>
              <p className="font-body text-sm text-on-surface-variant mt-2">Across {myFilms.length} projects</p>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant p-6 shadow-film relative overflow-hidden cursor-pointer hover:-translate-y-1 transition-transform" onClick={() => setView("piracy")}>
              <div className="absolute top-0 left-0 w-full h-1 bg-secondary" />
              <p className="font-label text-xs uppercase tracking-widest text-outline-variant mb-2">Piracy Detections</p>
              <p className="font-headline font-black text-4xl text-on-surface">2</p>
              <p className="font-body text-sm text-error mt-2 font-bold">1 requires immediate action</p>
            </div>
          </div>

          {/* Active Projects */}
          <div className="mb-12">
            <h2 className="text-2xl font-headline font-bold uppercase tracking-tight mb-6 flex items-center">
              <Film className="h-6 w-6 text-primary mr-3" />
              Active Projects
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {myFilms.map((project) => {
                const progress = Math.round((project.fundingRaised / project.fundingGoal) * 100);
                const statusKey = project.status === "Now Minting" ? "In Production" :
                  project.status === "Released" ? "Released" : "Pre-Production";
                return (
                  <div
                    key={project.id}
                    className="bg-surface-container-lowest border border-outline-variant flex flex-col sm:flex-row overflow-hidden shadow-film hover:-translate-y-1 transition-transform group cursor-pointer"
                    onClick={() => setView("film", project.id)}
                  >
                    <div className="w-full sm:w-48 h-48 sm:h-auto bg-surface-container relative">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 left-2">
                        <span className={`font-label text-[10px] uppercase tracking-widest px-2 py-1 font-bold ${statusColors[statusKey] || "bg-outline/10 text-outline"}`}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between relative">
                      <button className="absolute top-4 right-4 text-outline hover:text-on-surface transition-colors" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      <div>
                        <h3 className="font-headline font-bold text-xl uppercase tracking-tight mb-2 pr-6">
                          {project.title}
                        </h3>
                        <p className="font-body text-sm text-on-surface-variant mb-6">
                          {project.backers} backers · {project.genre}
                        </p>
                      </div>
                      <div>
                        <div className="flex justify-between items-end mb-2">
                          <span className="font-label text-xs uppercase tracking-widest text-outline-variant">Funding</span>
                          <span className="font-headline font-bold text-sm text-on-surface">{progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-surface-container-high overflow-hidden">
                          <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Revenue Dashboard", icon: <DollarSign className="h-5 w-5" />, view: "revenue" },
              { label: "Piracy Alerts", icon: <ShieldAlert className="h-5 w-5" />, view: "piracy" },
              { label: "Submit New Film", icon: <Plus className="h-5 w-5" />, view: "submit" },
              { label: "Governance", icon: <BarChart3 className="h-5 w-5" />, view: "governance" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => setView(item.view)}
                className="flex flex-col items-center p-6 bg-surface-container-lowest border border-outline-variant hover:border-primary hover:bg-primary/5 transition-all duration-200 shadow-film group"
              >
                <div className="text-primary mb-3 group-hover:scale-110 transition-transform">{item.icon}</div>
                <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant text-center">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
