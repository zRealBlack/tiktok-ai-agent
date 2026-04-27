'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Video, Users, Lightbulb, Settings, Calendar, Layers, HelpCircle } from "lucide-react";
import { useData } from "@/components/DataContext";
import { useTheme, type Theme } from "@/components/ThemeProvider";

const NAV = [
  { href: "/",            label: "Overview",    icon: LayoutDashboard },
  { href: "/audit",       label: "Content Audit",icon: Video           },
  { href: "/competitors", label: "Competitors", icon: Users           },
  { href: "/ideas",       label: "Ideas",       icon: Lightbulb       },
];

const EXTRA = [Calendar, Layers, HelpCircle, Settings];

const THEMES: { id: Theme; swatch: string }[] = [
  { id: "dark",     swatch: "#18181b" },
  { id: "light",    swatch: "#eff0f6" },
  { id: "neon",     swatch: "#8b5cf6" },
  { id: "terminal", swatch: "#00d46a" },
  { id: "minimal",  swatch: "#f5f5f5" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { account }        = useData();
  const { theme, setTheme } = useTheme();

  const initial = (account?.username || "@R")[1]?.toUpperCase() || "R";

  return (
    <aside
      className="fixed left-0 top-0 h-full z-40 flex flex-col items-center py-5 gap-2"
      style={{ width: 72 }}
    >
      {/* Logo */}
      <div style={{ marginBottom: 14, flexShrink: 0, width: 44, display: "flex", justifyContent: "center" }}>
        <Image
          src="/MAS-aistudiored.png"
          alt="MAS AI Studio"
          width={36}
          height={36}
          className="object-contain dynamic-logo"
          style={{ background: "transparent" }}
          priority
        />
      </div>

      {/* Nav icons */}
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            title={label}
            style={{
              width: 42, height: 42, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              textDecoration: "none",
              background: active ? "var(--btn-primary-bg)" : "var(--glass-elevated)",
              border: active ? "none" : "1px solid var(--glass-elevated-border)",
              boxShadow: active ? "0 4px 16px rgba(239,68,68,0.3)" : "none",
              transition: "all 0.18s",
            }}
          >
            <Icon size={16} color={active ? "#fff" : "var(--text-faint)"} strokeWidth={active ? 2.5 : 2} />
          </Link>
        );
      })}

      <div style={{ height: 8 }} />

      {/* Extra icons (decorative) */}
      {EXTRA.map((Icon, i) => (
        <button key={i} style={{
          width: 42, height: 42, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "transparent", border: "none", cursor: "pointer",
          opacity: 0.4,
        }}>
          <Icon size={15} color="var(--text-muted)" strokeWidth={1.6} />
        </button>
      ))}

      <div style={{ flex: 1 }} />

      {/* Theme dots */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center", marginBottom: 10 }}>
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            title={t.id}
            style={{
              width: theme === t.id ? 10 : 7,
              height: theme === t.id ? 10 : 7,
              borderRadius: "50%",
              background: t.swatch,
              border: theme === t.id ? "2px solid var(--text-secondary)" : "1.5px solid var(--glass-elevated-border)",
              transition: "all 0.18s",
              cursor: "pointer",
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* Avatar */}
      <div style={{
        width: 34, height: 34, borderRadius: "50%",
        background: "var(--glass-elevated)",
        border: "1.5px solid var(--glass-elevated-border)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 800,
        color: "var(--text-secondary)",
      }}>
        {initial}
      </div>
    </aside>
  );
}
