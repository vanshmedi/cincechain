import { useState, useEffect } from "react";
import { Button } from "../components/ui/Button";
import { RainbowStripe } from "../components/ui/RainbowStripe";
import { MessageSquare, Users, Activity, ArrowUpRight, Star, Send, ChevronDown, ChevronUp, LogIn } from "lucide-react";
import type { DbUser, DbThread, DbThreadReply } from "../lib/supabase";
import { fetchThreads, createThread, fetchThreadReplies, createThreadReply } from "../lib/auth";

interface CommunityScreenProps {
  setView: (view: string, filmId?: number, curatorHandle?: string) => void;
  currentUser: DbUser | null;
  onConnect: () => void;
}

// Hardcoded fallback threads (shown when DB is empty)
const fallbackThreads = [
  { id: "mock-1", title: "Proposal: Increase funding pool for documentary category — CIP-042", author: "DocuMaker99", replies: 142, time: "2h ago", tag: "Governance" },
  { id: "mock-2", title: "Feedback on 'Neon Dreams' rough cut (Spoilers)", author: "CyberCinephile", replies: 89, time: "5h ago", tag: "Discussion" },
  { id: "mock-3", title: "Seeking VFX artist for upcoming sci-fi short", author: "DirectorX", replies: 12, time: "1d ago", tag: "Collaboration" },
  { id: "mock-4", title: "CinePass v2.1 Update — Observer / Curator / Auteur tier changes", author: "CoreTeam", replies: 305, time: "2d ago", tag: "Announcement" },
];

