import { ArrowLeft } from "lucide-react";

interface VideoPlayerScreenProps {
  filmTitle: string;
  videoUrl: string;
  onBack: () => void;
}

export function VideoPlayerScreen({ filmTitle, videoUrl, onBack }: VideoPlayerScreenProps) {
  return (
    <div className="fixed inset-0 z-[100] bg-on-surface text-surface flex flex-col">
      <div className="absolute top-0 w-full p-6 flex justify-between items-center z-10 bg-gradient-to-b from-on-surface/80 to-transparent">
        <button
          onClick={onBack}
          className="flex items-center hover:text-primary transition-colors font-label text-xs uppercase tracking-widest text-surface-container-lowest drop-shadow-md"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Vault
        </button>
        <span className="font-headline font-bold text-lg uppercase tracking-tight text-surface-container-lowest drop-shadow-md">
          {filmTitle}
        </span>
      </div>
      <div className="flex-1 w-full flex items-center justify-center bg-black">
        <video 
          controls 
          autoPlay 
          className="w-full h-full max-h-screen object-contain"
          src={videoUrl}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}
