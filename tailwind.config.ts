import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0B0F0D",
        surface: {
          DEFAULT: "#121814",
          elevated: "#17211B",
          highlight: "#1F2E25",
          border: "#202E24",
          borderLight: "#2C3F32",
        },
        brand: {
          lime: "#B6F34A",
          green: "#84CC16",
          dark: "#0B0F0D",
          muted: "#94A3B8",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        display: ["var(--font-space-grotesk)", "Space Grotesk", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(182, 243, 74, 0.35)",
        "glow-sm": "0 0 15px -3px rgba(182, 243, 74, 0.25)",
        "glow-lg": "0 0 40px -5px rgba(182, 243, 74, 0.45)",
      },
    },
  },
  plugins: [],
};
export default config;
