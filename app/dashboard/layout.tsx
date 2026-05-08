'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useData } from "@/components/DataContext";
import { ArrowLeft, ChevronDown, Check, Settings, LogOut } from 'lucide-react';

// ─── Clients ─────────────────────────────────────────────────────────────────
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
        className="w-full bg-white border border-gray-200 text-gray-700 text-xs flex items-center justify-center gap-2 py-2.5 px-4 shadow-sm rounded-full hover:border-gray-300 transition-colors"
      >
        <span className="font-semibold truncate">{selected.username}</span>
        <ChevronDown size={12} className={`text-gray-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 w-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden py-1">
            {CLIENTS.map(c => (
              <button
                key={c.id}
                onClick={() => { setSelected(c); setIsOpen(false); }}
                className={`w-full text-center px-4 py-2.5 text-[12px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors ${selected.id === c.id ? 'bg-gray-50 text-gray-900 font-bold' : 'text-gray-600 font-medium'}`}
              >
                <span className="truncate">{c.username}</span>
                {selected.id === c.id && <Check size={11} className="text-gray-400 shrink-0" />}
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
    <div className="flex bg-gray-100 p-1 rounded-full text-xs font-medium">
      {links.map(l => {
        const isActive = pathname === l.href;
        return (
          <Link key={l.name} href={l.href} className={`px-6 py-2 rounded-full transition-all ${isActive ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>
            {l.name}
          </Link>
        );
      })}
    </div>
  );
}

// ─── Avatar helper (mirrors main page AvatarCircle) ──────────────────────────
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

      {/*  BEGIN: MainContainer  */}
      <div className="bg-[#f2f2f2] w-full max-w-[1600px] h-full rounded-[32px] shadow-2xl flex overflow-hidden relative text-[#2b2b2b] text-[14px]">

        {/*  BEGIN: LeftSidebar  */}
        <aside className="w-[200px] flex flex-col justify-between p-6 pl-8">
          <div className="space-y-4 pt-4 flex-1 flex flex-col h-full overflow-hidden">
            <nav className="space-y-2 shrink-0">
              <Link href="/" className="flex items-center gap-3 px-4 py-2.5 text-[#2b2b2b] font-medium bg-white rounded-full transition-all shadow-sm border border-gray-100 hover:shadow-md">
                <ArrowLeft size={14} className="text-[#ef4444]" />
                Back
              </Link>
            </nav>
            <div className="space-y-6 mt-8 flex-1 overflow-y-auto pr-2">
              {/*  Account Dropdown  */}
              <div>
                <h4 className="text-xs font-semibold text-gray-800 mb-3 uppercase tracking-wider">Client</h4>
                <AccountDropdown />
              </div>
            </div>
          </div>

          {/* User Card — matches main page style */}
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
                <i className="fa-solid fa-gear text-[10px]"></i>
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
        {/*  END: LeftSidebar  */}

        {/*  BEGIN: Main Dashboard Area  */}
        <main className="flex-1 bg-[#fbfbfb] my-4 mr-4 rounded-[24px] shadow-sm flex flex-col relative overflow-hidden border border-gray-100">
          {/*  Top Bar / Sub-navigation  */}
          <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between z-10 bg-white">
            <div className="flex items-center gap-2">
              <span className="text-[#ef4444] font-bold text-sm tracking-wider">MAS</span>
              <span className="text-gray-500 font-medium text-sm">AI Studio Workspace</span>
              <i className="fa-solid fa-chevron-right text-[10px] text-gray-400 mx-2"></i>
              <span className="text-gray-800 font-semibold text-sm">Dashboard</span>
            </div>
            <SubNav />
          </div>

          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
        {/* END: Main Dashboard Area */}

        {/*  Assistant Avatar Floating Widget  */}
        <div className="absolute bottom-8 right-8 flex items-end gap-3 z-20">
          <div className="bg-black text-white text-xs px-4 py-2 rounded-2xl rounded-br-sm shadow-lg mb-4">
            Hi, How can i help<br />you today?
          </div>
          <img alt="Robot Assistant" className="w-16 h-16 object-cover rounded-full drop-shadow-xl border-2 border-white bg-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBC8o0Dh-48odiXykGf9dXZ3HQkqIfgf9DTRu5eek1doIbEYtT3mV9F81Cy0qYDCLwiee969EF8rp7BbSKDfanY00VuM7fdfaI5ep1w21ALHKbPuxkPnI6gSjMFcyH-A_4CAA37vlxHFk2pGPo5LeOezJJbSGhBXzZ8pz6cZQkiCn-j75BUoOxkfoudEM5roWGn3ZNugRg5ryjuqujKC1VbF1_LKy_SrkhUusodJAw_WiJctH9uPZBHfrOrf070sDEU62d6PK_FUA"/>
        </div>

      </div>
      {/*  END: MainContainer  */}

    </div>
  );
}
