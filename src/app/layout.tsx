import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const imFellEnglishSC = localFont({
  src: "./fonts/im-fell-english-sc-latin-400-normal.woff2",
  variable: "--font-im-fell-english-sc",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DnD Travel Planner",
  description: "Plan your D&D wilderness journey: travel time, rations, encounters, and narrative.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${imFellEnglishSC.variable} antialiased bg-amber-50 text-amber-950 font-sans`}>
        {children}
      </body>
    </html>
  );
}
