import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B6F34A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F0D] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const variants = {
      primary:
        "bg-[#B6F34A] text-[#0B0F0D] font-semibold hover:bg-[#A3E635] shadow-glow-sm hover:shadow-glow",
      secondary:
        "bg-[#17211B] text-white border border-[#202E24] hover:bg-[#1F2E25] hover:border-[#2C3F32]",
      outline:
        "border border-[#2C3F32] bg-transparent text-gray-200 hover:bg-[#121814] hover:text-[#B6F34A] hover:border-[#B6F34A]/50",
      ghost:
        "bg-transparent text-gray-300 hover:bg-[#17211B] hover:text-white",
      danger:
        "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
      md: "h-10 px-4 text-sm rounded-xl gap-2",
      lg: "h-12 px-6 text-base rounded-xl gap-2.5",
      icon: "h-10 w-10 p-0 rounded-xl",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
