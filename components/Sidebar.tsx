'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Video, Users, Lightbulb, Settings, Calendar, Layers, HelpCircle, MessageSquare } from "lucide-react";
import SettingsModal from "@/components/SettingsModal";

const NAV = [
  { href: "/",            label: "Overview",     icon: LayoutDashboard },
  { href: "/audit",       label: "Content Audit", icon: Video           },
  { href: "/competitors", label: "Competitors",   icon: Users           },
  { href: "/ideas",       label: "Ideas",         icon: Lightbulb       },
  { href: "/chat",        label: "Messages",      icon: MessageSquare   },
];

const EXTRA = [Calendar, Layers, HelpCircle];

export default function Sidebar() {
  const pathname = usePathname();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <aside
        className="fixed left-0 top-0 h-full z-40 flex flex-col items-center py-5 gap-2"
        style={{ width: 72 }}
      >
        <div style={{ height: 20 }} /> {/* Spacer since logo was removed */}

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
      </aside>

      {/* Floating Horizontal Profile Card (Bottom Left) */}
      <div style={{
        position: "fixed", bottom: 20, left: 20, zIndex: 50,
        display: "flex", alignItems: "center", gap: 12,
        background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
        padding: "8px 12px 8px 8px", borderRadius: 100,
        backdropFilter: "blur(24px)", boxShadow: "var(--glass-shadow)",
      }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--btn-primary-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
          A
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginRight: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>Admin User</span>
          <span style={{ fontSize: 10, color: "var(--text-muted)" }}>admin@mas.ai</span>
        </div>
        <div style={{ width: 1, height: 24, background: "var(--glass-border)", margin: "0 2px" }} />
        <button 
          onClick={() => setShowSettings(true)}
          title="Settings"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "transparent", border: "none", cursor: "pointer", padding: 6,
            borderRadius: "50%", transition: "background 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "var(--glass-elevated)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
        >
          <Settings size={18} color="var(--text-secondary)" strokeWidth={2} />
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}
