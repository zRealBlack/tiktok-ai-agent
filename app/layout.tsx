import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { DataProvider } from "@/components/DataContext";
import PasswordGuard from "@/components/PasswordGuard";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Mas AI Studio",
  description: "Mas Sarie — AI-powered TikTok content strategy, audit, competitor intelligence, and idea generation.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full dark`} suppressHydrationWarning>
      <head />
      <body className="min-h-full flex antialiased">
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
              <Sidebar />
              <main className="flex-1 flex flex-col overflow-auto min-h-screen relative ml-0 md:ml-[72px] pb-[72px] md:pb-0 transition-all duration-300">
                <TopBar />
                <div className="flex-1 page-fade">{children}</div>
              </main>
            </PasswordGuard>
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
