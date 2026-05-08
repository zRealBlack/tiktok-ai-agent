import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { DataProvider } from "@/components/DataContext";
import PasswordGuard from "@/components/PasswordGuard";
import PwaRegister from "@/components/PwaRegister";
import DevButton from "@/components/DevButton";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Mas AI Studio",
  description: "Mas Sarie — AI-powered TikTok content strategy, audit, competitor intelligence, and idea generation.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mas Ai Studio",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0c0c0c",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <head />
      <body className="h-[100dvh] flex antialiased overflow-x-hidden">
        <ThemeProvider>
          <DataProvider>
            <PasswordGuard>
              {/* Gradient blob — top-left accent using brand red */}
              <div
                aria-hidden
                style={{
                  position: "fixed", top: -220, left: -220, width: 640, height: 640,
                  background: "radial-gradient(ellipse at 35% 35%, rgba(239,68,68,0.18) 0%, rgba(139,92,246,0.12) 42%, transparent 68%)",
                  filter: "blur(56px)", pointerEvents: "none", zIndex: 0,
                }}
              />
              <PwaRegister />
              <DevButton />
              {children}
            </PasswordGuard>
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
