import { Button } from "../components/ui/Button";
import { RainbowStripe } from "../components/ui/RainbowStripe";
import { MessageSquare, Users, Activity, ArrowUpRight, Star } from "lucide-react";

interface CommunityScreenProps {
  setView: (view: string, filmId?: number, curatorHandle?: string) => void;
}

const threads = [
  { id: 1, title: "Proposal: Increase funding pool for documentary category — CIP-042", author: "DocuMaker99", replies: 142, time: "2h ago", tag: "Governance" },
  { id: 2, title: "Feedback on 'Neon Dreams' rough cut (Spoilers)", author: "CyberCinephile", replies: 89, time: "5h ago", tag: "Discussion" },
  { id: 3, title: "Seeking VFX artist for upcoming sci-fi short", author: "DirectorX", replies: 12, time: "1d ago", tag: "Collaboration" },
  { id: 4, title: "CinePass v2.1 Update — Observer / Curator / Auteur tier changes", author: "CoreTeam", replies: 305, time: "2d ago", tag: "Announcement" },
];

const curators = [
  { name: "Daria Morozova", handle: "CineVault Curator", avatar: "DM", reputation: 94 },
  { name: "Takeshi Yamamoto", handle: "NeonCurator", avatar: "TY", reputation: 88 },
  { name: "Elena Rostova", role: "Director", avatar: "ER" },
  { name: "Marcus Chen", role: "Producer", avatar: "MC" },
  { name: "Sarah Jenkins", role: "Cinematographer", avatar: "SJ" },
  { name: "David Kim", role: "Editor", avatar: "DK" },
];

export function CommunityScreen({ setView }: CommunityScreenProps) {
  return (
    <div className="w-full pt-16 bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b-4 border-on-surface pb-8">
          <div>
            <h1 className="text-6xl md:text-8xl font-headline font-black uppercase tracking-tighter text-on-surface mb-4">
              Discourse
            </h1>
            <p className="text-xl font-body text-on-surface-variant max-w-2xl">
              The town square of the collective. Debate proposals, find collaborators, and shape the future of the protocol.
            </p>
          </div>
          <div className="flex gap-4 mt-8 md:mt-0">
            <Button size="lg" onClick={() => alert('Community forums and messaging will unlock in V2 post-mainnet launch!')}>New Thread</Button>
            <Button size="lg" variant="outline" onClick={() => setView("governance")}>
              Governance
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content - Hot Threads */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-8">
              <MessageSquare className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-3xl font-headline font-bold uppercase tracking-tight">Hot Threads</h2>
            </div>

            <div className="space-y-6">
              {threads.map((thread) => (
                <div
                  key={thread.id}
                  className="bg-surface-container-lowest border border-outline-variant p-6 shadow-film hover:-translate-y-1 hover:shadow-film-hover transition-all duration-300 cursor-pointer group"
                  onClick={() => alert('Community forums and messaging will unlock in V2 post-mainnet launch!')}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={`inline-block px-2 py-1 font-label text-xs uppercase tracking-widest font-bold ${
                      thread.tag === "Governance" ? "bg-primary/10 text-primary" :
                      thread.tag === "Announcement" ? "bg-secondary/10 text-secondary" :
                      thread.tag === "Collaboration" ? "bg-tertiary/10 text-tertiary" :
                      "bg-surface-container text-on-surface-variant"
                    }`}>
                      {thread.tag}
                      {thread.tag === "Governance" && (
                        <span
                          className="ml-2 underline cursor-pointer"
                          onClick={(e) => { e.stopPropagation(); setView("governance"); }}
                        >
                          Vote →
                        </span>
                      )}
                    </span>
                    <span className="font-label text-xs text-outline-variant uppercase tracking-widest">{thread.time}</span>
                  </div>
                  <h3 className="text-2xl font-headline font-bold text-on-surface mb-2 group-hover:text-primary transition-colors">
                    {thread.title}
                  </h3>
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-outline-variant/30">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-label text-xs font-bold mr-3">
                        {thread.author.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-body text-sm text-on-surface-variant font-bold">{thread.author}</span>
                    </div>
                    <div className="flex items-center text-on-surface-variant font-label text-sm font-bold">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {thread.replies}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Button variant="outline" onClick={() => alert('Community forums and messaging will unlock in V2 post-mainnet launch!')}>View All Discussions</Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-12">
            {/* Top Curators */}
            <div>
              <div className="flex items-center mb-6 border-b-2 border-on-surface pb-2">
                <Star className="h-5 w-5 text-secondary mr-3" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-tight">Top Curators</h2>
              </div>
              <div className="space-y-3">
                {curators.slice(0, 2).map((curator, i) => (
                  <div
                    key={i}
                    className="bg-surface-container-lowest border border-outline-variant p-4 flex items-center hover:bg-surface-container transition-colors cursor-pointer group"
                    onClick={() => setView("curator", undefined, curator.handle)}
                  >
                    <div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center font-headline font-bold text-sm mr-3 flex-shrink-0">
                      {curator.avatar}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-headline font-bold text-sm uppercase tracking-tight group-hover:text-primary transition-colors">{curator.name}</h4>
                      <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest">@{curator.handle}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-headline font-black text-lg text-primary">{(curator as any).reputation}</p>
                      <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">rep</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-outline ml-3 group-hover:text-primary transition-colors" />
                  </div>
                ))}
              </div>
            </div>

            {/* The Collective */}
            <div>
              <div className="flex items-center mb-6 border-b-2 border-on-surface pb-2">
                <Users className="h-5 w-5 text-secondary mr-3" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-tight">The Collective</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {curators.slice(2).map((member, i) => (
                  <div
                    key={i}
                    className="bg-surface-container-lowest border border-outline-variant p-4 flex flex-col items-center text-center hover:bg-surface-container transition-colors cursor-pointer"
                    onClick={() => alert('Community forums and messaging will unlock in V2 post-mainnet launch!')}
                  >
                    <div className="w-12 h-12 rounded-full bg-tertiary text-white flex items-center justify-center font-headline font-bold text-lg mb-3">
                      {member.avatar}
                    </div>
                    <h4 className="font-headline font-bold text-sm uppercase tracking-tight mb-1">{member.name}</h4>
                    <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest">{(member as any).role}</p>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4 text-xs tracking-widest">
                View Directory <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </div>

            {/* System Telemetry */}
            <div className="bg-on-surface text-surface-container-lowest p-8 relative overflow-hidden shadow-film">
              <RainbowStripe className="absolute top-0 left-0 h-2" />
              <div className="flex items-center mb-6 border-b border-surface-variant/20 pb-4">
                <Activity className="h-5 w-5 text-primary mr-3" />
                <h2 className="text-2xl font-headline font-bold uppercase tracking-tight">Telemetry</h2>
              </div>
              <div className="space-y-6">
                {[
                  { label: "Total Value Locked", value: "$12.4M", color: "text-primary" },
                  { label: "Active Proposals", value: "2", color: "text-secondary" },
                  { label: "Films Funded", value: "24", color: "text-tertiary" },
                  { label: "Protocol Fee", value: "5%", color: "text-outline-variant" },
                  { label: "Resale Royalty", value: "10%", color: "text-outline-variant" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="font-label text-xs uppercase tracking-widest text-outline-variant mb-1">{s.label}</p>
                    <p className={`font-headline font-black text-3xl ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
