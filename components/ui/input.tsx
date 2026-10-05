import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-[#202E24] bg-[#0B0F0D] px-4 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus-visible:outline-none focus-visible:border-[#B6F34A] focus-visible:ring-1 focus-visible:ring-[#B6F34A] disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
