'use client';

import { useEffect, useState } from "react";
import { useData } from "@/components/DataContext";
import { useRouter } from "next/navigation";
import { TEAM_MEMBERS } from "@/lib/auth";
import { ShieldAlert, Terminal, Database, Server, Cpu, Trash2, KeyRound, Activity, AlertTriangle } from "lucide-react";

export default function DeveloperAdminPage() {
  const { currentUser } = useData();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Only Yassin Gaml has clearance
    if (currentUser && currentUser.id !== 'yassin') {
      router.push("/");
    }
    setMounted(true);
  }, [currentUser, router]);

  if (!mounted || !currentUser || currentUser.id !== 'yassin') {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-[var(--bg-base)] min-h-[100dvh]">
        <div className="flex flex-col items-center gap-4 text-center">
          <ShieldAlert size={48} className="text-[#ef4444] opacity-50" />
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Restricted Area</h2>
          <p className="text-[var(--text-muted)] text-sm max-w-sm">You do not have clearance to view this page. This event has been logged.</p>
        </div>
      </div>
    );
  }

  const cardStyle: React.CSSProperties = {
    background: 'var(--glass-bg)',
    borderRadius: 24,
    border: '1px solid var(--glass-border)',
    boxShadow: 'var(--glass-shadow)',
    padding: '24px',
  };

  return (
    <div className="flex-1 overflow-auto bg-[var(--bg-base)] min-h-full pb-20">
      <div className="max-w-[1400px] mx-auto w-full p-6 md:p-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#ef4444]/10 flex items-center justify-center border border-[#ef4444]/20">
                <Terminal size={20} className="text-[#ef4444]" />
              </div>
              <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">System Admin</h1>
            </div>
            <p className="text-[var(--text-muted)] text-sm">Developer Command Center. Handle with care.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--glass-elevated)] border border-[var(--glass-border)] shadow-[var(--glass-shadow)] w-fit">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Systems Nominal</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* API Health & Scraping Limits */}
          <div className="lg:col-span-1 space-y-6">
            <div style={cardStyle}>
              <div className="flex items-center gap-3 mb-6">
                <Server size={18} className="text-[var(--text-secondary)]" />
                <h3 className="text-lg font-bold text-[var(--text-primary)]">API & Systems Health</h3>
              </div>
              <div className="space-y-4">
                {/* Apify Status */}
                <div className="p-4 rounded-2xl bg-[var(--glass-elevated)] border border-[var(--glass-border)]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[13px] font-bold text-[var(--text-primary)]">Apify Actor Engine</span>
                    <span className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">Connected</span>
                  </div>
                  <div className="w-full bg-[var(--bg-base)] h-2 rounded-full overflow-hidden mb-2">
                    <div className="bg-[#ef4444] h-full w-[45%]" />
                  </div>
                  <div className="flex justify-between text-[11px] text-[var(--text-muted)]">
                    <span>Usage: $2.45 / $5.00</span>
                    <span>1,240 runs</span>
                  </div>
                </div>

                {/* AI Providers Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-[var(--glass-elevated)] border border-[var(--glass-border)]">
                    <span className="block text-[11px] text-[var(--text-muted)] mb-1 uppercase tracking-wider">Anthropic</span>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[13px] font-bold text-[var(--text-primary)]">Online</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-[var(--glass-elevated)] border border-[var(--glass-border)]">
                    <span className="block text-[11px] text-[var(--text-muted)] mb-1 uppercase tracking-wider">OpenAI</span>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[13px] font-bold text-[var(--text-primary)]">Online</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Memory & Data */}
            <div style={cardStyle}>
              <div className="flex items-center gap-3 mb-6">
                <Database size={18} className="text-[var(--text-secondary)]" />
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Storage & Cache</h3>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--glass-elevated)] mb-3 border border-[var(--glass-border)]">
                <div className="flex items-center gap-3">
                  <Cpu size={16} className="text-[var(--text-muted)]" />
                  <div>
                    <div className="text-[13px] font-bold text-[var(--text-primary)]">Sarie Memory</div>
                    <div className="text-[11px] text-[var(--text-muted)]">Persistent Client Context</div>
                  </div>
                </div>
                <div className="text-[13px] font-mono text-[var(--text-primary)]">2.4 MB</div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--glass-elevated)] border border-[var(--glass-border)]">
                <div className="flex items-center gap-3">
                  <Activity size={16} className="text-[var(--text-muted)]" />
                  <div>
                    <div className="text-[13px] font-bold text-[var(--text-primary)]">Local Storage</div>
                    <div className="text-[11px] text-[var(--text-muted)]">IndexedDB & Sessions</div>
                  </div>
                </div>
                <div className="text-[13px] font-mono text-[var(--text-primary)]">14.1 MB</div>
              </div>

              <button 
                onClick={() => {
                  if (confirm("Are you sure you want to clear system caches? This will reload the application.")) {
                    localStorage.removeItem('tiktok_ideas_cache');
                    window.location.reload();
                  }
                }}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/5 text-[#ef4444] text-[13px] font-bold hover:bg-[#ef4444]/10 transition-colors cursor-pointer"
              >
                <Trash2 size={14} /> Clear System Caches
              </button>
            </div>
          </div>

          {/* Team Credentials Table */}
          <div className="lg:col-span-2">
            <div style={{ ...cardStyle, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <KeyRound size={18} className="text-[#ef4444]" />
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">Team Credentials</h3>
                    <p className="text-[12px] text-[var(--text-muted)]">Highly classified system login pairs.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider w-fit">
                  <AlertTriangle size={14} /> Do Not Share
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-[var(--glass-border)]">
                      <th className="pb-3 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] pl-4">Name</th>
                      <th className="pb-3 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Email</th>
                      <th className="pb-3 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Password</th>
                      <th className="pb-3 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TEAM_MEMBERS.map((member, i) => (
                      <tr key={member.id} className="border-b border-[var(--glass-border)] last:border-none hover:bg-[var(--glass-elevated)] transition-colors">
                        <td className="py-4 pl-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[var(--btn-primary-bg)] flex items-center justify-center text-[11px] font-bold text-[#fff] shadow-[0_2px_8px_rgba(239,68,68,0.3)] shrink-0">
                              {member.name.charAt(0)}
                            </div>
                            <span className="text-[13px] font-bold text-[var(--text-primary)] whitespace-nowrap">{member.name}</span>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <span className="text-[13px] text-[var(--text-secondary)] font-mono">{member.email}</span>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="inline-block px-2 py-1 rounded bg-[var(--bg-base)] border border-[var(--glass-border)]">
                            <span className="text-[13px] text-[var(--text-primary)] font-mono select-all">{member.password}</span>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <span className="text-[11px] text-[var(--text-muted)] font-medium bg-[var(--glass-border)] px-2 py-1 rounded-full whitespace-nowrap">{member.role}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
