import { useState } from "react";
import { Button } from "../components/ui/Button";
import { RainbowStripe } from "../components/ui/RainbowStripe";
import { proposals } from "../data/mockData";
import { Vote, CheckCircle2, XCircle, Clock, ThumbsUp, ThumbsDown, Hexagon } from "lucide-react";

interface GovernanceScreenProps {
  cineBalance: number;
}

export function GovernanceScreen({ cineBalance }: GovernanceScreenProps) {
  const [votes, setVotes] = useState<Record<string, "for" | "against">>({});

  const handleVote = (proposalId: string, direction: "for" | "against") => {
    if (votes[proposalId]) return; // already voted
    setVotes((v) => ({ ...v, [proposalId]: direction }));
  };

  const statusColor = (status: string) => {
    if (status === "Active") return "bg-primary/10 text-primary";
    if (status === "Passed") return "bg-tertiary/10 text-tertiary";
    return "bg-error/10 text-error";
  };

  const statusIcon = (status: string) => {
    if (status === "Active") return <Clock className="h-4 w-4 mr-1" />;
    if (status === "Passed") return <CheckCircle2 className="h-4 w-4 mr-1" />;
    return <XCircle className="h-4 w-4 mr-1" />;
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
                Shape the future of the protocol. Each $CINE token is one vote.
              </p>
            </div>
            <div className="mt-8 md:mt-0 bg-surface-container-lowest/10 border border-surface-variant/20 p-6 text-right">
              <p className="font-label text-xs uppercase tracking-widest text-outline-variant mb-2">
                Your $CINE Balance
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
              { label: "Active Proposals", value: proposals.filter((p) => p.status === "Active").length.toString(), color: "text-primary" },
              { label: "Total Proposals", value: proposals.length.toString(), color: "text-on-surface" },
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
              <Button variant="outline" size="sm">
                + New Proposal
              </Button>
            </div>

            {proposals.map((proposal) => {
              const total = proposal.votesFor + proposal.votesAgainst;
              const forPct = total > 0 ? Math.round((proposal.votesFor / total) * 100) : 0;
              const quorumPct = Math.min(100, Math.round((total / proposal.quorum) * 100));
              const myVote = votes[proposal.id];
              const isActive = proposal.status === "Active";

              return (
                <div
                  key={proposal.id}
                  className="bg-surface-container-lowest border border-outline-variant p-8 shadow-film relative overflow-hidden"
                >
                  {/* Status stripe */}
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

                  {/* Vote bar */}
                  <div className="mb-2">
                    <div className="flex justify-between font-label text-xs uppercase tracking-widest text-on-surface-variant mb-1">
                      <span className="text-tertiary font-bold">For {proposal.votesFor.toLocaleString()}</span>
                      <span className="text-error font-bold">Against {proposal.votesAgainst.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-3 bg-surface-container-high overflow-hidden flex">
                      <div
                        className="h-full bg-tertiary transition-all duration-1000"
                        style={{ width: `${forPct}%` }}
                      />
                      <div className="h-full bg-error flex-1" />
                    </div>
                  </div>

                  {/* Quorum */}
                  <div className="mb-6">
                    <div className="flex justify-between font-label text-xs uppercase tracking-widest text-on-surface-variant mb-1">
                      <span>Quorum Progress</span>
                      <span>{quorumPct}% of {proposal.quorum.toLocaleString()} needed</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container-high overflow-hidden">
                      <div
                        className="h-full bg-secondary transition-all duration-1000"
                        style={{ width: `${quorumPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Voting buttons */}
                  {isActive && (
                    <div className="flex gap-4">
                      <Button
                        variant={myVote === "for" ? "primary" : "outline"}
                        className="flex-1"
                        onClick={() => handleVote(proposal.id, "for")}
                        disabled={!!myVote || cineBalance === 0}
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        {myVote === "for" ? "Voted For" : "Vote For"}
                      </Button>
                      <Button
                        variant={myVote === "against" ? "secondary" : "outline"}
                        className={`flex-1 ${myVote === "against" ? "bg-error text-white border-error" : ""}`}
                        onClick={() => handleVote(proposal.id, "against")}
                        disabled={!!myVote || cineBalance === 0}
                      >
                        <ThumbsDown className="h-4 w-4 mr-2" />
                        {myVote === "against" ? "Voted Against" : "Vote Against"}
                      </Button>
                    </div>
                  )}
                  {cineBalance === 0 && isActive && (
                    <p className="mt-3 text-center font-label text-xs uppercase tracking-widest text-error">
                      You need $CINE tokens to vote
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* How it works */}
            <div className="bg-on-surface text-surface-container-lowest p-8 relative overflow-hidden shadow-film">
              <RainbowStripe className="absolute top-0 left-0 h-2" />
              <h3 className="text-2xl font-headline font-bold uppercase tracking-tight mb-6 border-b border-surface-variant/20 pb-4">
                How Voting Works
              </h3>
              <div className="space-y-6">
                {[
                  { step: "01", text: "Hold $CINE tokens in your wallet. 1 token = 1 vote." },
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

            {/* Protocol stats */}
            <div className="bg-surface-container-lowest border border-outline-variant p-6 shadow-film relative overflow-hidden">
              <RainbowStripe className="absolute top-0 left-0 h-1" />
              <h3 className="text-xl font-headline font-bold uppercase tracking-tight mb-6 border-b-2 border-on-surface pb-2">
                Protocol Params
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Protocol Fee", value: "5%" },
                  { label: "Resale Royalty", value: "10%" },
                  { label: "Quorum Threshold", value: "20,000 CINE" },
                  { label: "Voting Period", value: "7 Days" },
                  { label: "Proposal Min.", value: "100 CINE" },
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
                Acquire $CINE tokens to participate in governance. Auteur CinePass holders receive a monthly CINE allocation.
              </p>
              <Button variant="outline" className="w-full text-sm">
                Acquire $CINE
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
