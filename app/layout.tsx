import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#121413",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "DO STREAKLY",
  description: "Build habits together. Challenge your friends. Stay accountable.",
  manifest: "/manifest.json",
  icons: { icon: "/logo.jpg", apple: "/logo.jpg" },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DO STREAKLY",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} dark`}>
      <head>
        {/* Material Symbols Outlined */}
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&family=Geist:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/logo.jpg" />
      </head>
      <body
        className="bg-surface text-on-surface antialiased"
        style={{ fontFamily: "Geist, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
