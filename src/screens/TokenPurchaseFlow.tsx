import { useState, useEffect } from "react";
import { Button } from "../components/ui/Button";
import { RainbowStripe } from "../components/ui/RainbowStripe";
import { CheckCircle2, Sparkles, Wallet, X } from "lucide-react";
import { type DbFilm } from "../lib/supabase";
import { fetchDbFilmById } from "../lib/auth";

interface TokenPurchaseFlowProps {
  filmId: string;
  tierName: string;
  price: number; // in CC
  onClose: () => void;
  onConfirm: (price: number) => void;
  cineCredits: number;
  setView: (view: string, filmId?: string, curatorHandle?: string) => void;
}

export function TokenPurchaseFlow({
  filmId,
  tierName,
  price,
  onClose,
  onConfirm,
  cineCredits,
  setView,
}: TokenPurchaseFlowProps) {
  const [film, setFilm] = useState<DbFilm | null>(null);
  const [step, setStep] = useState<"loading" | "confirm" | "processing" | "done">("loading");

  useEffect(() => {
    fetchDbFilmById(filmId).then((data) => {
      setFilm(data);
      setStep("confirm");
    });
  }, [filmId]);

  // Generate a mock watermark session ID
  const sessionId = film ? `WM-${film.title.replace(/\s/g, "").substring(0, 4).toUpperCase()}-${filmId}-${Date.now().toString(36).toUpperCase()}` : "";
  const meta = film?.revenue_split as any;
  const protocolFee = Math.round(price * 0.05); // 5% protocol fee
  const directorShare = Math.round(price * ((meta?.director || 60) / 100));
  const crewShare = price - protocolFee - directorShare;

  const handleMint = async () => {
    setStep("processing");
    // Simulate chain confirmation delay
    await new Promise((r) => setTimeout(r, 1800));
    setStep("done");
    onConfirm(price);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/80 backdrop-blur-sm px-4">
      <div className="bg-surface-container-lowest border border-outline-variant shadow-film w-full max-w-lg relative overflow-hidden">
        <RainbowStripe className="absolute top-0 left-0 h-2" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-outline hover:text-on-surface transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {step === "loading" && (
          <div className="p-8 pt-10 text-center text-on-surface-variant">
             Loading details...
          </div>
        )}

        {step === "confirm" && film && (
          <div className="p-8 pt-10">
            <h2 className="text-3xl font-headline font-black uppercase tracking-tight mb-2">
              Confirm Mint
            </h2>
            <p className="font-body text-on-surface-variant mb-8">
              You are minting a <strong>{tierName}</strong> token for{" "}
              <strong>{film.title}</strong>.
            </p>

            <div className="space-y-4 mb-8">
              <div className="bg-surface-container p-4 border border-outline-variant space-y-3">
                <div className="flex justify-between font-body text-sm">
                  <span className="text-on-surface-variant">Token Type</span>
                  <span className="font-bold uppercase tracking-widest font-label text-xs">{tierName}</span>
                </div>
                <div className="flex justify-between font-body text-sm">
                  <span className="text-on-surface-variant">Token Price</span>
                  <span className="font-bold">{price.toLocaleString()} CC</span>
                </div>
                <div className="flex justify-between font-body text-sm border-t border-outline-variant/50 pt-3">
                  <span className="text-on-surface-variant">Protocol Fee (5%)</span>
                  <span className="font-bold text-outline">{protocolFee} CC</span>
                </div>
                <div className="flex justify-between font-body text-sm">
                  <span className="text-on-surface-variant">Director share</span>
                  <span className="font-bold text-tertiary">{directorShare} CC</span>
                </div>
                <div className="flex justify-between font-body text-sm">
                  <span className="text-on-surface-variant">Crew share</span>
                  <span className="font-bold">{crewShare} CC</span>
                </div>
              </div>

              <div className="flex items-center justify-between bg-primary/5 border border-primary/30 p-4">
                <div className="flex items-center">
                  <Wallet className="h-5 w-5 text-primary mr-3" />
                  <span className="font-label text-xs uppercase tracking-widest font-bold">Balance after mint</span>
                </div>
                <span className="font-headline font-black text-xl">
                  {(cineCredits - price).toLocaleString()} CC
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleMint} className="flex-1" size="lg">
                Confirm & Mint
              </Button>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="p-8 pt-10 text-center">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <h2 className="text-3xl font-headline font-black uppercase tracking-tight mb-2">
              Minting...
            </h2>
            <p className="font-body text-on-surface-variant">
              Writing your token to the chain. This takes just a moment.
            </p>
          </div>
        )}

        {step === "done" && film && (
          <div className="p-8 pt-10">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-3xl font-headline font-black uppercase tracking-tight mb-2">
                Token Minted!
              </h2>
              <p className="font-body text-on-surface-variant">
                Your <strong>{tierName}</strong> token for{" "}
                <strong>{film.title}</strong> is now in your Vault.
              </p>
            </div>

            <div className="bg-on-surface text-surface-container-lowest p-6 relative overflow-hidden mb-6">
              <RainbowStripe className="absolute top-0 left-0 h-1" />
              <div className="flex items-center mb-3">
                <Sparkles className="h-5 w-5 text-primary mr-2" />
                <span className="font-label text-xs uppercase tracking-widest font-bold text-outline-variant">
                  Watermark Session ID
                </span>
              </div>
              <p className="font-mono text-sm text-primary font-bold break-all">{sessionId}</p>
              <p className="font-body text-xs text-surface-variant mt-2">
                This ID is invisibly embedded in your stream. Keep it private.
              </p>
            </div>

            <div className="space-y-2 mb-8 font-body text-sm text-on-surface-variant">
              <div className="flex justify-between">
                <span>Amount deducted</span>
                <span className="font-bold text-on-surface">{price.toLocaleString()} CC</span>
              </div>
              <div className="flex justify-between">
                <span>New balance</span>
                <span className="font-bold text-primary">{(cineCredits).toLocaleString()} CC</span>
              </div>
            </div>

            <Button className="w-full" size="lg" onClick={() => { setView('vault'); onClose(); }}>
              View in Vault
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
