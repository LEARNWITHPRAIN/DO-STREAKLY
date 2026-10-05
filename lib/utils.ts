import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

export function calculateLevel(xp: number): { level: number; currentLevelXp: number; nextLevelXp: number; progressPercent: number } {
  // Simple scalable progression: Level 1 = 0 XP, Level 2 = 100 XP, Level 3 = 250 XP, etc.
  // Each level requires (level * 100) XP.
  let lvl = 1;
  let accumulated = 0;
  while (true) {
    const neededForNext = lvl * 100;
    if (xp < accumulated + neededForNext) {
      const currentLevelXp = xp - accumulated;
      const nextLevelXp = neededForNext;
      const progressPercent = Math.min(100, Math.round((currentLevelXp / nextLevelXp) * 100));
      return {
        level: lvl,
        currentLevelXp,
        nextLevelXp,
        progressPercent,
      };
    }
    accumulated += neededForNext;
    lvl++;
  }
}
