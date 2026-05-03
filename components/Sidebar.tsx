'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Video, Users, Lightbulb, Settings, Calendar, Layers, HelpCircle, MessageSquare, ShieldAlert } from "lucide-react";
import SettingsModal from "@/components/SettingsModal";
import MASLogo from "@/public/MAS-aistudiored.png";
import { useData } from "@/components/DataContext";

const NAV = [
  { href: "/",            label: "Overview",     icon: LayoutDashboard },
  { href: "/audit",       label: "Content Audit", icon: Video           },
  { href: "/competitors", label: "Competitors",   icon: Users           },
  { href: "/ideas",       label: "Ideas",         icon: Lightbulb       },
];

const EXTRA = [Calendar, Layers, HelpCircle];

export default function Sidebar() {
  const pathname = usePathname();
  const [showSettings, setShowSettings] = useState(false);
  const { currentUser } = useData();

  return (
    <>
      <aside
        className="fixed z-40 flex bg-[var(--glass-bg)] backdrop-blur-xl border-t border-[var(--glass-border)] md:bg-transparent md:border-none md:backdrop-blur-none
                   bottom-0 left-0 right-0 h-[72px] flex-row justify-center gap-6 items-center px-4 py-0
                   md:top-0 md:bottom-auto md:w-[72px] md:h-full md:flex-col md:py-5 md:gap-2 md:justify-start md:pt-[68px]"
      >
      {/* Logo — fixed top-left, separate from sidebar icon flow */}
      <Link href="/" title="MAS AI Studio" className="hidden md:flex" style={{
        position: "fixed", top: 16, left: 8, zIndex: 50,
        textDecoration: "none",
      }}>
        <div style={{
          width: 112, height: 36, borderRadius: 10,
          background: "var(--glass-elevated)", border: "1px solid var(--glass-elevated-border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 16px rgba(239,68,68,0.15)",
          overflow: "hidden", padding: "4px 8px",
        }}>
          <Image src={MASLogo} alt="MAS AI Studio" width={96} height={28} style={{ objectFit: "contain", width: "100%", height: "100%" }} />
        </div>
      </Link>

        {/* Divider */}
        <div className="hidden md:block" style={{ width: 24, height: 1, background: "var(--glass-border)", margin: "2px 0 6px" }} />

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
        {/* Developer Admin Icon (Yassin Only) */}
        {currentUser?.id === "yassin" && (
          <Link
            href="/developer"
            title="Developer Admin"
            style={{
              width: 42, height: 42, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              textDecoration: "none",
              background: pathname.startsWith("/developer") ? "var(--btn-primary-bg)" : "var(--glass-elevated)",
              border: pathname.startsWith("/developer") ? "none" : "1px solid var(--glass-elevated-border)",
              boxShadow: pathname.startsWith("/developer") ? "0 4px 16px rgba(239,68,68,0.3)" : "none",
              transition: "all 0.18s",
              marginTop: 4,
            }}
          >
            <ShieldAlert size={16} color={pathname.startsWith("/developer") ? "#fff" : "var(--text-faint)"} strokeWidth={pathname.startsWith("/developer") ? 2.5 : 2} />
          </Link>
        )}

        <div className="hidden md:block" style={{ height: 8 }} />

        {/* Extra icons (decorative) */}
        {EXTRA.map((Icon, i) => (
          <button key={i} className="hidden md:flex" style={{
            width: 42, height: 42, borderRadius: "50%",
            alignItems: "center", justifyContent: "center",
            background: "transparent", border: "none", cursor: "pointer",
            opacity: 0.4,
          }}>
            <Icon size={15} color="var(--text-muted)" strokeWidth={1.6} />
          </button>
        ))}

        <div className="hidden md:block" style={{ flex: 1 }} />

        {/* Profile icon for mobile (hidden on desktop) */}
        <div className="flex md:hidden items-center justify-center w-[42px] h-[42px] rounded-full bg-red-500 text-white font-bold text-sm shadow-[0_4px_16px_rgba(239,68,68,0.3)]">
          {currentUser ? currentUser.name[0].toUpperCase() : "U"}
        </div>

        {/* Messages Icon moved to bottom above profile card */}
        <Link
          href="/chat"
          title="Messages"
          className="md:mb-[72px]"
          style={{
            width: 42, height: 42, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            textDecoration: "none",
            background: pathname.startsWith("/chat") ? "var(--btn-primary-bg)" : "var(--glass-elevated)",
            border: pathname.startsWith("/chat") ? "none" : "1px solid var(--glass-elevated-border)",
            boxShadow: pathname.startsWith("/chat") ? "0 4px 16px rgba(239,68,68,0.3)" : "none",
            transition: "all 0.18s",
          }}
        >
          <MessageSquare size={16} color={pathname.startsWith("/chat") ? "#fff" : "var(--text-faint)"} strokeWidth={pathname.startsWith("/chat") ? 2.5 : 2} />
        </Link>
      </aside>

      {/* Floating Horizontal Profile Card (Bottom Left) */}
      <div className="hidden md:flex" style={{
        position: "fixed", bottom: 20, left: 20, zIndex: 50,
        alignItems: "center", gap: 12,
        background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
        padding: "8px 12px 8px 8px", borderRadius: 100,
        backdropFilter: "blur(24px)", boxShadow: "var(--glass-shadow)",
      }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--btn-primary-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
          {currentUser ? currentUser.name[0].toUpperCase() : "A"}
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginRight: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>{currentUser ? currentUser.name : "Admin User"}</span>
          <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{currentUser ? currentUser.email : "admin@mas.ai"}</span>
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
