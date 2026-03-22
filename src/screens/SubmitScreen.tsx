import { useState } from "react";
import { Button } from "../components/ui/Button";
import { RainbowStripe } from "../components/ui/RainbowStripe";
import { Upload, Camera, Info, Plus, Minus } from "lucide-react";

interface SubmitScreenProps {
  setView: (view: string) => void;
}

interface RecipientSplit {
  name: string;
  pct: number;
}

const PROTOCOL_FEE = 5;

export function SubmitScreen({ setView }: SubmitScreenProps) {
  const [title, setTitle] = useState("");
  const [director, setDirector] = useState("");
  const [year, setYear] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [distributionModel, setDistributionModel] = useState<"public" | "private">("public");
  const [step, setStep] = useState<"form" | "review" | "minting" | "done">("form");

  // Revenue split recipients (director always first, remaining is available)
  const [recipients, setRecipients] = useState<RecipientSplit[]>([
    { name: "Director", pct: 60 },
    { name: "Producer", pct: 25 },
    { name: "Crew Pool", pct: 10 },
  ]);

  // Live revenue split math
  const recipientTotal = recipients.reduce((sum, r) => sum + r.pct, 0);
  const remaining = 100 - PROTOCOL_FEE - recipientTotal;
  const isValidSplit = remaining === 0 && recipientTotal + PROTOCOL_FEE === 100;

  const addRecipient = () => {
    setRecipients((prev) => [...prev, { name: "", pct: 0 }]);
  };

  const removeRecipient = (idx: number) => {
    setRecipients((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateRecipient = (idx: number, field: "name" | "pct", value: string) => {
    setRecipients((prev) =>
      prev.map((r, i) =>
        i === idx ? { ...r, [field]: field === "pct" ? Math.max(0, parseInt(value) || 0) : value } : r
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !director) return;
    setStep("review");
  };

  const handleRegister = async () => {
    setStep("minting");
    await new Promise((r) => setTimeout(r, 2000));
    setStep("done");
  };

  if (step === "review") {
    return (
      <div className="w-full pt-16 bg-surface min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-surface-container-lowest border border-outline-variant p-10 shadow-film relative overflow-hidden">
            <RainbowStripe className="absolute top-0 left-0 h-2" />
            <h2 className="text-4xl font-headline font-black uppercase tracking-tight mb-2">Review & Register</h2>
            <p className="font-body text-on-surface-variant mb-8">Confirm details before on-chain registration.</p>

            <div className="space-y-4 mb-10">
              {[
                { label: "Title", value: title },
                { label: "Director", value: director },
                { label: "Year", value: year || "TBD" },
                { label: "Distribution", value: distributionModel === "public" ? "Public Mint" : "Private Sale" },
              ].map((item) => (
                <div key={item.label} className="flex justify-between border-b border-outline-variant/30 pb-3">
                  <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">{item.label}</span>
                  <span className="font-body font-bold text-on-surface">{item.value}</span>
                </div>
              ))}
            </div>

            <h3 className="text-xl font-headline font-bold uppercase tracking-tight mb-4">Revenue Split</h3>
            <div className="space-y-2 mb-8">
              {recipients.map((r) => (
                <div key={r.name} className="flex justify-between">
                  <span className="font-body text-sm text-on-surface-variant">{r.name}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-surface-container-high overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${r.pct}%` }} />
                    </div>
                    <span className="font-headline font-bold w-8 text-right">{r.pct}%</span>
                  </div>
                </div>
              ))}
              <div className="flex justify-between border-t border-outline-variant/50 pt-2">
                <span className="font-body text-sm text-outline">Protocol Fee (CineChain)</span>
                <span className="font-headline font-bold w-8 text-right text-outline">{PROTOCOL_FEE}%</span>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep("form")} className="flex-1">Back</Button>
              <Button onClick={handleRegister} className="flex-1" size="lg">Register On-Chain</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "minting") {
    return (
      <div className="w-full pt-16 bg-surface min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-4xl font-headline font-black uppercase tracking-tight mb-2">Registering...</h2>
          <p className="font-body text-on-surface-variant">Writing your film contract to the chain.</p>
        </div>
      </div>
    );
  }

  if (step === "done") {
    const contractId = "0x" + Math.random().toString(16).slice(2, 14).toUpperCase();
    return (
      <div className="w-full pt-16 bg-surface min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 flex items-center justify-center">
            <span className="text-4xl">🎬</span>
          </div>
          <h2 className="text-4xl font-headline font-black uppercase tracking-tight mb-2">Film Registered!</h2>
          <p className="font-body text-on-surface-variant mb-6">
            <strong>{title}</strong> is now on-chain and live in the gallery.
          </p>
          <div className="bg-on-surface text-surface-container-lowest p-6 mb-8 relative overflow-hidden">
            <RainbowStripe className="absolute top-0 left-0 h-1" />
            <p className="font-label text-xs uppercase tracking-widest text-outline-variant mb-2">Contract Address</p>
            <p className="font-mono text-sm text-primary break-all">{contractId}</p>
          </div>
          <div className="flex gap-4">
            <Button className="flex-1" onClick={() => setView("studio")}>Studio Dashboard</Button>
            <Button variant="outline" className="flex-1" onClick={() => setView("gallery")}>View Gallery</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pt-16 bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-16 border-b-4 border-on-surface pb-8">
          <h1 className="text-6xl md:text-8xl font-headline font-black uppercase tracking-tighter text-on-surface mb-4">
            Submit Your <br />
            <span className="rainbow-text">Masterpiece</span>
          </h1>
          <p className="text-xl font-body text-on-surface-variant max-w-2xl">
            Bypass the gatekeepers. Pitch directly to the collective, secure funding, and retain ownership of your IP.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left Column - Media Upload */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-headline font-bold uppercase tracking-tight mb-4 flex items-center">
                  <Camera className="mr-3 h-6 w-6 text-primary" />
                  Visual Assets
                </h2>
                <div className="border-2 border-dashed border-outline-variant bg-surface-container-lowest p-12 text-center hover:bg-surface-container transition-colors cursor-pointer group">
                  <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Upload className="h-8 w-8 text-on-surface-variant" />
                  </div>
                  <h3 className="font-headline font-bold text-xl uppercase tracking-tight mb-2">Drag & Drop Master File</h3>
                  <p className="font-body text-on-surface-variant text-sm max-w-xs mx-auto">
                    Supports MP4, MOV, ProRes up to 50GB. High-res poster art and stills required.
                  </p>
                  <Button variant="outline" className="mt-8">Browse Files</Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {["Poster", "Still 1", "Still 2"].map((label) => (
                  <div
                    key={label}
                    className="aspect-square bg-surface-container border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-outline-variant/20 cursor-pointer transition-colors"
                  >
                    <span className="font-label text-xs uppercase tracking-widest font-bold">{label}</span>
                  </div>
                ))}
              </div>

              {/* Revenue Split Preview — live math */}
              <div className="bg-surface-container-lowest border border-outline-variant p-8 shadow-film relative overflow-hidden">
                <RainbowStripe className="absolute top-0 left-0 h-1" />
                <h3 className="text-xl font-headline font-bold uppercase tracking-tight mb-2 flex items-center">
                  Revenue Split Preview
                  <Info className="h-4 w-4 ml-2 text-outline" />
                </h3>
                <p className="font-body text-xs text-on-surface-variant mb-6">
                  This is how revenue will be distributed per transaction. Must sum to 100% (incl. 5% protocol fee).
                </p>

                <div className="space-y-4 mb-4">
                  {recipients.map((r, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={r.name}
                        onChange={(e) => updateRecipient(idx, "name", e.target.value)}
                        placeholder="Recipient name"
                        className="flex-1 bg-transparent border-b border-outline-variant py-1 font-body text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
                      />
                      <input
                        type="number"
                        value={r.pct}
                        onChange={(e) => updateRecipient(idx, "pct", e.target.value)}
                        min={0}
                        max={95}
                        className="w-16 bg-transparent border-b border-outline-variant py-1 font-headline font-bold text-center text-on-surface focus:outline-none focus:border-primary transition-colors"
                      />
                      <span className="font-body text-sm">%</span>
                      {idx > 0 && (
                        <button type="button" onClick={() => removeRecipient(idx)} className="text-error hover:text-on-surface transition-colors">
                          <Minus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Protocol fee row */}
                <div className="flex items-center gap-3 border-t border-outline-variant/50 pt-4 mb-4">
                  <span className="flex-1 font-body text-sm text-outline">Protocol Fee (CineChain)</span>
                  <span className="w-16 font-headline font-bold text-center text-outline">{PROTOCOL_FEE}</span>
                  <span className="font-body text-sm text-outline">%</span>
                  <div className="w-4" />
                </div>

                <button
                  type="button"
                  onClick={addRecipient}
                  className="flex items-center text-primary hover:text-on-surface font-label text-xs uppercase tracking-widest transition-colors mb-4"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Recipient
                </button>

                {/* Running total */}
                <div className={`flex justify-between items-center p-3 border ${
                  isValidSplit ? "border-tertiary/50 bg-tertiary/5" :
                  remaining < 0 ? "border-error/50 bg-error/5" :
                  "border-outline-variant bg-surface-container"
                }`}>
                  <span className="font-label text-xs uppercase tracking-widest font-bold">Remaining</span>
                  <span className={`font-headline font-black text-xl ${
                    isValidSplit ? "text-tertiary" :
                    remaining < 0 ? "text-error" :
                    "text-on-surface"
                  }`}>
                    {remaining}%
                  </span>
                </div>
                {remaining !== 0 && (
                  <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mt-2">
                    {remaining > 0 ? `Allocate ${remaining}% more` : `Over by ${Math.abs(remaining)}% — reduce recipient percentages`}
                  </p>
                )}

                {/* Visual bar */}
                <div className="mt-4 w-full h-4 bg-surface-container-high overflow-hidden flex">
                  {recipients.map((r, i) => (
                    <div
                      key={i}
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${r.pct}%`,
                        backgroundColor: ["#b80e21", "#0162a2", "#825100", "#6b7280"][i % 4],
                      }}
                    />
                  ))}
                  <div className="h-full bg-outline-variant" style={{ width: `${PROTOCOL_FEE}%` }} />
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="bg-surface-container-lowest p-8 md:p-12 shadow-film border border-outline-variant relative">
              <RainbowStripe className="absolute top-0 left-0 h-2" />
              <h2 className="text-3xl font-headline font-bold uppercase tracking-tight mb-8 border-b-2 border-on-surface pb-4">
                Project Details
              </h2>

              <div className="space-y-8">
                <div>
                  <label className="block font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-2">
                    Working Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., The Silent Echo"
                    required
                    className="w-full bg-transparent border-b-2 border-outline-variant py-3 font-headline text-2xl font-bold text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-outline-variant/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="block font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-2">
                      Director *
                    </label>
                    <input
                      type="text"
                      value={director}
                      onChange={(e) => setDirector(e.target.value)}
                      placeholder="Name"
                      required
                      className="w-full bg-transparent border-b-2 border-outline-variant py-2 font-body text-on-surface focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-2">
                      Production Year
                    </label>
                    <input
                      type="text"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="YYYY"
                      className="w-full bg-transparent border-b-2 border-outline-variant py-2 font-body text-on-surface focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-2">
                    Synopsis
                  </label>
                  <textarea
                    rows={4}
                    value={synopsis}
                    onChange={(e) => setSynopsis(e.target.value)}
                    placeholder="Describe your vision..."
                    className="w-full bg-surface-container-low border border-outline-variant p-4 font-body text-on-surface focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-4 flex items-center">
                    Distribution Model
                    <Info className="h-4 w-4 ml-2 text-outline" />
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      onClick={() => setDistributionModel("public")}
                      className={`border-2 p-4 cursor-pointer relative transition-all duration-200 ${distributionModel === "public" ? "border-primary bg-primary/5" : "border-outline-variant hover:border-on-surface"}`}
                    >
                      {distributionModel === "public" && <div className="absolute top-2 right-2 w-3 h-3 bg-primary rounded-full" />}
                      <h4 className="font-headline font-bold uppercase tracking-tight mb-1">Public Mint</h4>
                      <p className="font-body text-xs text-on-surface-variant">Open to all collective members. Standard revenue split.</p>
                    </div>
                    <div
                      onClick={() => setDistributionModel("private")}
                      className={`border-2 p-4 cursor-pointer relative transition-all duration-200 ${distributionModel === "private" ? "border-primary bg-primary/5" : "border-outline-variant hover:border-on-surface"}`}
                    >
                      {distributionModel === "private" && <div className="absolute top-2 right-2 w-3 h-3 bg-primary rounded-full" />}
                      <h4 className="font-headline font-bold uppercase tracking-tight mb-1">Private Sale</h4>
                      <p className="font-body text-xs text-on-surface-variant">Restricted to Auteur tier. Custom revenue parameters.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-outline-variant/50 flex items-center justify-between">
                  <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
                    Estimated Gas: ~0.005 ETH · Protocol Fee: 5%
                  </span>
                  <Button type="submit" size="lg" disabled={!title || !director || !isValidSplit}>
                    Review & Register
                  </Button>
                </div>
                {!isValidSplit && (
                  <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant text-center -mt-4">
                    Revenue split must total 95% ({remaining}% remaining)
                  </p>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
