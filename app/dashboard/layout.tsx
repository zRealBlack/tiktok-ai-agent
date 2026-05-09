'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useData } from "@/components/DataContext";
import { ArrowLeft, ChevronDown, Check, Settings, LogOut, ChevronRight, Menu, X, LayoutGrid } from 'lucide-react';

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
        className="w-full bg-white/80 text-gray-700 rounded-[20px] py-2 px-4 flex items-center justify-between text-[13px] font-medium hover:bg-white transition-colors shadow-sm"
      >
        <span className="truncate">{selected.username}</span>
        <ChevronDown size={13} className={`text-gray-400 transition-transform shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 w-full mt-1.5 bg-white border border-gray-100 rounded-[16px] shadow-lg z-50 overflow-hidden py-1">
            {CLIENTS.map(c => (
              <button key={c.id} onClick={() => { setSelected(c); setIsOpen(false); }}
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

function SubNav({ onNav }: { onNav?: () => void }) {
  const pathname = usePathname();
  const links = [
    { name: 'Overview',    href: '/dashboard' },
    { name: 'Audit',       href: '/dashboard/audit' },
    { name: 'Competitors', href: '/dashboard/competitors' },
    { name: 'Ideas',       href: '/dashboard/ideas' },
  ];
  return (
    <div className="flex bg-gray-100 p-1 rounded-full text-[13px] font-medium gap-0.5 overflow-x-auto no-scrollbar" style={{ scrollbarWidth: 'none' }}>
      {links.map(l => {
        const isActive = pathname === l.href;
        return (
          <Link key={l.name} href={l.href} onClick={onNav}
            className={`px-4 py-1.5 rounded-full transition-all whitespace-nowrap flex-shrink-0 ${isActive ? 'bg-white shadow-sm text-gray-800 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
          >{l.name}</Link>
        );
      })}
    </div>
  );
}

function AvatarCircle({ name, size = 28 }: { name: string; size?: number }) {
  const colors = ["#ef4444", "#8b5cf6", "#3b82f6", "#22c55e", "#f59e0b", "#ec4899"];
  const color = colors[(name || "U").charCodeAt(0) % colors.length];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
      {(name || "U")[0].toUpperCase()}
    </div>
  );
}

