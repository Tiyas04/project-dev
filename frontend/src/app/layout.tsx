import type { Metadata } from "next";
import { Cabin_Sketch, Space_Mono } from "next/font/google";
import "./globals.css";
import { Background } from "@/components/background";
import { Providers } from "@/app/providers";

const cabinSketch = Cabin_Sketch({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-cabin-sketch",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: "DevArena - Your ultimate programmming tracking platform",
  description: "Track your progress, compete with others, and become a better programmer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cabinSketch.variable} ${spaceMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col font-mono bg-paper">
        <Providers>
          <Background />
          {children}
        </Providers>
      </body>
    </html>
  );
}
