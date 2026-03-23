import { useState, useEffect } from "react";
import { Button } from "../components/ui/Button";
import { RainbowStripe } from "../components/ui/RainbowStripe";
import { proposals as mockProposals } from "../data/mockData";
import { Vote, CheckCircle2, XCircle, Clock, ThumbsUp, ThumbsDown, Hexagon, Plus, LogIn } from "lucide-react";
import type { DbUser, DbProposal } from "../lib/supabase";
import { fetchProposals, createProposal, castVote, getUserVotes } from "../lib/auth";

interface GovernanceScreenProps {
  cineBalance: number;
  currentUser: DbUser | null;
  onConnect: () => void;
}

const PROPOSAL_TYPES = [
  { value: "fee_adjustment", label: "Fee Adjustment" },
  { value: "token_tier_update", label: "Token Tier Update" },
  { value: "treasury_allocation", label: "Treasury Allocation" },
  { value: "content_standards", label: "Content Standards" },
  { value: "platform_upgrade", label: "Platform Upgrade" },
  { value: "other", label: "Other" },
];

export function GovernanceScreen({ cineBalance, currentUser, onConnect }: GovernanceScreenProps) {
  const [mockVotes, setMockVotes] = useState<Record<string, "for" | "against">>({});
  const [dbProposals, setDbProposals] = useState<DbProposal[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, "for" | "against">>({});
  const [showComposer, setShowComposer] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState("fee_adjustment");
  const [newDeadlineDays, setNewDeadlineDays] = useState(7);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    loadProposals();
  }, []);

  useEffect(() => {
    if (currentUser) {
      getUserVotes(currentUser.id).then(setUserVotes);
    }
  }, [currentUser]);

  const loadProposals = async () => {
    const proposals = await fetchProposals();
    setDbProposals(proposals);
  };

  const handleSubmitProposal = async () => {
    if (!currentUser || !newTitle.trim() || !newDesc.trim()) return;
    setPosting(true);
    try {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + newDeadlineDays);
      const proposal = await createProposal(
        currentUser.id,
        newTitle,
        newDesc,
        newType,
        deadline.toISOString()
      );
      setDbProposals(prev => [proposal, ...prev]);
      setNewTitle("");
      setNewDesc("");
      setShowComposer(false);
    } catch (err) {
      console.error("Failed to create proposal:", err);
    }
    setPosting(false);
  };

  const handleDbVote = async (proposalId: string, direction: "for" | "against") => {
    if (!currentUser || userVotes[proposalId]) return;
    if (currentUser.wallet_address?.startsWith("privy-")) {
      alert("Connect a wallet to access this feature");
      return;
    }
    try {
      await castVote(proposalId, currentUser.id, direction);
      setUserVotes(prev => ({ ...prev, [proposalId]: direction }));
      setDbProposals(prev => prev.map(p => {
        if (p.id !== proposalId) return p;
        return {
          ...p,
          votes_for: direction === "for" ? p.votes_for + 1 : p.votes_for,
          votes_against: direction === "against" ? p.votes_against + 1 : p.votes_against,
        };
      }));
    } catch (err) {
      console.error("Vote failed:", err);
    }
  };

  const handleMockVote = (proposalId: string, direction: "for" | "against") => {
    if (mockVotes[proposalId]) return;
    if (currentUser?.wallet_address?.startsWith("privy-")) {
      alert("Connect a wallet to access this feature");
      return;
    }
    setMockVotes((v) => ({ ...v, [proposalId]: direction }));
  };

  const statusColor = (status: string) => {
    if (status === "Active" || status === "active") return "bg-primary/10 text-primary";
    if (status === "Passed" || status === "passed") return "bg-tertiary/10 text-tertiary";
    return "bg-error/10 text-error";
  };

  const statusIcon = (status: string) => {
    if (status === "Active" || status === "active") return <Clock className="h-4 w-4 mr-1" />;
    if (status === "Passed" || status === "passed") return <CheckCircle2 className="h-4 w-4 mr-1" />;
    return <XCircle className="h-4 w-4 mr-1" />;
  };

  const getUserDisplay = (user: any) => {
    if (!user) return "Unknown";
    return user.display_name || (user.wallet_address ? `0x${user.wallet_address.slice(2, 6)}...${user.wallet_address.slice(-4)}` : "Anon");
  };

  const getDeadlineDisplay = (deadline: string) => {
    const now = Date.now();
    const dl = new Date(deadline).getTime();
    const diff = dl - now;
    if (diff <= 0) return "Ended";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

  return (
    <div className="w-full pt-16 bg-surface min-h-screen">
      {/* Header */}
      <div className="w-full bg-on-surface pt-20 pb-16 relative overflow-hidden">
        <RainbowStripe className="absolute top-0 left-0 h-3 w-full" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end">
            <div>
              <div className="inline-flex items-center space-x-2 bg-surface-variant/10 border border-surface-variant/20 px-4 py-2 mb-6">
                <Vote className="h-4 w-4 text-primary" />
                <span className="font-label text-xs uppercase tracking-widest text-outline-variant">
                  On-Chain Governance
                </span>
              </div>
              <h1 className="text-6xl md:text-8xl font-headline font-black uppercase tracking-tighter text-surface-container-lowest mb-4">
                Governance
              </h1>
              <p className="text-xl font-body text-surface-variant max-w-2xl">
                Shape the future of the protocol. Each CC token is one vote.
              </p>
            </div>
            <div className="mt-8 md:mt-0 bg-surface-container-lowest/10 border border-surface-variant/20 p-6 text-right">
              <p className="font-label text-xs uppercase tracking-widest text-outline-variant mb-2">
                Your CC Balance
              </p>
              <p className="font-headline font-black text-4xl text-surface-container-lowest">
                {cineBalance.toLocaleString()}
              </p>
              <p className="font-label text-xs uppercase tracking-widest text-outline-variant mt-1">
                = {cineBalance.toLocaleString()} votes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-surface-container border-b border-outline-variant/30 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8">
            {[
              { label: "Active Proposals", value: (mockProposals.filter((p) => p.status === "Active").length + dbProposals.filter(p => p.status === "active").length).toString(), color: "text-primary" },
              { label: "Total Proposals", value: (mockProposals.length + dbProposals.length).toString(), color: "text-on-surface" },
              { label: "Total Voters", value: "4,821", color: "text-secondary" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className={`font-headline font-black text-3xl ${stat.color}`}>{stat.value}</p>
                <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Proposals list */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between border-b-2 border-on-surface pb-4">
              <h2 className="text-3xl font-headline font-bold uppercase tracking-tight">
                Proposals
              </h2>
              {currentUser && (
                <Button variant="outline" size="sm" onClick={() => setShowComposer(!showComposer)}>
                  <Plus className="h-4 w-4 mr-1" />
                  New Proposal
                </Button>
              )}
            </div>

            {/* Proposal Composer */}
            {showComposer && currentUser && (
              <div className="bg-surface-container-lowest border border-outline-variant p-8 shadow-film relative overflow-hidden">
                <RainbowStripe className="absolute top-0 left-0 h-2" />
                <h3 className="text-xl font-headline font-bold uppercase tracking-tight mb-6">Submit Proposal</h3>
                <input
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Proposal title..."
                  className="w-full bg-transparent border-b-2 border-outline-variant py-3 font-headline text-xl font-bold text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-outline-variant/50 mb-4"
                />
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Describe your proposal..."
                  rows={4}
                  className="w-full bg-surface-container-low border border-outline-variant p-4 font-body text-on-surface focus:outline-none focus:border-primary transition-colors resize-none mb-4"
                />
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-2">Proposal Type</label>
                    <select
                      value={newType}
                      onChange={e => setNewType(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant p-3 font-body text-on-surface focus:outline-none focus:border-primary"
                    >
                      {PROPOSAL_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-2">Voting Period (days)</label>
                    <input
                      type="number"
                      value={newDeadlineDays}
                      onChange={e => setNewDeadlineDays(Math.max(1, parseInt(e.target.value) || 7))}
                      min={1}
                      max={30}
                      className="w-full bg-surface-container-low border border-outline-variant p-3 font-body text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowComposer(false)}>Cancel</Button>
                  <Button onClick={handleSubmitProposal} disabled={posting || !newTitle.trim() || !newDesc.trim()}>
                    {posting ? "Submitting..." : "Submit Proposal"}
                  </Button>
                </div>
              </div>
            )}

            {/* DB Proposals */}
            {dbProposals.map((proposal) => {
              const total = proposal.votes_for + proposal.votes_against;
              const forPct = total > 0 ? Math.round((proposal.votes_for / total) * 100) : 50;
              const isActive = proposal.status === "active";
              const myVote = userVotes[proposal.id];

              return (
                <div
                  key={proposal.id}
                  className="bg-surface-container-lowest border border-outline-variant p-8 shadow-film relative overflow-hidden"
                >
                  {isActive && <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />}

                  <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-outline-variant font-bold">DB</span>
                      <span className={`inline-flex items-center px-2 py-1 font-label text-xs uppercase tracking-widest font-bold ${statusColor(proposal.status)}`}>
                        {statusIcon(proposal.status)} {proposal.status}
                      </span>
                      <span className="px-2 py-1 font-label text-xs uppercase tracking-widest font-bold bg-surface-container text-on-surface-variant">
                        {PROPOSAL_TYPES.find(t => t.value === proposal.proposal_type)?.label || proposal.proposal_type}
                      </span>
                    </div>
                    <div className="flex items-center text-on-surface-variant">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="font-label text-xs uppercase tracking-widest">{getDeadlineDisplay(proposal.voting_deadline)}</span>
                    </div>
                  </div>

                  <h3 className="text-2xl font-headline font-bold text-on-surface mb-2">{proposal.title}</h3>
                  <p className="font-body text-sm text-on-surface-variant mb-2">by {getUserDisplay(proposal.user)}</p>
                  <p className="font-body text-on-surface-variant mb-6 leading-relaxed">{proposal.description}</p>

                  <div className="mb-2">
                    <div className="flex justify-between font-label text-xs uppercase tracking-widest text-on-surface-variant mb-1">
                      <span className="text-tertiary font-bold">For {proposal.votes_for.toLocaleString()}</span>
                      <span className="text-error font-bold">Against {proposal.votes_against.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-3 bg-surface-container-high overflow-hidden flex">
                      <div className="h-full bg-tertiary transition-all duration-1000" style={{ width: `${forPct}%` }} />
                      <div className="h-full bg-error flex-1" />
                    </div>
                  </div>

                  {isActive && currentUser && (
                    <div className="flex gap-4 mt-4">
                      <Button
                        variant={myVote === "for" ? "primary" : "outline"}
                        className="flex-1"
                        onClick={() => handleDbVote(proposal.id, "for")}
                        disabled={!!myVote}
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        {myVote === "for" ? "Voted For" : "Vote For"}
                      </Button>
                      <Button
                        variant={myVote === "against" ? "secondary" : "outline"}
                        className={`flex-1 ${myVote === "against" ? "bg-error text-white border-error" : ""}`}
                        onClick={() => handleDbVote(proposal.id, "against")}
                        disabled={!!myVote}
                      >
                        <ThumbsDown className="h-4 w-4 mr-2" />
                        {myVote === "against" ? "Voted Against" : "Vote Against"}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Mock proposals (always shown) */}
            {mockProposals.map((proposal) => {
              const total = proposal.votesFor + proposal.votesAgainst;
              const forPct = total > 0 ? Math.round((proposal.votesFor / total) * 100) : 0;
              const quorumPct = Math.min(100, Math.round((total / proposal.quorum) * 100));
              const myVote = mockVotes[proposal.id];
              const isActive = proposal.status === "Active";

              return (
                <div
                  key={proposal.id}
                  className="bg-surface-container-lowest border border-outline-variant p-8 shadow-film relative overflow-hidden"
                >
                  {proposal.status === "Active" && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
                  )}

                  <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-outline-variant font-bold">{proposal.id}</span>
                      <span
                        className={`inline-flex items-center px-2 py-1 font-label text-xs uppercase tracking-widest font-bold ${statusColor(proposal.status)}`}
                      >
                        {statusIcon(proposal.status)} {proposal.status}
                      </span>
                    </div>
                    <div className="flex items-center text-on-surface-variant">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="font-label text-xs uppercase tracking-widest">{proposal.endsIn}</span>
                    </div>
                  </div>

                  <h3 className="text-2xl font-headline font-bold text-on-surface mb-2">{proposal.title}</h3>
                  <p className="font-body text-sm text-on-surface-variant mb-2">by {proposal.author}</p>
                  <p className="font-body text-on-surface-variant mb-6 leading-relaxed">{proposal.description}</p>

                  <div className="mb-2">
                    <div className="flex justify-between font-label text-xs uppercase tracking-widest text-on-surface-variant mb-1">
                      <span className="text-tertiary font-bold">For {proposal.votesFor.toLocaleString()}</span>
                      <span className="text-error font-bold">Against {proposal.votesAgainst.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-3 bg-surface-container-high overflow-hidden flex">
                      <div className="h-full bg-tertiary transition-all duration-1000" style={{ width: `${forPct}%` }} />
                      <div className="h-full bg-error flex-1" />
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between font-label text-xs uppercase tracking-widest text-on-surface-variant mb-1">
                      <span>Quorum Progress</span>
                      <span>{quorumPct}% of {proposal.quorum.toLocaleString()} needed</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container-high overflow-hidden">
                      <div className="h-full bg-secondary transition-all duration-1000" style={{ width: `${quorumPct}%` }} />
                    </div>
                  </div>

                  {isActive && currentUser && (
                    <div className="flex gap-4">
                      <Button
                        variant={myVote === "for" ? "primary" : "outline"}
                        className="flex-1"
                        onClick={() => handleMockVote(proposal.id, "for")}
                        disabled={!!myVote || cineBalance === 0}
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        {myVote === "for" ? "Voted For" : "Vote For"}
                      </Button>
                      <Button
                        variant={myVote === "against" ? "secondary" : "outline"}
                        className={`flex-1 ${myVote === "against" ? "bg-error text-white border-error" : ""}`}
                        onClick={() => handleMockVote(proposal.id, "against")}
                        disabled={!!myVote || cineBalance === 0}
                      >
                        <ThumbsDown className="h-4 w-4 mr-2" />
                        {myVote === "against" ? "Voted Against" : "Vote Against"}
                      </Button>
                    </div>
                  )}
                  {cineBalance === 0 && isActive && (
                    <p className="mt-3 text-center font-label text-xs uppercase tracking-widest text-error">
                      You need CC tokens to vote
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-on-surface text-surface-container-lowest p-8 relative overflow-hidden shadow-film">
              <RainbowStripe className="absolute top-0 left-0 h-2" />
              <h3 className="text-2xl font-headline font-bold uppercase tracking-tight mb-6 border-b border-surface-variant/20 pb-4">
                How Voting Works
              </h3>
              <div className="space-y-6">
                {[
                  { step: "01", text: "Hold CC tokens in your wallet. 1 token = 1 vote." },
                  { step: "02", text: "Active proposals are open for 7 days. Vote For or Against." },
                  { step: "03", text: "If quorum is reached and majority votes For, the proposal passes on-chain." },
                  { step: "04", text: "Auteur CinePass holders can create new proposals." },
                ].map((item) => (
                  <div key={item.step} className="flex items-start">
                    <div className="w-8 h-8 bg-primary text-white flex items-center justify-center font-headline font-black text-sm mr-4 flex-shrink-0">
                      {item.step}
                    </div>
                    <p className="font-body text-sm text-surface-variant leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant p-6 shadow-film relative overflow-hidden">
              <RainbowStripe className="absolute top-0 left-0 h-1" />
              <h3 className="text-xl font-headline font-bold uppercase tracking-tight mb-6 border-b-2 border-on-surface pb-2">
                Protocol Params
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Protocol Fee", value: "5%" },
                  { label: "Resale Royalty", value: "10%" },
                  { label: "Quorum Threshold", value: "20,000 CC" },
                  { label: "Voting Period", value: "7 Days" },
                  { label: "Proposal Min.", value: "100 CC" },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">{item.label}</span>
                    <span className="font-headline font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-primary/5 border border-primary/20">
              <div className="flex items-center mb-3">
                <Hexagon className="h-5 w-5 text-primary mr-2" />
                <span className="font-label text-xs uppercase tracking-widest font-bold text-primary">Get Voting Power</span>
              </div>
              <p className="font-body text-sm text-on-surface-variant mb-4">
                Acquire CC tokens to participate in governance. Auteur CinePass holders receive a monthly CC allocation.
              </p>
              <Button variant="outline" className="w-full text-sm" onClick={() => alert('DAO Governance proposals are currently in the timelock review period. Check back soon.')}>
                Acquire CC
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
