import React, { useState } from "react";
import { Button } from "../components/ui/Button";
import { RainbowStripe } from "../components/ui/RainbowStripe";
import { CheckCircle2, ChevronRight, User } from "lucide-react";
import { completeOnboardingUser, saveWalletToStorage } from "../lib/auth";
import type { DbUser } from "../lib/supabase";

interface UserOnboardingScreenProps {
  walletAddress: string | null;
  method: string;
  onComplete: (user: DbUser) => void;
}

export function UserOnboardingScreen({ walletAddress, method, onComplete }: UserOnboardingScreenProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);

  // Profile data
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [pfpLink, setPfpLink] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;

    setLoading(true);
    try {
      const isPrivy = method === "privy";
      const identifier = isPrivy ? email : (walletAddress || "unknown");
      
      const dbUser = await completeOnboardingUser(identifier, isPrivy, {
        displayName: username,
        avatarUrl: pfpLink,
      });

      if (!isPrivy && walletAddress) {
        saveWalletToStorage(walletAddress);
      } else {
        saveWalletToStorage(`privy-${email}`);
      }

      setStep(2);
      setTimeout(() => onComplete(dbUser), 1500);
    } catch (err) {
      console.error("Onboarding failed", err);
      alert("Failed to complete onboarding. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full pt-16 bg-surface min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-surface-container-lowest border border-outline-variant shadow-film relative overflow-hidden">
        <RainbowStripe className="absolute top-0 left-0 h-2" />

        <div className="p-8 pt-10">
          <div className="flex items-center mb-8">
            {step === 1 && <User className="h-8 w-8 text-primary mr-4" />}
            {step === 2 && <CheckCircle2 className="h-8 w-8 text-tertiary mr-4" />}
            <div>
              <h2 className="text-3xl font-headline font-black uppercase tracking-tight">Setup Profile</h2>
            </div>
          </div>

          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="font-body text-sm text-on-surface-variant mb-6">Personalize your presence on the CineChain collective.</p>

              {pfpLink && (
                <div className="flex justify-center mb-4">
                  <img src={pfpLink} alt="Avatar Preview" className="w-24 h-24 rounded-full border-4 border-surface-container bg-surface-container-low object-cover" />
                </div>
              )}
              
              <div className="text-left space-y-4 mb-6">
                {method === "privy" && (
                  <div>
                    <label className="block font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-1">Email</label>
                    <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="w-full bg-surface-container-low border border-outline-variant p-3 font-body focus:border-tertiary focus:outline-none" />
                  </div>
                )}
                <div>
                  <label className="block font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-1">Username</label>
                  <input required value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. Cinephile99" className="w-full bg-surface-container-low border border-outline-variant p-3 font-body focus:border-tertiary focus:outline-none" />
                </div>
                <div>
                  <label className="block font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-1">Profile Picture Link</label>
                  <input value={pfpLink} onChange={e => setPfpLink(e.target.value)} placeholder="https://..." className="w-full bg-surface-container-low border border-outline-variant p-3 font-body focus:border-tertiary focus:outline-none" />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full flex justify-center items-center bg-tertiary hover:bg-on-surface">
                {loading ? "Completing..." : "Complete Setup"} 
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </form>
          )}

          {step === 2 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 flex items-center justify-center rounded-full">
                <CheckCircle2 className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-3xl font-headline font-black uppercase tracking-tight mb-2">Welcome!</h2>
              <p className="font-body text-on-surface-variant">
                Your profile is ready. Redirecting...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
