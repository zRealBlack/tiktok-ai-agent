'use client';

import { useEffect, useState } from "react";
import { useData } from "@/components/DataContext";
import { useRouter } from "next/navigation";
import { TEAM_MEMBERS } from "@/lib/auth";
import { ShieldAlert, Terminal, Database, Server, Cpu, Trash2, KeyRound, Activity, AlertTriangle, Coins } from "lucide-react";
import NeuralGraph from "@/components/NeuralGraph";

export default function DeveloperAdminPage() {
  const { currentUser } = useData();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [usageData, setUsageData] = useState<Record<string, number>>({});
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Fetch usage data when authenticated
    if (isAdminAuthenticated) {
      fetch('/api/admin/usage')
        .then(res => res.json())
        .then(data => {
          if (data.usage) {
            setUsageData(data.usage);
          }
        })
        .catch(console.error);
    }
  }, [isAdminAuthenticated]);

  if (!mounted) {
    return <div className="fixed inset-0 bg-[#0a0a0c] flex items-center justify-center" />;
  }

  if (!isAdminAuthenticated) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#f2f2f2] flex items-center justify-center p-4 font-sans">
        <div className="max-w-[400px] w-full bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-700 p-10 flex flex-col items-center">
          <img src="/masmas.png" alt="Mas AI Studio" className="h-8 object-contain mb-8 opacity-90 drop-shadow-sm" />
          
          <div className="mb-6 text-center">
            <h1 className="text-[20px] font-bold text-gray-800 tracking-tight mb-1">Developer Login</h1>
            <p className="text-[12px] text-gray-500">
              Enter the 6-digit Master PIN.
            </p>
          </div>

          <div className="space-y-6 flex flex-col items-center justify-center w-full">
            <div className="relative w-full max-w-[300px] mx-auto">
              <input
                type="tel"
                value={adminPin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setAdminPin(val);
                  if (error) setError(false);

                  if (val.length === 6) {
                    if (val === '272008') {
                      setIsAdminAuthenticated(true);
                    } else {
                      setError(true);
                      setTimeout(() => setAdminPin(''), 600);
                    }
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                autoFocus
              />
              <div className={`flex justify-between w-full gap-2 ${error ? 'animate-pulse' : ''}`}>
                {[...Array(6)].map((_, i) => {
                  const isFilled = i < adminPin.length;
                  return (
                    <div key={i} className={`w-[40px] h-[40px] rounded-full flex items-center justify-center transition-all duration-300 ${isFilled ? 'bg-gray-50 border-2 border-gray-800' : 'bg-gray-50/30 border border-gray-200'}`}>
                      <div className={`rounded-full transition-all duration-300 ${isFilled ? 'w-2.5 h-2.5 bg-gray-800' : 'w-1 h-1 bg-gray-400'}`} />
                    </div>
                  );
                })}
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-1.5 text-[#ef4444] animate-in fade-in bg-red-50 px-3 py-1.5 rounded-full mt-2">
                <AlertTriangle size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Incorrect PIN</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const cardStyle: React.CSSProperties = {
    background: '#ffffff',
    borderRadius: 32,
    border: '1px solid #f3f4f6', // gray-100
    boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
    padding: '24px',
  };

  return (
    <div className="flex-1 overflow-auto bg-[#f2f2f2] min-h-full pb-20 font-sans">
      <div className="max-w-[1400px] mx-auto w-full p-6 md:p-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-[20px] bg-red-50 flex items-center justify-center border border-red-100 shadow-sm">
                <Terminal size={22} className="text-red-500" />
              </div>
              <h1 className="text-3xl font-black text-gray-800 tracking-tight">System Admin</h1>
            </div>
            <p className="text-gray-500 text-sm font-medium">Developer Command Center. Handle with care.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-sm w-fit">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600">Systems Nominal</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* API Health & Scraping Limits */}
          <div className="lg:col-span-1 space-y-6">
            <div style={cardStyle}>
              <div className="flex items-center gap-3 mb-6">
                <Server size={18} className="text-gray-400" />
                <h3 className="text-lg font-bold text-gray-800 tracking-tight">API & Systems Health</h3>
              </div>
              <div className="space-y-4">
                {/* Apify Status */}
                <div className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[13px] font-bold text-gray-700">Apify Actor Engine</span>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Connected</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-2">
                    <div className="bg-red-500 h-full w-[45%]" />
                  </div>
                  <div className="flex justify-between text-[11px] font-medium text-gray-500">
                    <span>Usage: $2.45 / $5.00</span>
                    <span>1,240 runs</span>
                  </div>
                </div>

                {/* AI Providers Status */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="p-3 rounded-2xl bg-gray-50/50 border border-gray-100">
                    <span className="block text-[10px] text-gray-400 mb-1 font-bold uppercase tracking-widest">Anthropic</span>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[12px] font-bold text-gray-700">Online</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-gray-50/50 border border-gray-100">
                    <span className="block text-[10px] text-gray-400 mb-1 font-bold uppercase tracking-widest">OpenAI</span>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[12px] font-bold text-gray-700">Online</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-gray-50/50 border border-gray-100">
                    <span className="block text-[10px] text-gray-400 mb-1 font-bold uppercase tracking-widest">Gemini</span>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[12px] font-bold text-gray-700">Online</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Memory & Data */}
            <div style={cardStyle}>
              <div className="flex items-center gap-3 mb-6">
                <Database size={18} className="text-gray-400" />
                <h3 className="text-lg font-bold text-gray-800 tracking-tight">Storage & Cache</h3>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/50 mb-3 border border-gray-100">
                <div className="flex items-center gap-3">
                  <Cpu size={16} className="text-gray-400" />
                  <div>
                    <div className="text-[13px] font-bold text-gray-700">Sarie Memory</div>
                    <div className="text-[11px] font-medium text-gray-500">Persistent Client Context</div>
                  </div>
                </div>
                <div className="text-[13px] font-bold text-gray-600 bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">2.4 MB</div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <Activity size={16} className="text-gray-400" />
                  <div>
                    <div className="text-[13px] font-bold text-gray-700">Local Storage</div>
                    <div className="text-[11px] font-medium text-gray-500">IndexedDB & Sessions</div>
                  </div>
                </div>
                <div className="text-[13px] font-bold text-gray-600 bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">14.1 MB</div>
              </div>

              <button 
                onClick={() => {
                  if (confirm("Are you sure you want to clear system caches? This will reload the application.")) {
                    localStorage.removeItem('tiktok_ideas_cache');
                    window.location.reload();
                  }
                }}
                className="w-full mt-5 flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-100 bg-red-50 text-red-600 text-[13px] font-bold hover:bg-red-100 transition-colors cursor-pointer shadow-sm"
              >
                <Trash2 size={16} /> Clear System Caches
              </button>
            </div>
          </div>

          {/* Team Credentials Table */}
          <div className="lg:col-span-2">
            <div style={{ ...cardStyle, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <KeyRound size={20} className="text-gray-800" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 tracking-tight">Team Credentials</h3>
                    <p className="text-[12px] font-medium text-gray-500">System login pairs & API tracking.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-yellow-50 text-yellow-600 border border-yellow-200 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit shadow-sm">
                  <AlertTriangle size={14} /> Do Not Share
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-4">Name</th>
                      <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Email</th>
                      <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Password</th>
                      <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Role</th>
                      <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right pr-4">API Spend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TEAM_MEMBERS.map((member, i) => (
                      <tr key={member.id} className="border-b border-gray-50 last:border-none hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 pl-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-[12px] font-bold text-white shadow-sm shrink-0">
                              {member.name.charAt(0)}
                            </div>
                            <span className="text-[13px] font-bold text-gray-800 whitespace-nowrap">{member.name}</span>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <span className="text-[13px] font-medium text-gray-500">{member.email}</span>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="inline-block px-2.5 py-1 rounded-md bg-gray-50 border border-gray-100 shadow-sm">
                            <span className="text-[13px] font-bold tracking-widest text-gray-700 select-all">{member.password}</span>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full whitespace-nowrap">{member.role}</span>
                        </td>
                        <td className="py-4 pr-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Coins size={14} className="text-emerald-500" />
                            <span className="text-[13px] font-black text-gray-800">
                              ${(usageData[member.id] || 0).toFixed(4)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        
        {/* Sarie Core Intelligence Neural Graph */}
        <NeuralGraph />

      </div>
    </div>
  );
}
