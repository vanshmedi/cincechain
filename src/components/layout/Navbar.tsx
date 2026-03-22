import { RainbowStripe } from "../ui/RainbowStripe";
import { Film, Wallet, User, Search } from "lucide-react";
import { cn } from "../../lib/utils";

interface NavbarProps {
  currentView: string;
  setView: (view: string) => void;
  walletAddress: string | null;
  cineCredits: number;
  onConnect: () => void;
}

export function Navbar({ currentView, setView, walletAddress, cineCredits, onConnect }: NavbarProps) {
  const navItems = [
    { id: "landing", label: "Home" },
    { id: "gallery", label: "Gallery" },
    { id: "market", label: "Market" },
    { id: "pass", label: "CinePass" },
    { id: "community", label: "Community" },
    { id: "governance", label: "Govern" },
    { id: "submit", label: "Submit" },
    { id: "studio", label: "Studio" },
  ];

  return (
    <nav className="fixed top-0 w-full z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div
            className="flex items-center cursor-pointer group"
            onClick={() => setView("landing")}
          >
            <Film className="h-8 w-8 text-primary group-hover:rotate-12 transition-transform" />
            <span className="ml-2 font-headline font-black text-2xl tracking-tighter uppercase">
              Cine<span className="text-primary">Chain</span>
            </span>
          </div>

          <div className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={cn(
                  "font-label text-sm uppercase tracking-widest transition-colors hover:text-primary",
                  currentView === item.id
                    ? "text-primary font-bold"
                    : "text-on-surface-variant"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            {/* CineCredit balance — shown when wallet connected */}
            {walletAddress && (
              <div className="hidden md:flex items-center bg-primary/10 border border-primary/30 px-3 py-1.5">
                <span className="font-headline font-black text-sm text-primary">
                  {cineCredits.toLocaleString()} CC
                </span>
              </div>
            )}
            <button className="text-on-surface-variant hover:text-primary transition-colors">
              <Search className="h-5 w-5" />
            </button>
            {walletAddress ? (
              <button
                onClick={() => setView("vault")}
                className="flex items-center text-on-surface-variant hover:text-primary transition-colors"
                title={walletAddress}
              >
                <User className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={onConnect}
                className="flex items-center bg-primary text-white font-label text-xs uppercase tracking-widest px-3 py-2 font-bold hover:bg-on-surface transition-colors"
              >
                <Wallet className="h-4 w-4 mr-1.5" />
                Connect
              </button>
            )}
            {/* Mobile hamburger */}
            <button className="md:hidden text-on-surface-variant">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <RainbowStripe className="h-1" />
    </nav>
  );
}
