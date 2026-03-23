import React, { useState } from "react";
import { Button } from "../components/ui/Button";
import { RainbowStripe } from "../components/ui/RainbowStripe";
import { CheckCircle2, ChevronRight, UserCog, MailOpen, User } from "lucide-react";
import { completeOnboardingUser, saveWalletToStorage } from "../lib/auth";
import type { DbUser } from "../lib/supabase";

interface UserOnboardingScreenProps {
  walletAddress: string | null;
  method: string;
  onComplete: (user: DbUser) => void;
}

export function UserOnboardingScreen({ walletAddress, method, onComplete }: UserOnboardingScreenProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);

  // Step 1 data
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    phone: "",
    email: "",
    address: "",
  });

  // Step 2 data
  const [otp, setOtp] = useState("");

  // Step 3 data
  const [profileData, setProfileData] = useState({
    username: "",
    pfpLink: "",
  });

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.age) return;
    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return;
    setStep(3);
  };

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData.username) return;

    setLoading(true);
    try {
      const isPrivy = method === "privy";
      const identifier = isPrivy ? formData.email : (walletAddress || "unknown");
      
      const dbUser = await completeOnboardingUser(identifier, isPrivy, {
        displayName: profileData.username,
        avatarUrl: profileData.pfpLink,
      });

      if (!isPrivy && walletAddress) {
        saveWalletToStorage(walletAddress);
      } else {
        saveWalletToStorage(`privy-${formData.email}`);
      }

      setStep(4);
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
            {step === 1 && <UserCog className="h-8 w-8 text-primary mr-4" />}
            {step === 2 && <MailOpen className="h-8 w-8 text-secondary mr-4" />}
            {step === 3 && <User className="h-8 w-8 text-tertiary mr-4" />}
            {step === 4 && <CheckCircle2 className="h-8 w-8 text-primary mr-4" />}
            <div>
              <h2 className="text-3xl font-headline font-black uppercase tracking-tight">Onboarding</h2>
              <p className="font-body text-sm text-on-surface-variant flex gap-2">
                <span className={step === 1 ? "text-primary font-bold" : ""}>Step 1</span> • 
                <span className={step === 2 ? "text-secondary font-bold" : ""}> 2</span> • 
                <span className={step >= 3 ? "text-tertiary font-bold" : ""}> 3</span>
              </p>
            </div>
          </div>

          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <h3 className="font-headline font-bold uppercase tracking-tight text-on-surface">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-1">Full Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant p-3 font-body focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-1">Age</label>
                  <input required type="number" min="18" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant p-3 font-body focus:border-primary focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-1">Email</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant p-3 font-body focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-1">Phone</label>
                  <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant p-3 font-body focus:border-primary focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-1">Physical Address</label>
                <input required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant p-3 font-body focus:border-primary focus:outline-none" />
              </div>
              <Button type="submit" className="w-full mt-6 flex justify-center items-center">
                Continue to Verification <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-4 text-center">
              <h3 className="font-headline font-bold uppercase tracking-tight text-on-surface">Verification Securely Sent</h3>
              <p className="font-body text-sm text-on-surface-variant mb-6">We've sent a 6-digit code to {formData.email}</p>
              
              <div className="flex justify-center mb-6">
                <input 
                  required 
                  type="text" 
                  maxLength={6} 
                  placeholder="000000"
                  value={otp} 
                  onChange={e => setOtp(e.target.value)} 
                  className="w-1/2 text-center text-3xl tracking-[0.5em] font-mono bg-surface-container-low border border-outline-variant p-4 text-on-surface focus:border-secondary focus:outline-none" 
                />
              </div>

              <div className="flex gap-4">
                <Button variant="outline" type="button" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                <Button type="submit" className="flex-1 bg-secondary hover:bg-on-surface">Verify Code <ChevronRight className="h-4 w-4 ml-2" /></Button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleStep3Submit} className="space-y-4 text-center">
              <h3 className="font-headline font-bold uppercase tracking-tight text-on-surface">Setup Your Profile</h3>
              <p className="font-body text-sm text-on-surface-variant mb-6">Personalize your presence on the CineChain collective.</p>

              {profileData.pfpLink && (
                <div className="flex justify-center mb-4">
                  <img src={profileData.pfpLink} alt="Avatar Preview" className="w-24 h-24 rounded-full border-4 border-surface-container bg-surface-container-low object-cover" />
                </div>
              )}
              
              <div className="text-left space-y-4 mb-6">
                <div>
                  <label className="block font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-1">Username</label>
                  <input required value={profileData.username} onChange={e => setProfileData({...profileData, username: e.target.value})} placeholder="e.g. Cinephile99" className="w-full bg-surface-container-low border border-outline-variant p-3 font-body focus:border-tertiary focus:outline-none" />
                </div>
                <div>
                  <label className="block font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-1">Profile Picture Link</label>
                  <input value={profileData.pfpLink} onChange={e => setProfileData({...profileData, pfpLink: e.target.value})} placeholder="https://..." className="w-full bg-surface-container-low border border-outline-variant p-3 font-body focus:border-tertiary focus:outline-none" />
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" type="button" className="flex-1" onClick={() => setStep(2)}>Back</Button>
                <Button type="submit" disabled={loading} className="flex-1 bg-tertiary hover:bg-on-surface">
                  {loading ? "Completing..." : "Complete Setup"} 
                  <CheckCircle2 className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </form>
          )}

          {step === 4 && (
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
