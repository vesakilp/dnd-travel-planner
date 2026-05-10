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
    <html lang="en">
      <body className="antialiased bg-amber-50 text-amber-950 font-sans">
        {children}
      </body>
    </html>
  );
}
