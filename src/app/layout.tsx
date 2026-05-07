import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="dark">
      <body className="antialiased bg-stone-950 text-white font-sans">
        {children}
      </body>
    </html>
  );
}
