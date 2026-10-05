import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0B0F0D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "DO STREAKLY — Better habits. Together.",
  description:
    "Build habits together. Challenge your friends. Stay accountable. Personal habit tracking with high-stakes social challenges, XP, and streak leaderboards.",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DO STREAKLY",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} dark`}>
      <head>
        <link rel="apple-touch-icon" href="/logo.jpg" />
      </head>
      <body className="bg-background text-gray-100 min-h-screen antialiased selection:bg-[#B6F34A]/30 selection:text-white">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
