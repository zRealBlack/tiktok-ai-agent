'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useData } from "@/components/DataContext";
import { ArrowLeft, ChevronDown, Check, Settings, LogOut, ChevronRight } from 'lucide-react';

// ─── Clients ──────────────────────────────────────────────────────────────────
const CLIENTS = [
  { id: "rasayel", username: "@rasayel_podcast", name: "Rasayel Podcast", initial: "R", color: "#8b5cf6" },
];

function AccountDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(CLIENTS[0]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white/80 text-gray-700 rounded-[20px] py-2 px-5 flex items-center justify-between text-[13px] font-medium hover:bg-white transition-colors shadow-sm w-full"
      >
        <span className="truncate">{selected.username}</span>
        <ChevronDown size={13} className={`text-gray-400 transition-transform shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 w-full mt-1.5 bg-white border border-gray-100 rounded-[16px] shadow-lg z-50 overflow-hidden py-1">
            {CLIENTS.map(c => (
              <button
                key={c.id}
                onClick={() => { setSelected(c); setIsOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-[13px] flex items-center justify-between gap-2 hover:bg-gray-50 transition-colors ${selected.id === c.id ? 'text-gray-900 font-bold' : 'text-gray-600 font-medium'}`}
              >
                <span className="truncate">{c.username}</span>
                {selected.id === c.id && <Check size={12} className="text-gray-400 shrink-0" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SubNav() {
  const pathname = usePathname();

  const links = [
    { name: 'Overview', href: '/dashboard' },
    { name: 'Audit', href: '/dashboard/audit' },
    { name: 'Competitor Analysis', href: '/dashboard/competitors' },
    { name: 'Idea Generation', href: '/dashboard/ideas' },
  ];

  return (
    <div className="flex bg-gray-100 p-1 rounded-full text-[13px] font-medium">
      {links.map(l => {
        const isActive = pathname === l.href;
        return (
          <Link key={l.name} href={l.href} className={`px-5 py-1.5 rounded-full transition-all ${isActive ? 'bg-white shadow-sm text-gray-800 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}>
            {l.name}
          </Link>
        );
      })}
    </div>
  );
}

// ─── Avatar circle (identical to main page) ───────────────────────────────────
function AvatarCircle({ name, size = 28 }: { name: string; size?: number }) {
  const colors = ["#ef4444", "#8b5cf6", "#3b82f6", "#22c55e", "#f59e0b", "#ec4899"];
  const color = colors[(name || "U").charCodeAt(0) % colors.length];
  const initial = (name || "U")[0].toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
      {initial}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { currentUser } = useData();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div className="h-screen w-full bg-white flex items-center justify-center p-8" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* BEGIN: MainContainer */}
      <div className="bg-[#f2f2f2] w-full max-w-[1600px] h-full rounded-[32px] shadow-2xl flex overflow-hidden relative text-[#2b2b2b] text-[14px]">

        {/* BEGIN: LeftSidebar */}
        <aside className="w-[200px] flex flex-col justify-between p-6 pl-8">
          <div className="space-y-4 pt-4 flex-1 flex flex-col h-full overflow-hidden">

            {/* Nav — matches main page exactly */}
            <nav className="space-y-2.5 mt-2 shrink-0 flex flex-col items-start">
              <Link
                href="/"
                className="bg-[#2b2b2b] text-white rounded-[20px] py-2 px-5 flex items-center gap-2 text-[13px] font-medium hover:bg-black transition-colors shadow-sm w-full"
              >
                <ArrowLeft size={14} className="text-gray-300" />
                Back
              </Link>
            </nav>

            {/* Client section */}
            <div className="space-y-1 mt-6 flex-1 overflow-y-auto pr-1">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1 mb-2">Client</h4>
              <AccountDropdown />
            </div>

          </div>

          {/* User Card — identical to main page */}
          <div className="pb-4 shrink-0 mt-4 border-t border-gray-100 pt-4 relative">
            <div
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 w-full p-2 hover:bg-white rounded-xl cursor-pointer transition-colors"
            >
              <AvatarCircle name={currentUser?.name || "User"} size={28} />
              <div className="flex-1 min-w-0">
                <h4 className="text-[11px] font-bold text-gray-800 truncate leading-tight">{currentUser?.name || "User"}</h4>
                <p className="text-[9px] text-gray-500 truncate">{currentUser?.role || "Team Member"}</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <Settings size={12} />
              </button>
            </div>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute bottom-full left-0 mb-2 w-full bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden py-1">
                  <button onClick={() => setShowUserMenu(false)} className="w-full text-left px-4 py-2.5 text-xs flex items-center gap-2 hover:bg-gray-50 transition-colors text-gray-700 font-medium">
                    <Settings size={12} className="text-gray-500" />
                    Settings
                  </button>
                  <button
                    onClick={() => { localStorage.removeItem('mas_ai_authenticated_user'); window.location.href = '/'; }}
                    className="w-full text-left px-4 py-2.5 text-xs flex items-center gap-2 hover:bg-red-50 hover:text-red-600 transition-colors text-red-500 font-medium"
                  >
                    <LogOut size={12} />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </aside>
        {/* END: LeftSidebar */}

        {/* BEGIN: Main Dashboard Area */}
        <main className="flex-1 bg-[#fbfbfb] my-4 mr-4 rounded-[24px] shadow-sm flex flex-col relative overflow-hidden">
          {/* Top Bar */}
          <div className="absolute top-0 w-full flex justify-between items-center py-4 px-8 bg-gradient-to-b from-[#fbfbfb] to-transparent z-10">
            <div className="flex items-center gap-1.5 text-[13px]">
              <span className="text-gray-700 font-medium">MAS AI Studio</span>
              <ChevronRight size={12} className="text-gray-300 mx-0.5" />
              <span className="text-gray-700 font-semibold">Dashboard</span>
            </div>
            <SubNav />
          </div>

          <div className="flex-1 overflow-y-auto pt-16">
            {children}
          </div>
        </main>
        {/* END: Main Dashboard Area */}

        {/* Floating Logo Widget — matches main page */}
        <div className="absolute bottom-8 right-8 flex items-end z-20">
          <img alt="Masaa Logo" className="w-20 object-contain drop-shadow-xl" src="/masmas.png" />
        </div>

      </div>
      {/* END: MainContainer */}

    </div>
  );
}