const curators = [
  { name: "Daria Morozova", handle: "CineVault Curator", avatar: "DM", reputation: 94 },
  { name: "Takeshi Yamamoto", handle: "NeonCurator", avatar: "TY", reputation: 88 },
  { name: "Elena Rostova", role: "Director", avatar: "ER" },
  { name: "Marcus Chen", role: "Producer", avatar: "MC" },
  { name: "Sarah Jenkins", role: "Cinematographer", avatar: "SJ" },
  { name: "David Kim", role: "Editor", avatar: "DK" },
];

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function CommunityScreen({ setView, currentUser, onConnect }: CommunityScreenProps) {
  const [dbThreads, setDbThreads] = useState<DbThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [expandedThread, setExpandedThread] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, DbThreadReply[]>>({});
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replyPosting, setReplyPosting] = useState<string | null>(null);

  useEffect(() => {
    loadThreads();
  }, []);

  const loadThreads = async () => {
    setLoading(true);
    const threads = await fetchThreads();
    setDbThreads(threads);
    setLoading(false);
  };

  const handlePost = async () => {
    if (!currentUser || !newTitle.trim() || !newBody.trim()) return;
    setPosting(true);

    // Optimistic UI — add thread immediately
    const optimistic: DbThread = {
      id: "optimistic-" + Date.now(),
      user_id: currentUser.id,
      title: newTitle,
      body: newBody,
      created_at: new Date().toISOString(),
      user: currentUser,
      reply_count: 0,
    };
    setDbThreads(prev => [optimistic, ...prev]);
    setNewTitle("");
    setNewBody("");
    setShowComposer(false);

    try {
      const real = await createThread(currentUser.id, optimistic.title, optimistic.body);
      setDbThreads(prev => prev.map(t => t.id === optimistic.id ? real : t));
    } catch (err) {
      console.error("Failed to create thread:", err);
      setDbThreads(prev => prev.filter(t => t.id !== optimistic.id));
    }
    setPosting(false);
  };

  const toggleReplies = async (threadId: string) => {
    if (expandedThread === threadId) {
      setExpandedThread(null);
      return;
    }
    setExpandedThread(threadId);
    if (!replies[threadId]) {
      const threadReplies = await fetchThreadReplies(threadId);
      setReplies(prev => ({ ...prev, [threadId]: threadReplies }));
    }
  };

  const handleReply = async (threadId: string) => {
    if (!currentUser || !replyText[threadId]?.trim()) return;
    setReplyPosting(threadId);
    try {
      const reply = await createThreadReply(threadId, currentUser.id, replyText[threadId]);
      setReplies(prev => ({
        ...prev,
        [threadId]: [...(prev[threadId] || []), reply],
      }));
      setReplyText(prev => ({ ...prev, [threadId]: "" }));
      setDbThreads(prev => prev.map(t => t.id === threadId ? { ...t, reply_count: (t.reply_count || 0) + 1 } : t));
    } catch (err) {
      console.error("Failed to reply:", err);
    }
    setReplyPosting(null);
  };

  const getUserDisplay = (user: any) => {
    if (!user) return { name: "Unknown", initials: "??" };
    const name = user.display_name || (user.wallet_address ? `0x${user.wallet_address.slice(2, 6)}...${user.wallet_address.slice(-4)}` : "Anon");
    const initials = name.slice(0, 2).toUpperCase();
    return { name, initials };
  };

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
            {currentUser && (
              <Button size="lg" onClick={() => setShowComposer(!showComposer)}>New Thread</Button>
            )}
            <Button size="lg" variant="outline" onClick={() => setView("governance")}>
              Governance
            </Button>
          </div>
        </div>

        {/* Thread Composer */}
        {showComposer && currentUser && (
          <div className="bg-surface-container-lowest border border-outline-variant p-8 shadow-film mb-10 relative overflow-hidden">
            <RainbowStripe className="absolute top-0 left-0 h-2" />
            <h3 className="text-xl font-headline font-bold uppercase tracking-tight mb-6">New Thread</h3>
            <input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Thread title..."
              className="w-full bg-transparent border-b-2 border-outline-variant py-3 font-headline text-xl font-bold text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-outline-variant/50 mb-4"
            />
            <textarea
              value={newBody}
              onChange={e => setNewBody(e.target.value)}
              placeholder="Write your thoughts..."
              rows={4}
              className="w-full bg-surface-container-low border border-outline-variant p-4 font-body text-on-surface focus:outline-none focus:border-primary transition-colors resize-none mb-4"
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowComposer(false)}>Cancel</Button>
              <Button onClick={handlePost} disabled={posting || !newTitle.trim() || !newBody.trim()}>
                <Send className="h-4 w-4 mr-2" />
                {posting ? "Posting..." : "Post Thread"}
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content - Threads */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-8">
              <MessageSquare className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-3xl font-headline font-bold uppercase tracking-tight">Threads</h2>
            </div>

            <div className="space-y-6">
              {/* DB Threads first */}
              {dbThreads.map((thread) => {
                const { name, initials } = getUserDisplay(thread.user);
                const isExpanded = expandedThread === thread.id;
                return (
                  <div key={thread.id}>
                    <div
                      className="bg-surface-container-lowest border border-outline-variant p-6 shadow-film hover:-translate-y-1 hover:shadow-film-hover transition-all duration-300 cursor-pointer group"
                      onClick={() => toggleReplies(thread.id)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="inline-block px-2 py-1 font-label text-xs uppercase tracking-widest font-bold bg-primary/10 text-primary">
                          Thread
                        </span>
                        <span className="font-label text-xs text-outline-variant uppercase tracking-widest">
                          {timeAgo(thread.created_at)}
                        </span>
                      </div>
                      <h3 className="text-2xl font-headline font-bold text-on-surface mb-2 group-hover:text-primary transition-colors">
                        {thread.title}
                      </h3>
                      <p className="font-body text-on-surface-variant mb-4 line-clamp-3">{thread.body}</p>
                      <div className="flex justify-between items-center mt-6 pt-4 border-t border-outline-variant/30">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-label text-xs font-bold mr-3">
                            {initials}
                          </div>
                          <span className="font-body text-sm text-on-surface-variant font-bold">{name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center text-on-surface-variant font-label text-sm font-bold">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            {thread.reply_count || 0}
                          </div>
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-primary" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </div>
                    </div>

                    {/* Replies */}
                    {isExpanded && (
                      <div className="ml-8 mt-2 space-y-3 border-l-2 border-primary/20 pl-6">
                        {(replies[thread.id] || []).map(reply => {
                          const r = getUserDisplay(reply.user);
                          return (
                            <div key={reply.id} className="bg-surface-container-low border border-outline-variant/50 p-4">
                              <div className="flex items-center mb-2">
                                <div className="w-6 h-6 rounded-full bg-tertiary text-white flex items-center justify-center font-label text-[10px] font-bold mr-2">
                                  {r.initials}
                                </div>
                                <span className="font-body text-xs text-on-surface-variant font-bold">{r.name}</span>
                                <span className="font-label text-[10px] text-outline-variant ml-2">{timeAgo(reply.created_at)}</span>
                              </div>
                              <p className="font-body text-sm text-on-surface">{reply.body}</p>
                            </div>
                          );
                        })}
                        {currentUser ? (
                          <div className="flex gap-2 mt-2">
                            <input
                              value={replyText[thread.id] || ""}
                              onChange={e => setReplyText(prev => ({ ...prev, [thread.id]: e.target.value }))}
                              placeholder="Write a reply..."
                              className="flex-1 bg-surface-container-lowest border border-outline-variant px-4 py-2 font-body text-sm focus:outline-none focus:border-primary transition-colors"
                              onKeyDown={e => e.key === "Enter" && handleReply(thread.id)}
                            />
                            <Button
                              size="sm"
                              onClick={() => handleReply(thread.id)}
                              disabled={replyPosting === thread.id || !replyText[thread.id]?.trim()}
                            >
                              <Send className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest py-2">
                            <button onClick={onConnect} className="text-primary hover:underline">Sign in</button> to reply
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Hardcoded fallback threads (always shown below DB threads) */}
              {fallbackThreads.map((thread) => (
                <div
                  key={thread.id}
                  className="bg-surface-container-lowest border border-outline-variant p-6 shadow-film hover:-translate-y-1 hover:shadow-film-hover transition-all duration-300 cursor-pointer group"
                  onClick={() => setView("governance")}
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
