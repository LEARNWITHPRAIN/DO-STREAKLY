import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-primary-fixed/20 text-primary-fixed border border-primary-fixed/30",
    secondary: "border-transparent bg-surface-container-high text-on-surface",
    destructive: "border-transparent bg-error/20 text-error border border-error/30",
    outline: "text-on-surface border border-outline-variant",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
