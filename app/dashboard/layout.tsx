'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function AccountDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const accounts = [
    { name: "Rasayel Podcast", icon: "fa-solid fa-podcast", color: "text-purple-500" },
    { name: "TikTok", icon: "fa-brands fa-tiktok", color: "text-black" },
    { name: "YouTube", icon: "fa-brands fa-youtube", color: "text-red-500" },
    { name: "Instagram", icon: "fa-brands fa-instagram", color: "text-pink-500" },
    { name: "Facebook", icon: "fa-brands fa-facebook", color: "text-blue-500" },
  ];
  const [selected, setSelected] = useState(accounts[0]);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-200 text-gray-700 text-xs flex items-center justify-between p-2.5 shadow-sm rounded-full px-4 hover:border-gray-300 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <i className={`${selected.icon} ${selected.color} w-3 text-center`}></i>
          <span className="font-semibold truncate">{selected.name}</span>
        </div>
        <i className={`fa-solid fa-chevron-down text-[10px] text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full left-0 w-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden py-1">
            {accounts.map(acc => (
              <button 
                key={acc.name}
                onClick={() => { setSelected(acc); setIsOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-[13px] flex items-center gap-3 hover:bg-gray-50 transition-colors ${selected.name === acc.name ? 'bg-gray-50 text-gray-900 font-bold' : 'text-gray-600 font-medium'}`}
              >
                <i className={`${acc.icon} ${acc.color} w-4 text-center text-[14px]`}></i>
                {acc.name}
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-full bg-white flex items-center justify-center p-8" style={{
      fontFamily: "'Inter', sans-serif"
    }}>
      
      {/*  BEGIN: MainContainer  */}
      <div className="bg-[#f2f2f2] w-full max-w-[1600px] h-full rounded-[32px] shadow-2xl flex overflow-hidden relative text-[#2b2b2b] text-[14px]">
        
        {/*  BEGIN: LeftSidebar  */}
        <aside className="w-[200px] flex flex-col justify-between p-6 pl-8">
          <div className="space-y-4 pt-4 flex-1 flex flex-col h-full overflow-hidden">
            <nav className="space-y-2 shrink-0">
              <Link href="/" className="flex items-center gap-3 px-4 py-2.5 text-[#2b2b2b] font-medium bg-white rounded-full transition-all shadow-sm border border-gray-100">
                <i className="fa-solid fa-arrow-left text-[#ef4444]"></i>
                Back
              </Link>
            </nav>
            <div className="space-y-6 mt-8 flex-1 overflow-y-auto pr-2">
              {/*  Account Dropdown  */}
              <div>
                <h4 className="text-xs font-semibold text-gray-800 mb-3 uppercase tracking-wider">Account</h4>
                <AccountDropdown />
              </div>
              
              {/*  Platforms  */}
              <div>
                <h4 className="text-xs font-semibold text-gray-800 mb-3 mt-6 uppercase tracking-wider">Platforms</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-white cursor-pointer transition-colors text-xs font-medium shadow-sm border border-gray-100 text-gray-900 rounded-full bg-white/60">
                    <i className="fa-brands fa-tiktok w-4 text-center"></i> TikTok
                  </li>
                  <li className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg cursor-pointer transition-colors text-xs font-medium">
                    <i className="fa-brands fa-youtube w-4 text-center text-red-500"></i> YouTube
                  </li>
                  <li className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg cursor-pointer transition-colors text-xs font-medium">
                    <i className="fa-brands fa-instagram w-4 text-center text-pink-600"></i> Instagram
                  </li>
                  <li className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg cursor-pointer transition-colors text-xs font-medium">
                    <i className="fa-brands fa-facebook w-4 text-center text-blue-600"></i> Facebook
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pb-4 shrink-0 mt-4">
            <button className="w-full bg-[#ef4444] text-white rounded-full py-2 px-4 flex items-center justify-center gap-2 text-xs font-medium hover:bg-[#dc2626] transition-colors shadow-sm">
              <i className="fa-solid fa-user-shield"></i>
              Team Login
            </button>
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
