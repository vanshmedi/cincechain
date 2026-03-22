import { cn } from "../../lib/utils";
import { HTMLAttributes, forwardRef } from "react";

export interface PolaroidProps extends HTMLAttributes<HTMLDivElement> {
  imageUrl: string;
  title: string;
  subtitle?: string;
  aspectRatio?: "video" | "square" | "portrait";
}

const Polaroid = forwardRef<HTMLDivElement, PolaroidProps>(
  ({ className, imageUrl, title, subtitle, aspectRatio = "video", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-surface-container-lowest p-4 pb-16 shadow-film hover:-translate-y-2 hover:shadow-film-hover transition-all duration-300 group cursor-pointer",
          className
        )}
        {...props}
      >
        <div
          className={cn("w-full bg-surface-container overflow-hidden mb-4", {
            "aspect-video": aspectRatio === "video",
            "aspect-square": aspectRatio === "square",
            "aspect-[3/4]": aspectRatio === "portrait",
          })}
        >
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex flex-col">
          <h3 className="font-headline font-bold text-lg uppercase tracking-tight text-on-surface line-clamp-1">
            {title}
          </h3>
          {subtitle && (
            <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    );
  }
);
Polaroid.displayName = "Polaroid";

export { Polaroid };
