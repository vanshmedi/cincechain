import { cn } from "../../lib/utils";

export function RainbowStripe({ className }: { className?: string }) {
  return <div className={cn("h-2 w-full rainbow-bg", className)} />;
}
