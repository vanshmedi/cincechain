import { Button } from "../components/ui/Button";
import { RainbowStripe } from "../components/ui/RainbowStripe";
import { ShieldAlert, ShieldCheck, AlertTriangle, ExternalLink, Download } from "lucide-react";

interface PiracyScreenProps {
  setView: (view: string, filmId?: string, curatorHandle?: string) => void;
}

export function PiracyScreen({ setView }: PiracyScreenProps) {
  const dbPiracyDetections: any[] = [];

  const severityColor = (s: string) => {
    if (s === "High") return "text-error bg-error/10";
    if (s === "Medium") return "text-tertiary bg-tertiary/10";
    return "text-outline bg-surface-container";
  };

  const severityIcon = (s: string) => {
    if (s === "High") return <ShieldAlert className="h-4 w-4 mr-1" />;
    if (s === "Medium") return <AlertTriangle className="h-4 w-4 mr-1" />;
    return <ShieldCheck className="h-4 w-4 mr-1" />;
  };

  const statusColor = (status: string) => {
    if (status === "Resolved") return "text-tertiary bg-tertiary/10";
    if (status === "DMCA Sent") return "text-secondary bg-secondary/10";
    return "text-error bg-error/10";
  };

  return (
    <div className="w-full pt-16 bg-surface min-h-screen">
      {/* Header */}
      <div className="w-full bg-on-surface pt-20 pb-16 relative overflow-hidden">
        <RainbowStripe className="absolute top-0 left-0 h-3 w-full" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center mb-6">
            <ShieldAlert className="h-8 w-8 text-error mr-4" />
            <div>
              <h1 className="text-5xl md:text-7xl font-headline font-black uppercase tracking-tighter text-surface-container-lowest">
                Piracy Detections
              </h1>
              <p className="text-lg font-body text-surface-variant mt-2">
                Rights holder portal. Watermark fingerprints monitored 24/7.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-surface-container border-b border-outline-variant/30 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { label: "Active Detections", value: dbPiracyDetections.filter(d => d.status !== "Resolved").length.toString(), color: "text-error" },
              { label: "Resolved", value: dbPiracyDetections.filter(d => d.status === "Resolved").length.toString(), color: "text-tertiary" },
              { label: "Films Monitored", value: "6", color: "text-on-surface" },
            ].map((s) => (
              <div key={s.label}>
                <p className={`font-headline font-black text-3xl ${s.color}`}>{s.value}</p>
                <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center border-b-2 border-on-surface pb-4 mb-10">
          <h2 className="text-3xl font-headline font-bold uppercase tracking-tight">Detection Log</h2>
          <Button variant="outline" size="sm" onClick={() => alert('Forensic package generated! Automated DMCA takedowns require a verified Filmmaker KYC profile.')}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        <div className="space-y-6">
          {dbPiracyDetections.map((detection) => (
            <div
              key={detection.id}
              className="bg-surface-container-lowest border border-outline-variant shadow-film overflow-hidden"
            >
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-32 h-24 md:h-auto flex-shrink-0">
                  <img
                    src={detection.filmImage}
                    alt={detection.filmTitle}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 p-6">
                  <div className="flex flex-wrap gap-3 items-center mb-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 font-label text-xs uppercase tracking-widest font-bold ${severityColor(detection.severity)}`}
                    >
                      {severityIcon(detection.severity)}
                      {detection.severity} Severity
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-1 font-label text-xs uppercase tracking-widest font-bold ${statusColor(detection.status)}`}
                    >
                      {detection.status}
                    </span>
                  </div>

                  <h3 className="font-headline font-bold text-xl uppercase tracking-tight mb-1">
                    {detection.filmTitle}
                  </h3>
                  <p className="font-mono text-xs text-on-surface-variant mb-3">
                    Fingerprint: {detection.fingerprint}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 bg-surface-container p-3 border border-outline-variant/50">
                      <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-1">Source URL</p>
                      <p className="font-mono text-xs text-error truncate">{detection.sourceUrl}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-1">Detected</p>
                      <p className="font-body text-sm font-bold">
                        {new Date(detection.detectedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-center p-6 border-t md:border-t-0 md:border-l border-outline-variant gap-3 md:w-48">
                  <Button size="sm" className="w-full" onClick={() => alert('Forensic package generated! Automated DMCA takedowns require a verified Filmmaker KYC profile.')}>
                    Send DMCA
                  </Button>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => alert('Forensic package generated! Automated DMCA takedowns require a verified Filmmaker KYC profile.')}>
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Source
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info panel */}
        <div className="mt-16 bg-on-surface text-surface-container-lowest p-8 relative overflow-hidden shadow-film">
          <RainbowStripe className="absolute top-0 left-0 h-2" />
          <div className="flex items-start">
            <ShieldCheck className="h-8 w-8 text-primary mr-6 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-2xl font-headline font-bold uppercase tracking-tight mb-2">
                How Watermarking Works
              </h3>
              <p className="font-body text-surface-variant leading-relaxed max-w-3xl">
                Every stream delivered through CineChain embeds an invisible, perceptually imperceptible
                watermark tied to the viewer's session ID (assigned at mint). When pirated content is
                detected anywhere on the web, our fingerprint scanner identifies the session ID and
                automatically flags the rights holder. DMCA notices can be issued directly from this panel.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
