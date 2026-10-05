import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "lime" | "outline" | "secondary" | "streak" | "gold" | "silver";
}

export function Badge({ className, variant = "secondary", ...props }: BadgeProps) {
  const variants = {
    lime: "bg-[#B6F34A]/15 text-[#B6F34A] border-[#B6F34A]/30",
    secondary: "bg-[#17211B] text-gray-300 border-[#202E24]",
    outline: "border-[#2C3F32] text-gray-400 bg-transparent",
    streak: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    gold: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    silver: "bg-slate-400/15 text-slate-300 border-slate-400/30",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors gap-1",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