// ─── Main Layout ──────────────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { currentUser } = useData();
  const [showUserMenu, setShowUserMenu]   = useState(false);
  const [showSideDrawer, setShowSideDrawer] = useState(false);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white md:p-8" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── CSS for no-scrollbar ── */}
      <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; }` }} />

      {/* BEGIN: MainContainer */}
      <div className="bg-[#f2f2f2] w-full max-w-[1600px] h-full md:rounded-[32px] shadow-2xl flex overflow-hidden relative text-[#2b2b2b] text-[14px]">

        {/* BEGIN: LeftSidebar — hidden on mobile */}
        <aside className="hidden md:flex w-[200px] flex-col justify-between p-6 pl-8">
          <div className="space-y-4 pt-4 flex-1 flex flex-col h-full overflow-hidden">
            <nav className="space-y-2.5 mt-2 shrink-0 flex flex-col items-start">
              <Link href="/" className="bg-[#2b2b2b] text-white rounded-[20px] py-2 px-5 flex items-center gap-2 text-[13px] font-medium hover:bg-black transition-colors shadow-sm w-full">
                <ArrowLeft size={14} className="text-gray-300" /> Back to Chat
              </Link>
            </nav>
            <div className="space-y-1 mt-6 flex-1 overflow-y-auto pr-1">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1 mb-2">Client</h4>
              <AccountDropdown />
            </div>
          </div>

          {/* User Card */}
          <div className="pb-4 shrink-0 mt-4 border-t border-gray-100 pt-4 relative">
            <div onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 w-full p-2 hover:bg-white rounded-xl cursor-pointer transition-colors"
            >
              <AvatarCircle name={currentUser?.name || "User"} size={28} />
              <div className="flex-1 min-w-0">
                <h4 className="text-[11px] font-bold text-gray-800 truncate leading-tight">{currentUser?.name || "User"}</h4>
                <p className="text-[9px] text-gray-500 truncate">{currentUser?.role || "Team Member"}</p>
              </div>
              <Settings size={12} className="text-gray-400" />
            </div>
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute bottom-full left-0 mb-2 w-full bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden py-1">
                  <button onClick={() => setShowUserMenu(false)} className="w-full text-left px-4 py-2.5 text-xs flex items-center gap-2 hover:bg-gray-50 text-gray-700 font-medium">
                    <Settings size={12} className="text-gray-500" /> Settings
                  </button>
                  <button onClick={() => { localStorage.removeItem('mas_ai_authenticated_user'); window.location.href = '/'; }}
                    className="w-full text-left px-4 py-2.5 text-xs flex items-center gap-2 hover:bg-red-50 hover:text-red-600 text-red-500 font-medium">
                    <LogOut size={12} /> Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </aside>
        {/* END: LeftSidebar */}

        {/* BEGIN: Main Dashboard Area */}
        <main className="flex-1 bg-[#fbfbfb] md:my-4 md:mr-4 md:rounded-[24px] shadow-sm flex flex-col relative overflow-hidden">

          {/* ── Desktop Top Bar ── */}
          <div className="hidden md:flex absolute top-0 w-full justify-between items-center py-4 px-8 bg-gradient-to-b from-[#fbfbfb] to-transparent z-10">
            <div className="flex items-center gap-1.5 text-[13px]">
              <span className="text-gray-700 font-medium">MAS AI Studio</span>
              <ChevronRight size={12} className="text-gray-300 mx-0.5" />
              <span className="text-gray-700 font-semibold">Dashboard</span>
            </div>
            <SubNav />
          </div>

          {/* ── Mobile Top Bar ── */}
          <div className="md:hidden flex items-center justify-between px-4 pt-12 pb-3 bg-gradient-to-b from-[#fbfbfb] via-[#fbfbfb]/90 to-transparent z-10">
            <button
              onClick={() => setShowSideDrawer(true)}
              className="w-9 h-9 flex items-center justify-center rounded-2xl bg-white border border-gray-100 shadow-sm active:scale-95 transition-transform"
            ><Menu size={17} className="text-gray-600" /></button>
            <span className="text-[13px] font-bold text-gray-800">Dashboard</span>
            <Link href="/" className="w-9 h-9 flex items-center justify-center rounded-2xl bg-white border border-gray-100 shadow-sm active:scale-95 transition-transform">
              <ArrowLeft size={16} className="text-gray-600" />
            </Link>
          </div>

          {/* ── Mobile SubNav (scrollable pill bar) ── */}
          <div className="md:hidden px-4 pb-3">
            <SubNav />
          </div>

          <div className="flex-1 overflow-y-auto md:pt-16" style={{ overscrollBehavior: 'contain' }}>
            {children}
          </div>
        </main>
        {/* END: Main Dashboard Area */}

        {/* Floating Logo — desktop only */}
        <div className="hidden md:flex absolute bottom-8 right-8 items-end z-20">
          <img alt="Masaa Logo" className="w-20 object-contain drop-shadow-xl" src="/masmas.png" />
        </div>

        {/* ── Mobile Side Drawer ── */}
        {showSideDrawer && (
          <div className="md:hidden fixed inset-0 z-[60] flex" onPointerDown={() => setShowSideDrawer(false)}>
            <div className="absolute inset-0 bg-black/30" style={{ animation: 'backdrop-in 0.2s ease both' }} />
            <div
              className="relative w-[72vw] max-w-[280px] h-full bg-[#f2f2f2] flex flex-col shadow-2xl"
              style={{ animation: 'drawer-left 0.28s cubic-bezier(0.16,1,0.3,1) both' }}
              onPointerDown={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-gray-100">
                <span className="font-black text-[17px] text-gray-800">Menu</span>
                <button onClick={() => setShowSideDrawer(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-100">
                  <X size={14} className="text-gray-500" />
                </button>
              </div>

              <div className="px-4 pt-4 space-y-2">
                <Link href="/" onClick={() => setShowSideDrawer(false)}
                  className="bg-[#2b2b2b] text-white rounded-[18px] py-3 px-5 flex items-center gap-2 text-[13px] font-medium w-full active:scale-95 transition-transform"
                ><ArrowLeft size={14} className="text-gray-300" /> Back to Chat</Link>
              </div>

              <div className="px-4 mt-6 space-y-1">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1 mb-2">Client</h4>
                <AccountDropdown />
              </div>

              <div className="flex-1" />

              <div className="px-4 pb-8 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-3 p-2 rounded-xl bg-white/60">
                  <AvatarCircle name={currentUser?.name || "U"} size={32} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold text-gray-800 truncate">{currentUser?.name}</div>
                    <div className="text-[10px] text-gray-500 truncate">{currentUser?.role}</div>
                  </div>
                  <button onClick={() => { localStorage.removeItem('mas_ai_authenticated_user'); window.location.href = '/'; }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                  ><LogOut size={13} /></button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
      {/* END: MainContainer */}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes drawer-left {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
        @keyframes backdrop-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}} />
    </div>
  );
}
