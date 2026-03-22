import { cn } from "../../lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-headline uppercase tracking-tighter font-bold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none",
          {
            "bg-primary text-white hover:-translate-y-1 hover:translate-x-1 hover:shadow-hard":
              variant === "primary",
            "bg-secondary text-white hover:-translate-y-1 hover:translate-x-1 hover:shadow-hard":
              variant === "secondary",
            "border-2 border-on-surface text-on-surface hover:bg-on-surface hover:text-surface":
              variant === "outline",
            "text-on-surface hover:bg-surface-container": variant === "ghost",
            "px-4 py-2 text-sm": size === "sm",
            "px-6 py-3 text-base": size === "md",
            "px-8 py-4 text-lg": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
