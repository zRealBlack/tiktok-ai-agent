'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Video, Users, Lightbulb, Sun, Moon } from "lucide-react";
import { useData } from "@/components/DataContext";
import { useTheme } from "@/components/ThemeProvider";

const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/audit", label: "Content Audit", icon: Video },
  { href: "/competitors", label: "Competitors", icon: Users },
  { href: "/ideas", label: "Ideas", icon: Lightbulb },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const { account } = useData();

  return (
    <aside className="glass-sidebar fixed left-0 top-0 h-full w-[220px] flex flex-col z-40">
      {/* Brand */}
      <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
        <div className="flex items-center gap-2.5">
          <Image
            src="/mas-logo.png"
            alt="Mas AI Studio"
            width={32}
            height={32}
            className="rounded-xl object-contain mas-logo-red transition-all duration-300"
            style={{ background: 'transparent' }}
          />
          <div>
            <div className="text-[14px] font-extrabold tracking-tight mt-0.5" style={{ color: 'var(--text-primary)' }}>
              Mas AI Studio
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 group"
              style={active ? {
                background: 'var(--glass-elevated)',
                border: '1px solid var(--glass-elevated-border)',
                color: 'var(--text-primary)',
              } : {
                color: 'var(--text-muted)',
                border: '1px solid transparent',
              }}
            >
              <Icon
                size={15}
                strokeWidth={active ? 2.5 : 2}
                style={{ color: active ? 'var(--text-secondary)' : 'var(--text-faint)' }}
              />
              {label}
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full pulse-dot"
                  style={{ background: 'var(--text-secondary)' }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t space-y-3" style={{ borderColor: 'var(--sidebar-border)' }}>
        <button
          onClick={toggle}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-150 btn-secondary text-[12px] font-medium"
        >
          {theme === 'dark'
            ? <><Sun size={13} /> Light Mode</>
            : <><Moon size={13} /> Dark Mode</>}
        </button>
        {/* Account */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full glass-elevated flex items-center justify-center shrink-0">
            <span className="text-[12px] font-bold" style={{ color: 'var(--text-secondary)' }}>R</span>
          </div>
          <div className="min-w-0">
            <div className="text-[12px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {account?.username || '@rasayel_podcast'}
            </div>
            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {account?.followers ? `${(account.followers / 1000).toFixed(1)}K followers` : 'Loading...'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
