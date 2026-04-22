import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import AIChatBox from "@/components/AIChatBox";
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
              <Sidebar />
              <main className="flex-1 flex flex-col overflow-auto ml-[220px] min-h-screen">
                <div className="flex-1 page-fade">{children}</div>
              </main>
              <AIChatBox />
            </PasswordGuard>
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
