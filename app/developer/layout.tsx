'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, ChevronRight, ShieldAlert } from 'lucide-react';

function SubNav() {
  const pathname = usePathname();
  const links = [
    { name: 'Overview',     href: '/developer' },
    { name: 'Neural Graph', href: '/developer/neural-graph' },
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

export default function DeveloperLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="h-screen w-full bg-white flex items-center justify-center p-8" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="bg-[#f2f2f2] w-full max-w-[1600px] h-full rounded-[32px] shadow-2xl flex overflow-hidden relative text-[#2b2b2b] text-[14px]">

        {/* LEFT SIDEBAR */}
        <aside className="w-[200px] flex flex-col justify-between p-6 pl-8">
          <div className="space-y-4 pt-4 flex-1 flex flex-col h-full overflow-hidden">
            <nav className="space-y-2.5 mt-2 shrink-0 flex flex-col items-start">
              <Link href="/" className="bg-[#2b2b2b] text-white rounded-[20px] py-2 px-5 flex items-center gap-2 text-[13px] font-medium hover:bg-black transition-colors shadow-sm w-full">
                <ArrowLeft size={14} className="text-gray-300" />
                Back
              </Link>
            </nav>

            <div className="space-y-1 mt-6 flex-1 overflow-y-auto pr-1">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1 mb-2">Dev Tools</h4>
              <div className="space-y-1">
                {[
                  { label: 'Overview',     href: '/developer' },
                  { label: 'Neural Graph', href: '/developer/neural-graph' },
                ].map(l => (
                  <Link key={l.href} href={l.href} className="bg-white/80 text-gray-700 rounded-[20px] py-2 px-5 flex items-center gap-2 text-[13px] font-medium hover:bg-white transition-colors shadow-sm w-full">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Admin indicator — no user card needed, access is PIN-gated */}
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

        {/* MAIN AREA */}
        <main className="flex-1 bg-[#fbfbfb] my-4 mr-4 rounded-[24px] shadow-sm flex flex-col relative overflow-hidden">
          {/* Top Bar */}
          <div className="absolute top-0 w-full flex justify-between items-center py-4 px-8 bg-gradient-to-b from-[#fbfbfb] to-transparent z-10">
            <div className="flex items-center gap-1.5 text-[13px]">
              <span className="text-gray-700 font-medium">MAS AI Studio</span>
              <ChevronRight size={12} className="text-gray-300 mx-0.5" />
              <span className="text-gray-700 font-semibold">Developer</span>
            </div>
            <SubNav />
          </div>
          <div className="flex-1 overflow-y-auto pt-16">
            {children}
          </div>
        </main>

        {/* Floating Logo */}
        <div className="absolute bottom-8 right-8 flex items-end z-20">
          <img alt="Masaa Logo" className="w-20 object-contain drop-shadow-xl" src="/masmas.png" />
        </div>

      </div>
    </div>
  );
}
