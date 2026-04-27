'use client';

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useData } from "@/components/DataContext";
import {
  LayoutDashboard, Video, Users, Lightbulb,
  Search, Settings, Bell, Zap, PieChart, TrendingUp, Calendar, Tag,
} from "lucide-react";

const NAV = [
  { href: "/designs/modern",             label: "Overview",       icon: LayoutDashboard },
  { href: "/designs/modern/audit",       label: "Content Audit",  icon: Video },
  { href: "/designs/modern/competitors", label: "Competitors",    icon: Users },
  { href: "/designs/modern/ideas",       label: "Ideas",          icon: Lightbulb },
];

const SIDE_ICONS = [PieChart, TrendingUp, Calendar, Tag, Search];

export default function ModernLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { account } = useData();
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", background: "#eff0f3",
      fontFamily: "var(--font-inter, Inter, sans-serif)",
      overflow: "hidden",
    }}>
      {/* ── ICON SIDEBAR ─────────────────────────── */}
      <aside style={{
        width: 72, flexShrink: 0,
        background: "#fff",
        borderRight: "1px solid rgba(0,0,0,0.07)",
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "20px 0", gap: 4,
      }}>
        {/* Logo */}
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, flexShrink: 0 }}>
          <span style={{ fontWeight: 900, fontSize: 14, color: "#fff" }}>M</span>
        </div>

        {/* Nav icons */}
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/designs/modern" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} title={label} style={{
              width: 44, height: 44, borderRadius: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
              textDecoration: "none",
              background: active ? "#eef2ff" : "transparent",
              transition: "background 0.15s",
            }}>
              <Icon size={18} color={active ? "#4263eb" : "#adb5bd"} strokeWidth={active ? 2.5 : 2} />
            </Link>
          );
        })}

        {/* Extra icons */}
        <div style={{ height: 16 }} />
        {SIDE_ICONS.map((Icon, i) => (
          <button key={i} style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", background: "transparent" }}>
            <Icon size={17} color="#d0d5dd" />
          </button>
        ))}

        <div style={{ flex: 1 }} />
        <button style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", background: "transparent" }}>
          <Settings size={17} color="#adb5bd" />
        </button>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #4263eb, #748ffc)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", marginTop: 4 }}>
          {(account?.username || "R")[1]?.toUpperCase() || "R"}
        </div>
      </aside>

      {/* ── RIGHT: HEADER + CONTENT ──────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>

        {/* HEADER */}
        <header style={{
          background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.07)",
          padding: "0 28px", display: "flex", alignItems: "center",
          height: 68, gap: 20, flexShrink: 0,
        }}>
          <div style={{ minWidth: 180 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#1a1a2e", letterSpacing: "-0.03em" }}>Hi, Yassin!</div>
            <div style={{ fontSize: 12, color: "#adb5bd", marginTop: 1 }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>

          {/* Search */}
          <div style={{ flex: 1, maxWidth: 400, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f8f9fa", border: "1px solid #e9ecef", borderRadius: 12, padding: "9px 16px" }}>
              <Search size={14} color="#adb5bd" />
              <span style={{ flex: 1, fontSize: 13, color: "#adb5bd" }}>Search videos, metrics, ideas...</span>
              <kbd style={{ fontSize: 10, color: "#ced4da", background: "#fff", border: "1px solid #dee2e6", borderRadius: 6, padding: "2px 6px", fontFamily: "inherit" }}>⌘K</kbd>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
            <button style={{ width: 38, height: 38, borderRadius: 10, border: "1px solid #e9ecef", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Settings size={15} color="#868e96" />
            </button>
            <button style={{ width: 38, height: 38, borderRadius: 10, border: "1px solid #e9ecef", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
              <Bell size={15} color="#868e96" />
              <div style={{ position: "absolute", top: 8, right: 8, width: 7, height: 7, borderRadius: "50%", background: "#f03e3e", border: "2px solid #fff" }} />
            </button>
            <button onClick={() => setChatOpen(true)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 10, background: "#1a1a2e", border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              <Zap size={13} /> Ask Sarie
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          {children}
        </main>
      </div>

      {/* ── SARIE CHAT OVERLAY ────────────────────── */}
      {chatOpen && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "flex-end", padding: 24 }} onClick={() => setChatOpen(false)}>
          <div style={{ background: "#fff", borderRadius: 20, width: 380, height: 500, boxShadow: "0 24px 80px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid #f1f3f5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center" }}><Zap size={15} color="#fff"/></div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}>Sarie</div>
                  <div style={{ fontSize: 11, color: "#adb5bd" }}>AI Content Strategist</div>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 20, color: "#ced4da", lineHeight: 1 }}>×</button>
            </div>
            <div style={{ flex: 1, padding: 22, display: "flex", alignItems: "center", justifyContent: "center", color: "#adb5bd", fontSize: 13 }}>
              Chat available in the full app →
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
