'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useData } from "@/components/DataContext";
import {
  LayoutGrid, Calendar, ShoppingBag, FileText,
  CheckSquare, Layers, Package, Bell, Users,
  Folder, HelpCircle, Settings, Search, Zap,
} from "lucide-react";

const NAV = [
  { href: "/designs/panze",             icon: LayoutGrid, label: "Overview"    },
  { href: "/designs/panze/audit",       icon: Layers,     label: "Audit"       },
  { href: "/designs/panze/competitors", icon: Users,      label: "Competitors" },
  { href: "/designs/panze/ideas",       icon: FileText,   label: "Ideas"       },
];

const EXTRA = [Calendar, ShoppingBag, CheckSquare, Package, Bell, Folder, HelpCircle, Settings];
const TABS  = ["Today", "This Week", "This Month", "Reports"];

export default function PanzeLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const { account } = useData();

  const title =
    pathname === "/designs/panze"                ? "Content Dashboard" :
    pathname.startsWith("/designs/panze/audit")  ? "Content Audit"     :
    pathname.startsWith("/designs/panze/comp")   ? "Competitors"       :
    pathname.startsWith("/designs/panze/idea")   ? "Video Ideas"       : "Dashboard";

  const sub =
    pathname === "/designs/panze"                ? "Analyze and grow your channel"   :
    pathname.startsWith("/designs/panze/audit")  ? "All videos scored by Sarie"       :
    pathname.startsWith("/designs/panze/comp")   ? "Live landscape intelligence"      :
    pathname.startsWith("/designs/panze/idea")   ? "AI-generated content briefs"      : "";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#eff0f5",
      fontFamily: "var(--font-inter, Inter, sans-serif)",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
    }}>

      {/* ── GRADIENT BLOB (top-left) ─────────────── */}
      <div style={{
        position: "absolute", top: -180, left: -180,
        width: 600, height: 600, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse at 30% 30%, rgba(251,146,60,0.45) 0%, rgba(167,139,250,0.3) 40%, transparent 68%)",
        filter: "blur(48px)",
      }} />

      {/* ── TOP BAR (floats on background, no box) ── */}
      <div style={{
        position: "relative", zIndex: 10,
        display: "flex", alignItems: "center",
        padding: "22px 32px 0", gap: 24, flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 1, minWidth: 170 }}>
          <span style={{ fontSize: 26, fontWeight: 900, color: "#111", letterSpacing: "-0.05em" }}>·mas</span>
          <div style={{ display: "flex", flexDirection: "column", marginLeft: 2 }}>
            <span style={{ fontSize: 9, color: "#999", letterSpacing: "0.12em", textTransform: "uppercase", lineHeight: 1 }}>studio.</span>
          </div>
        </div>

        {/* Pill tabs — centered */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <div style={{ display: "flex", gap: 6, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.9)", borderRadius: 100, padding: "5px" }}>
            {TABS.map((t, i) => (
              <button key={t} style={{
                padding: "8px 20px", borderRadius: 100, border: "none",
                cursor: "pointer", fontSize: 13, fontWeight: 600,
                background: i === 2 ? "#111" : "transparent",
                color: i === 2 ? "#fff" : "#777",
                transition: "all 0.18s",
              }}>{t}</button>
            ))}
          </div>
        </div>

        {/* Search pill */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.9)", borderRadius: 100, padding: "10px 20px", minWidth: 180 }}>
          <Search size={14} color="#bbb" />
          <span style={{ fontSize: 13, color: "#bbb" }}>Search Task...</span>
        </div>
      </div>

      {/* ── BODY (sidebar + main) ─────────────────── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative", zIndex: 1, padding: "0 20px 20px 0" }}>

        {/* SIDEBAR — transparent, no bg */}
        <aside style={{
          width: 68, flexShrink: 0,
          display: "flex", flexDirection: "column", alignItems: "center",
          paddingTop: 24, gap: 6,
        }}>
          {/* Active icon — filled dark circle */}
          {NAV.map(({ href, icon: Icon, label }, idx) => {
            const active = pathname === href || (href !== "/designs/panze" && pathname.startsWith(href));
            return (
              <Link key={href} href={href} title={label} style={{ textDecoration: "none" }}>
                <div style={{
                  width: 42, height: 42, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: active ? "#1a1a2e" : "rgba(255,255,255,0.55)",
                  border: active ? "none" : "1px solid rgba(255,255,255,0.8)",
                  backdropFilter: active ? "none" : "blur(8px)",
                  boxShadow: active ? "0 4px 14px rgba(0,0,0,0.15)" : "0 2px 8px rgba(0,0,0,0.06)",
                  cursor: "pointer", transition: "all 0.18s",
                }}>
                  <Icon size={17} color={active ? "#fff" : "#aaa"} strokeWidth={active ? 2.5 : 1.8} />
                </div>
              </Link>
            );
          })}

          <div style={{ height: 10 }} />

          {EXTRA.map((Icon, i) => (
            <button key={i} style={{
              width: 42, height: 42, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "transparent", border: "none", cursor: "pointer",
            }}>
              <Icon size={16} color="#ccc" strokeWidth={1.6} />
            </button>
          ))}
        </aside>

        {/* MAIN */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", paddingLeft: 8 }}>

          {/* Page title + search row */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "20px 0 22px" }}>
            <div>
              <div style={{ fontSize: 13, color: "#999", fontWeight: 500, marginBottom: 5 }}>{sub}</div>
              <h1 style={{ fontSize: 48, fontWeight: 900, color: "#111", margin: 0, letterSpacing: "-0.045em", lineHeight: 1 }}>{title}</h1>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.9)", borderRadius: 100, padding: "11px 22px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <Search size={15} color="#bbb" />
                <span style={{ fontSize: 13, color: "#bbb" }}>Search anything...</span>
              </div>
              <button style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 100, background: "#1a1a2e", border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(0,0,0,0.2)" }}>
                <Zap size={13} /> Sarie
              </button>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#f97316,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                {(account?.username || "R")[1]?.toUpperCase() || "R"}
              </div>
            </div>
          </div>

          {/* Cards */}
          <div style={{ flex: 1, overflowY: "auto", paddingRight: 4 }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
