'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, ChevronRight, ShieldAlert, Menu, X } from 'lucide-react';

const DEV_LINKS = [
  { name: 'Overview',     href: '/developer' },
  { name: 'Neural Graph', href: '/developer/neural-graph' },
];

function SubNav({ onNav }: { onNav?: () => void }) {
  const pathname = usePathname();
  const links = DEV_LINKS;
  return (
    <div className="flex bg-gray-100 p-1 rounded-full text-[13px] font-medium gap-0.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
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

export default function DeveloperLayout({ children }: { children: React.ReactNode }) {
  const [showDrawer, setShowDrawer] = useState(false);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white md:p-8" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="bg-[#f2f2f2] w-full max-w-[1600px] h-full md:rounded-[32px] shadow-2xl flex overflow-hidden relative text-[#2b2b2b] text-[14px]">

        {/* ── Desktop Left Sidebar ── */}
        <aside className="hidden md:flex w-[200px] flex-col justify-between p-6 pl-8">
          <div className="space-y-4 pt-4 flex-1 flex flex-col h-full overflow-hidden">
            <nav className="space-y-2.5 mt-2 shrink-0 flex flex-col items-start">
              <Link href="/" className="bg-[#2b2b2b] text-white rounded-[20px] py-2 px-5 flex items-center gap-2 text-[13px] font-medium hover:bg-black transition-colors shadow-sm w-full">
                <ArrowLeft size={14} className="text-gray-300" /> Back
              </Link>
            </nav>
            <div className="space-y-1 mt-6 flex-1 overflow-y-auto pr-1">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1 mb-2">Dev Tools</h4>
              <div className="space-y-1">
                {[
                  { label: 'Overview',     href: '/developer' },
                  { label: 'Neural Graph', href: '/developer/neural-graph' },
                ].map(l => (
                  <Link key={l.href} href={l.href}
                    className="bg-white/80 text-gray-700 rounded-[20px] py-2 px-5 flex items-center gap-2 text-[13px] font-medium hover:bg-white transition-colors shadow-sm w-full"
                  >{l.label}</Link>
                ))}
              </div>
            </div>
          </div>
          <div className="pb-4 shrink-0 mt-4 border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2 px-2 py-2">
              <div className="w-7 h-7 rounded-full bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                <ShieldAlert size={13} className="text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-gray-700 truncate leading-tight">Admin Access</p>
                <p className="text-[9px] text-gray-400 truncate">PIN authenticated</p>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main Area ── */}
        <main className="flex-1 bg-[#fbfbfb] md:my-4 md:mr-4 md:rounded-[24px] shadow-sm flex flex-col relative overflow-hidden">

          {/* Desktop top bar */}
          <div className="hidden md:flex absolute top-0 w-full justify-between items-center py-4 px-8 bg-gradient-to-b from-[#fbfbfb] to-transparent z-10">
            <div className="flex items-center gap-1.5 text-[13px]">
              <span className="text-gray-700 font-medium">MAS AI Studio</span>
              <ChevronRight size={12} className="text-gray-300 mx-0.5" />
              <span className="text-gray-700 font-semibold">Developer</span>
            </div>
            <SubNav />
          </div>

          {/* Mobile top bar */}
          <div className="md:hidden flex items-center justify-between px-4 pt-12 pb-3 bg-gradient-to-b from-[#fbfbfb] via-[#fbfbfb]/90 to-transparent z-10">
            <button
              onClick={() => setShowDrawer(true)}
              className="w-9 h-9 flex items-center justify-center rounded-2xl bg-white border border-gray-100 shadow-sm active:scale-95 transition-transform"
            ><Menu size={17} className="text-gray-600" /></button>
            <span className="text-[13px] font-bold text-gray-800">Developer</span>
            <Link href="/" className="w-9 h-9 flex items-center justify-center rounded-2xl bg-white border border-gray-100 shadow-sm active:scale-95 transition-transform">
              <ArrowLeft size={16} className="text-gray-600" />
            </Link>
          </div>

          {/* Mobile SubNav */}
          <div className="md:hidden px-4 pb-3">
            <SubNav />
          </div>

          <div className="flex-1 overflow-y-auto md:pt-16" style={{ overscrollBehavior: 'contain' }}>
            {children}
          </div>
        </main>

        {/* Desktop logo */}
        <div className="hidden md:flex absolute bottom-8 right-8 items-end z-20">
          <img alt="Masaa Logo" className="w-20 object-contain drop-shadow-xl" src="/masmas.png" />
        </div>

        {/* Mobile Drawer */}
        {showDrawer && (
          <div className="md:hidden fixed inset-0 z-[60] flex" onPointerDown={() => setShowDrawer(false)}>
            <div className="absolute inset-0 bg-black/30" style={{ animation: 'backdrop-in 0.2s ease both' }} />
            <div
              className="relative w-[72vw] max-w-[260px] h-full bg-[#f2f2f2] flex flex-col shadow-2xl"
              style={{ animation: 'drawer-left 0.28s cubic-bezier(0.16,1,0.3,1) both' }}
              onPointerDown={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-gray-100">
                <span className="font-black text-[17px] text-gray-800">Dev Tools</span>
                <button onClick={() => setShowDrawer(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-100">
                  <X size={14} className="text-gray-500" />
                </button>
              </div>
              <div className="px-4 pt-4 space-y-2">
                <Link href="/" onClick={() => setShowDrawer(false)}
                  className="bg-[#2b2b2b] text-white rounded-[18px] py-3 px-5 flex items-center gap-2 text-[13px] font-medium w-full"
                ><ArrowLeft size={14} className="text-gray-300" /> Back to Chat</Link>
                {DEV_LINKS.map(l => (
                  <Link key={l.href} href={l.href} onClick={() => setShowDrawer(false)}
                    className="bg-white/80 text-gray-700 rounded-[18px] py-3 px-5 flex items-center gap-2 text-[13px] font-medium hover:bg-white transition-colors w-full"
                  >{l.name}</Link>
                ))}
              </div>
              <div className="flex-1" />
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
