import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import AIChatBox from "@/components/AIChatBox";
import { ThemeProvider } from "@/components/ThemeProvider";
import { DataProvider } from "@/components/DataContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "TikTok AI Agent — MAS Studio",
  description: "AI-powered TikTok analytics, content audit, competitor intelligence, and video idea generation.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full dark`} suppressHydrationWarning>
      <head>
        {/* Anti-flash theme script — runs before hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme')||'dark';document.documentElement.classList.toggle('dark',t==='dark');})()`,
          }}
        />
      </head>
      <body className="min-h-full flex antialiased">
        <ThemeProvider>
          <DataProvider>
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-auto ml-[220px] min-h-screen">
              <div className="flex-1 page-fade">{children}</div>
            </main>
            <AIChatBox />
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
