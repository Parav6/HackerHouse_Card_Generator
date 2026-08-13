import type { Metadata } from "next";
import { Playfair_Display, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hacker House Goa Builder Network | Builder ID & Passport",
  description: "Generate your Hacker House Goa Builder ID card, scan other builder QR codes, build your network, and join the event leaderboard.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "Hacker House Goa Builder Network",
    description: "Generate your Builder ID passport, scan, and connect at Hacker House Goa 2026.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hacker House Goa Builder Network",
    description: "Generate your Builder ID passport, scan, and connect at Hacker House Goa 2026.",
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${outfit.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-hh-green-dark text-white font-sans selection:bg-hh-pink selection:text-white">
        {children}
      </body>
    </html>
  );
}
