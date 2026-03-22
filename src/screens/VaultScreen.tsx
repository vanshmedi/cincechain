import { Polaroid } from "../components/ui/Polaroid";
import { RainbowStripe } from "../components/ui/RainbowStripe";
import { Hexagon, Lock } from "lucide-react";
import { Button } from "../components/ui/Button";

interface VaultScreenProps {
  setView: (view: string) => void;
}

// PRD-compliant: CC amounts instead of ETH
const collection = [
  { id: 1, title: "Neon Dreams", subtitle: "Collector Token #042", image: "https://picsum.photos/seed/film1/400/300", rotation: "-rotate-2", tokenType: "Collector" },
  { id: 2, title: "The Last Heist", subtitle: "Ownership Token #118", image: "https://picsum.photos/seed/film2/400/300", rotation: "rotate-3", tokenType: "Ownership" },
  { id: 3, title: "Concrete Jungle", subtitle: "Collector Token #005", image: "https://picsum.photos/seed/film6/400/300", rotation: "-rotate-1", tokenType: "Collector" },
];

const transactions = [
  { date: "2026-03-20", type: "Mint", asset: "Neon Dreams — Collector #042", amount: "-4,000 CC", usd: "$400", status: "Confirmed" },
  { date: "2026-02-15", type: "Royalty", asset: "The Last Heist — Ownership #118", amount: "+120 CC", usd: "$12", status: "Claimed" },
  { date: "2026-01-08", type: "Mint", asset: "Concrete Jungle — Collector #005", amount: "-1,500 CC", usd: "$150", status: "Confirmed" },
  { date: "2025-12-20", type: "Transfer", asset: "Whispers in the Dark — Rental #088", amount: "0 CC", usd: "$0", status: "Sent" },
];

export function VaultScreen({ setView }: VaultScreenProps) {
  return (
    <div className="w-full pt-16 bg-surface-container-low min-h-screen">
      {/* Rainbow Header */}
      <div className="w-full bg-on-surface pt-20 pb-12 relative overflow-hidden">
        <RainbowStripe className="absolute top-0 left-0 h-4" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-surface-container-lowest rounded-full mb-6 shadow-film">
            <Lock className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-5xl md:text-7xl font-headline font-black uppercase tracking-tighter text-surface-container-lowest mb-4">
            The Vault
          </h1>
          <p className="text-xl font-body text-surface-variant max-w-2xl mx-auto">
            Your decentralized collection. Assets held securely on-chain.
          </p>
          <div className="mt-4 font-label text-xs uppercase tracking-widest text-outline-variant">
            All transactions in CineCredits (CC) · 1 CC = $0.10
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] font-headline font-black text-surface-variant/5 select-none pointer-events-none whitespace-nowrap">
          SECURE
        </div>
      </div>

      {/* Marquee Ticker */}
      <div className="w-full bg-primary text-white py-3 overflow-hidden border-b border-outline-variant/30 relative flex items-center">
        <div className="flex whitespace-nowrap animate-[marquee_15s_linear_infinite]">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="mx-8 font-label text-xs uppercase tracking-widest flex items-center">
              <Hexagon className="h-3 w-3 mr-2" />
              Royalty distribution for "The Last Heist" processing
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Collection Grid */}
        <section className="mb-24">
          <div className="flex justify-between items-end mb-12 border-b-2 border-on-surface pb-4">
            <h2 className="text-4xl font-headline font-black uppercase tracking-tighter">Your Collection</h2>
            <span className="font-label text-sm uppercase tracking-widest text-on-surface-variant font-bold">
              {collection.length} Assets
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {collection.map((item) => (
              <div key={item.id} className={`transform ${item.rotation} relative cursor-pointer group`}>
                <Polaroid
                  imageUrl={item.image}
                  title={item.title}
                  subtitle={item.subtitle}
                />
                {/* Token type badge */}
                <div className={`absolute top-2 left-2 font-label text-xs uppercase tracking-widest px-2 py-1 font-bold ${
                  item.tokenType === "Collector" ? "bg-secondary text-white" : "bg-primary text-white"
                }`}>
                  {item.tokenType}
                </div>
                {/* Hover: list on market */}
                <div className="absolute inset-0 bg-on-surface/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 mx-2 mb-8">
                  <Button size="sm" onClick={() => setView("market")}>
                    List on Market
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Transaction Ledger */}
        <section>
          <div className="flex justify-between items-end mb-8 border-b-2 border-on-surface pb-4">
            <h2 className="text-4xl font-headline font-black uppercase tracking-tighter">Transaction Ledger</h2>
            <button className="font-label text-sm uppercase tracking-widest text-primary hover:text-on-surface transition-colors font-bold">
              Export CSV
            </button>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant overflow-x-auto shadow-film">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container border-b border-outline-variant font-label text-xs uppercase tracking-widest text-on-surface-variant">
                  <th className="p-4 font-bold">Date</th>
                  <th className="p-4 font-bold">Type</th>
                  <th className="p-4 font-bold">Asset</th>
                  <th className="p-4 font-bold text-right">Amount (CC)</th>
                  <th className="p-4 font-bold text-right">USD Value</th>
                  <th className="p-4 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="font-body text-sm">
                {transactions.map((tx, i) => (
                  <tr key={i} className="border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors">
                    <td className="p-4 text-on-surface-variant font-mono">{tx.date}</td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-1 text-xs font-bold uppercase tracking-widest ${
                        tx.type === "Mint" ? "bg-primary/10 text-primary" :
                        tx.type === "Royalty" ? "bg-tertiary/10 text-tertiary" :
                        "bg-secondary/10 text-secondary"
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-4 font-bold">{tx.asset}</td>
                    <td className={`p-4 text-right font-mono font-bold ${tx.amount.startsWith("+") ? "text-tertiary" : "text-on-surface"}`}>
                      {tx.amount}
                    </td>
                    <td className="p-4 text-right font-mono text-on-surface-variant">{tx.usd}</td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center text-xs uppercase tracking-widest font-bold text-on-surface-variant">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          tx.status === "Confirmed" || tx.status === "Claimed" ? "bg-tertiary" : "bg-outline"
                        }`} />
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
