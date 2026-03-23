import { RainbowStripe } from "../ui/RainbowStripe";
import { Film, Wallet, User, Menu, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { useState } from "react";

interface NavbarProps {
  currentView: string;
  setView: (view: string, filmId?: string, curatorHandle?: string) => void;
  walletAddress: string | null;
  cineCredits: number;
  onConnect: () => void;
  onLogout: () => void;
}

export function Navbar({ 
  currentView, 
  setView, 
  walletAddress, 
  cineCredits, 
  onConnect,
  onLogout
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "landing", label: "Home" },
    { id: "gallery", label: "Gallery" },
    { id: "market", label: "Market" },
    { id: "community", label: "Community" },
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
            {navItems.filter(item => item.id !== "studio" || walletAddress).map((item) => (
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
            {walletAddress && (
              <div className="hidden md:flex items-center bg-primary/10 border border-primary/30 px-3 py-1.5">
                <span className="font-headline font-black text-sm text-primary">
                  {cineCredits.toLocaleString()} CC
                </span>
              </div>
            )}
            <button className="text-on-surface-variant hover:text-primary transition-colors" onClick={(e) => { e.preventDefault(); }}>
            </button>
            {walletAddress ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setView("vault")}
                  className="flex items-center text-on-surface-variant hover:text-primary transition-colors"
                  title={walletAddress}
                >
                  <User className="h-5 w-5" />
                </button>
                <button
                  onClick={onLogout}
                  className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors border border-outline-variant/30 px-2 py-1"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <button
                onClick={onConnect}
                className="flex items-center bg-primary text-white font-label text-xs uppercase tracking-widest px-3 py-2 font-bold hover:bg-on-surface transition-colors"
              >
                <Wallet className="h-4 w-4 mr-1.5" />
                Connect
              </button>
            )}
            <button
              className="md:hidden text-on-surface-variant hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-surface-container-lowest border-t border-outline-variant/30 py-2 shadow-film absolute w-full left-0">
          <ul className="flex flex-col space-y-1 px-4">
            {["Gallery", "Vault", "Community", "Studio"]
              .filter(label => (label !== "Studio" && label !== "Vault") || walletAddress)
              .map((label) => (
              <li key={label}>
                <button
                  onClick={() => {
                    setView(label.toLowerCase());
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-3 font-label text-sm uppercase tracking-widest text-on-surface hover:text-primary hover:bg-surface-container-low transition-colors px-2 rounded"
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <RainbowStripe className="h-1" />
    </nav>
  );
}
