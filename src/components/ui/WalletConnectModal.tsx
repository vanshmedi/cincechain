import { useState } from "react";
import { Button } from "./Button";
import { X, Wallet, Fingerprint, Shield, ChevronRight, CheckCircle2 } from "lucide-react";

interface WalletConnectModalProps {
  onClose: () => void;
  onConnect: (address: string) => void;
}

const walletOptions = [
  { id: "privy", name: "Privy (Email / Social)", description: "No crypto knowledge needed. Login with email, Google, or Twitter.", icon: "✉" },
  { id: "metamask", name: "MetaMask", description: "Connect your existing MetaMask wallet.", icon: "🦊" },
  { id: "coinbase", name: "Coinbase Wallet", description: "Connect with Coinbase Wallet.", icon: "🔵" },
  { id: "walletconnect", name: "WalletConnect", description: "Scan a QR code with any compatible wallet.", icon: "🔗" },
];

export function WalletConnectModal({ onClose, onConnect }: WalletConnectModalProps) {
  const [step, setStep] = useState<"choose" | "connecting" | "done">("choose");
  const [selected, setSelected] = useState<string | null>(null);

  const handleConnect = async (walletId: string) => {
    setSelected(walletId);
    setStep("connecting");
    // Simulate wallet connection
    await new Promise((r) => setTimeout(r, 1600));
    setStep("done");
    // Generate mock address
    const mockAddress = "0x" + Math.random().toString(16).slice(2, 10).toUpperCase() + "..." + Math.random().toString(16).slice(2, 6).toUpperCase();
    onConnect(mockAddress);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/80 backdrop-blur-sm px-4">
      <div className="bg-surface-container-lowest border border-outline-variant shadow-film w-full max-w-md relative overflow-hidden">
        {/* Rainbow accent */}
        <div className="absolute top-0 left-0 right-0 h-2 rainbow-bg" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-outline hover:text-on-surface transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {step === "choose" && (
          <div className="p-8 pt-10">
            <div className="flex items-center mb-6">
              <Wallet className="h-8 w-8 text-primary mr-4" />
              <div>
                <h2 className="text-3xl font-headline font-black uppercase tracking-tight">Connect Wallet</h2>
                <p className="font-body text-sm text-on-surface-variant">Choose your preferred method</p>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              {walletOptions.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => handleConnect(wallet.id)}
                  className="w-full flex items-center p-4 border border-outline-variant bg-surface-container-low hover:bg-surface-container hover:border-on-surface transition-all duration-200 text-left group"
                >
                  <span className="text-2xl mr-4">{wallet.icon}</span>
                  <div className="flex-1">
                    <p className="font-headline font-bold text-lg uppercase tracking-tight mb-0.5">{wallet.name}</p>
                    <p className="font-body text-xs text-on-surface-variant">{wallet.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-outline group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>

            <div className="flex items-start p-4 bg-surface-container border border-outline-variant/50">
              <Shield className="h-5 w-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-label text-xs uppercase tracking-widest font-bold text-secondary mb-1">Non-Custodial</p>
                <p className="font-body text-xs text-on-surface-variant">
                  CineChain never stores your private keys. You control your assets at all times.
                </p>
              </div>
            </div>
          </div>
        )}

        {step === "connecting" && (
          <div className="p-8 pt-10 text-center">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <div className="absolute inset-2 flex items-center justify-center text-2xl">
                {walletOptions.find((w) => w.id === selected)?.icon}
              </div>
            </div>
            <h2 className="text-3xl font-headline font-black uppercase tracking-tight mb-2">Connecting...</h2>
            <p className="font-body text-on-surface-variant">
              Establishing secure connection to{" "}
              <strong>{walletOptions.find((w) => w.id === selected)?.name}</strong>
            </p>
          </div>
        )}

        {step === "done" && (
          <div className="p-8 pt-10 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-3xl font-headline font-black uppercase tracking-tight mb-2">Connected!</h2>
            <p className="font-body text-on-surface-variant mb-6">
              Your wallet is connected. You now have access to the CineChain collective.
            </p>
            <div className="bg-surface-container p-4 border border-outline-variant mb-8 flex items-center justify-between">
              <div className="flex items-center">
                <Fingerprint className="h-5 w-5 text-primary mr-3" />
                <div className="text-left">
                  <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-0.5">Starting Balance</p>
                  <p className="font-headline font-black text-xl">2,500 CC</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">= $250</p>
              </div>
            </div>
            <Button className="w-full" size="lg" onClick={onClose}>
              Enter CineChain
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
