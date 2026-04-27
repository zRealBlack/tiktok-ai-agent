'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Video, Users, Lightbulb, Settings, Calendar, Layers, HelpCircle, LogOut, User } from "lucide-react";
import SettingsModal from "@/components/SettingsModal";

const NAV = [
  { href: "/",            label: "Overview",    icon: LayoutDashboard },
  { href: "/audit",       label: "Content Audit",icon: Video           },
  { href: "/competitors", label: "Competitors", icon: Users           },
  { href: "/ideas",       label: "Ideas",       icon: Lightbulb       },
];

const EXTRA = [Calendar, Layers, HelpCircle];

export default function Sidebar() {
  const pathname = usePathname();
  const [showSettings, setShowSettings] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  return (
    <>
      <aside
        className="fixed left-0 top-0 h-full z-40 flex flex-col items-center py-5 gap-2"
        style={{ width: 72, background: "var(--sidebar-bg)", borderRight: "1px solid var(--sidebar-border)", backdropFilter: "blur(32px)" }}
      >
        {/* Personal Account Avatar (Top Left) */}
        <div style={{ position: "relative", marginBottom: 14 }}>
          <button
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "var(--btn-primary-bg)",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, fontWeight: 800, color: "#fff",
              boxShadow: "0 4px 12px rgba(239,68,68,0.3)"
            }}
          >
            A
          </button>

          {/* Account Menu Dropdown */}
          {showAccountMenu && (
            <div style={{
              position: "absolute", top: 0, left: 56,
              background: "var(--glass-panel-bg, var(--glass-bg))",
              border: "1px solid var(--glass-border)",
              borderRadius: 16, padding: "12px", width: 220,
              boxShadow: "var(--glass-shadow)", zIndex: 50,
              backdropFilter: "blur(24px)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid var(--glass-border)" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--btn-primary-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff" }}>A</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Admin User</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>admin@mas.ai</div>
                </div>
              </div>
              
              <button style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px", borderRadius: 10, border: "none",
                background: "transparent", cursor: "pointer",
                color: "var(--text-primary)", fontSize: 12, fontWeight: 600,
                textAlign: "left"
              }}>
                <User size={14} /> Profile
              </button>
              
              <button style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px", borderRadius: 10, border: "none",
                background: "transparent", cursor: "pointer",
                color: "#ef4444", fontSize: 12, fontWeight: 600,
                textAlign: "left", marginTop: 4
              }}>
                <LogOut size={14} /> Log out
              </button>
            </div>
          )}
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

        {/* Settings Button */}
        <button 
          onClick={() => setShowSettings(true)}
          title="Settings"
          style={{
            width: 42, height: 42, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--glass-elevated)", border: "1px solid var(--glass-elevated-border)", 
            cursor: "pointer", transition: "all 0.18s", marginBottom: 10
          }}
        >
          <Settings size={18} color="var(--text-secondary)" strokeWidth={2} />
        </button>
      </aside>

      {/* Settings Modal */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}
