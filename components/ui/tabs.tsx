"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

const TabsContext = React.createContext<{
  value: string;
  onValueChange: (val: string) => void;
}>({
  value: "",
  onValueChange: () => {},
});

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-xl bg-[#0B0F0D] p-1 border border-[#202E24] text-gray-400 w-full md:w-auto",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const context = React.useContext(TabsContext);
  const isActive = context.value === value;

  return (
    <button
      type="button"
      onClick={() => context.onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-1.5 text-xs md:text-sm font-medium transition-all duration-200 focus-visible:outline-none flex-1 md:flex-none",
        isActive
          ? "bg-[#17211B] text-[#B6F34A] shadow-sm font-semibold border border-[#2C3F32]"
          : "text-gray-400 hover:text-gray-200 hover:bg-[#121814]/50",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const context = React.useContext(TabsContext);
  if (context.value !== value) return null;

  return <div className={cn("mt-4 focus-visible:outline-none", className)}>{children}</div>;
}
