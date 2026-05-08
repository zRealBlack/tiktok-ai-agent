'use client';

import { useEffect, useState } from "react";
import { TEAM_MEMBERS } from "@/lib/auth";
import { ShieldAlert, Terminal, Database, Server, Cpu, Trash2, KeyRound, Activity, AlertTriangle, Coins, ShieldCheck, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface PermissionSet {
  update_audit:  boolean;
  send_messages: boolean;
  send_email:    boolean;
  update_memory: boolean;
  trigger_sync:  boolean;
}

const PERMISSION_LABELS: { key: keyof PermissionSet; label: string; desc: string }[] = [
  { key: "update_audit",  label: "Update Audit",    desc: "Update video scores, suggestions & issues" },
  { key: "send_messages", label: "Send Messages",   desc: "Send team messages through the chat" },
  { key: "send_email",    label: "Send Email",      desc: "Send emails on behalf of the user" },
  { key: "update_memory", label: "Update Memory",   desc: "Add insights to Sarie's permanent memory" },
  { key: "trigger_sync",  label: "Trigger Sync",    desc: "Start a TikTok data re-sync" },
];

// Only Yassin can change permissions
const CURRENT_USER_ID = typeof window !== "undefined"
  ? (() => { try { return JSON.parse(localStorage.getItem("mas_ai_authenticated_user") || "{}").id; } catch { return null; } })()
  : null;

// ── Components ───────────────────────────────────────────────────────────────

function Toggle({ on, onChange, disabled }: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      onClick={() => !disabled && onChange(!on)}
      disabled={disabled}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${on ? "bg-emerald-500" : "bg-gray-200"} ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${on ? "translate-x-[18px]" : "translate-x-[2px]"}`} />
    </button>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function DeveloperAdminPage() {
  const [mounted, setMounted]         = useState(false);
  const [activeTab, setActiveTab]     = useState<"system" | "permissions">("system");
  const [usageData, setUsageData]     = useState<Record<string, number>>({});
  const [permissions, setPermissions] = useState<Record<string, PermissionSet>>({});
  const [saving, setSaving]           = useState<string | null>(null);
  const [savedFlash, setSavedFlash]   = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    // Get logged-in user
    try {
      const u = JSON.parse(localStorage.getItem("mas_ai_authenticated_user") || "{}");
      setCurrentUserId(u.id ?? null);
    } catch {}
    // Fetch usage data
    fetch('/api/admin/usage').then(r => r.json()).then(d => { if (d.usage) setUsageData(d.usage); }).catch(() => {});
    // Fetch permissions
    fetch('/api/permissions').then(r => r.json()).then(d => { if (d.permissions) setPermissions(d.permissions); }).catch(() => {});
  }, []);

  const isAdmin = currentUserId === "yassin";

  const handleToggle = async (userId: string, key: keyof PermissionSet, value: boolean) => {
    if (!isAdmin) return;
    const updated = { ...permissions[userId], [key]: value };
    setPermissions(p => ({ ...p, [userId]: updated }));
    setSaving(`${userId}:${key}`);
    try {
      await fetch('/api/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requesterId: currentUserId, userId, permissions: updated }),
      });
      setSavedFlash(`${userId}:${key}`);
      setTimeout(() => setSavedFlash(null), 1200);
    } catch {}
    setSaving(null);
  };

  if (!mounted) return <div className="fixed inset-0 bg-[#0a0a0c] flex items-center justify-center" />;

  const cardStyle: React.CSSProperties = {
    background: '#ffffff',
    borderRadius: 32,
    border: '1px solid #f3f4f6',
    boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
    padding: '24px',
  };

  return (
    <div className="flex-1 overflow-auto p-8 flex flex-col gap-8">
      <div className="max-w-[1400px] w-full space-y-8">

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

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
          {([["system", "System"], ["permissions", "Sarie Permissions"]] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-5 py-2 rounded-xl text-[13px] font-bold transition-all ${activeTab === id ? "bg-white shadow-sm text-gray-800" : "text-gray-500 hover:text-gray-700"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── SYSTEM TAB ────────────────────────────────────────────────────── */}
        {activeTab === "system" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* API Health & Scraping Limits */}
            <div className="lg:col-span-1 space-y-6">
              <div style={cardStyle}>
                <div className="flex items-center gap-3 mb-6">
                  <Server size={18} className="text-gray-400" />
                  <h3 className="text-lg font-bold text-gray-800 tracking-tight">API & Systems Health</h3>
                </div>
                <div className="space-y-4">
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
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {[["Anthropic", true], ["OpenAI", true], ["Gemini", true]].map(([name, ok]) => (
                      <div key={name as string} className="p-3 rounded-2xl bg-gray-50/50 border border-gray-100">
                        <span className="block text-[10px] text-gray-400 mb-1 font-bold uppercase tracking-widest">{name as string}</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${ok ? "bg-emerald-500" : "bg-red-500"}`} />
                          <span className="text-[12px] font-bold text-gray-700">{ok ? "Online" : "Offline"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

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
                      <div className="text-[13px] font-bold text-gray-700">KV Database</div>
                      <div className="text-[11px] font-medium text-gray-500">Upstash Redis Sessions</div>
                    </div>
                  </div>
                  <div className="text-[13px] font-bold text-gray-600 bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">Cloud</div>
                </div>
                <button
                  onClick={() => { if (confirm("Clear system caches?")) { localStorage.removeItem('tiktok_ideas_cache'); window.location.reload(); } }}
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
                      {TEAM_MEMBERS.map(member => (
                        <tr key={member.id} className="border-b border-gray-50 last:border-none hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 pl-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-[12px] font-bold text-white shadow-sm shrink-0">{member.name.charAt(0)}</div>
                              <span className="text-[13px] font-bold text-gray-800 whitespace-nowrap">{member.name}</span>
                            </div>
                          </td>
                          <td className="py-4 pr-4"><span className="text-[13px] font-medium text-gray-500">{member.email}</span></td>
                          <td className="py-4 pr-4">
                            <div className="inline-block px-2.5 py-1 rounded-md bg-gray-50 border border-gray-100 shadow-sm">
                              <span className="text-[13px] font-bold tracking-widest text-gray-700 select-all">{member.password}</span>
                            </div>
                          </td>
                          <td className="py-4 pr-4"><span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full whitespace-nowrap">{member.role}</span></td>
                          <td className="py-4 pr-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Coins size={14} className="text-emerald-500" />
                              <span className="text-[13px] font-black text-gray-800">${(usageData[member.id] || 0).toFixed(4)}</span>
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
        )}

        {/* ── PERMISSIONS TAB ───────────────────────────────────────────────── */}
        {activeTab === "permissions" && (
          <div className="space-y-6">
            <div style={cardStyle}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={20} className="text-gray-800" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 tracking-tight">Sarie Dashboard Permissions</h3>
                    <p className="text-[12px] font-medium text-gray-500">
                      Control what Sarie is allowed to do on behalf of each team member.
                    </p>
                  </div>
                </div>
                {!isAdmin && (
                  <div className="flex items-center gap-2 bg-amber-50 text-amber-600 border border-amber-200 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit shadow-sm">
                    <ShieldAlert size={13} /> View Only
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-left pl-2 min-w-[180px]">Team Member</th>
                      {PERMISSION_LABELS.map(p => (
                        <th key={p.key} className="pb-4 text-center px-3">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">{p.label}</div>
                          <div className="text-[9px] text-gray-300 font-normal normal-case mt-0.5 whitespace-nowrap">{p.desc}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TEAM_MEMBERS.map(member => {
                      const perms = permissions[member.id] ?? {} as PermissionSet;
                      return (
                        <tr key={member.id} className="border-b border-gray-50 last:border-none hover:bg-gray-50/30 transition-colors">
                          <td className="py-4 pl-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-[11px] font-bold text-white shrink-0">{member.name.charAt(0)}</div>
                              <div>
                                <div className="text-[13px] font-bold text-gray-800">{member.name}</div>
                                <div className="text-[10px] text-gray-400">{member.role}</div>
                              </div>
                            </div>
                          </td>
                          {PERMISSION_LABELS.map(p => {
                            const val   = !!perms[p.key];
                            const key   = `${member.id}:${p.key}`;
                            const isSav = saving === key;
                            const isSaved = savedFlash === key;
                            return (
                              <td key={p.key} className="py-4 text-center px-3">
                                <div className="flex flex-col items-center gap-1">
                                  {isSav ? (
                                    <Loader2 size={16} className="animate-spin text-gray-300" />
                                  ) : (
                                    <Toggle
                                      on={val}
                                      onChange={v => handleToggle(member.id, p.key, v)}
                                      disabled={!isAdmin}
                                    />
                                  )}
                                  {isSaved && <span className="text-[9px] text-emerald-500 font-bold">Saved</span>}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Legend */}
              <div className="mt-6 pt-5 border-t border-gray-100 flex flex-wrap gap-4 text-[11px] text-gray-400">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> Enabled — Sarie will execute this action when asked</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-200 inline-block" /> Disabled — Sarie will refuse and explain why</span>
                {!isAdmin && <span className="flex items-center gap-1.5 text-amber-400"><ShieldAlert size={11} /> Only Yassin can change permissions</span>}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
