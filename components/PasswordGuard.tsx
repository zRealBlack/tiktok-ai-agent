'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Lock, ShieldCheck, Cpu, Users, ArrowRight, AlertCircle, Mail, Key } from 'lucide-react';
import MasLogo from '@/public/MAS-aistudiored.png';
import { authenticateUser, TeamMember } from '@/lib/auth';

const SESSION_KEY = 'mas_ai_authenticated_user';

export default function PasswordGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isMounting, setIsMounting] = useState(true);

  useEffect(() => {
    const authUserStr = localStorage.getItem(SESSION_KEY);
    if (authUserStr) {
      try {
        const user = JSON.parse(authUserStr);
        if (user && user.id) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
    setIsMounting(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = authenticateUser(email, password);
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      // Dispatch an event so other components (like DataContext) can pick up the login immediately
      window.dispatchEvent(new Event("mas_user_login"));
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  if (isMounting || isAuthenticated === null) {
    return <div className="fixed inset-0 bg-[#0a0a0c] flex items-center justify-center" />;
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-[#f2f2f2] flex items-center justify-center p-4 font-sans">
      <div className="max-w-[850px] w-full bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col md:flex-row border border-gray-100 animate-in fade-in zoom-in-95 duration-700">
        
        {/* Left Side: Branding */}
        <div className="md:w-[380px] bg-gray-50/50 p-10 flex flex-col justify-between border-r border-gray-100 hidden md:flex">
          <div>
            <img src="/masmas.png" alt="Mas AI Studio" className="h-9 object-contain mb-8 opacity-90 drop-shadow-sm" />
            <h2 className="text-[22px] font-bold text-gray-800 tracking-tight leading-snug">Welcome Back to<br />MAS AI Studio.</h2>
            <p className="text-[13px] text-gray-500 mt-4 leading-relaxed max-w-[260px]">
              Secure, intelligent workspace for your team. Powered by advanced AI agents.
            </p>
          </div>

          <div className="space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                 <ShieldCheck size={16} className="text-gray-400" />
              </div>
              <span className="text-[12px] text-gray-500 font-semibold tracking-tight">Session Secure</span>
            </div>
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                 <Cpu size={16} className="text-gray-400" />
              </div>
              <span className="text-[12px] text-gray-500 font-semibold tracking-tight">100% AI Developed</span>
            </div>
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                 <Users size={16} className="text-gray-400" />
              </div>
              <span className="text-[12px] text-gray-500 font-semibold tracking-tight">Mas Ai Team</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 p-10 md:p-14 flex flex-col justify-center relative">
          
          <div className="absolute top-6 right-8">
            <div className="flex items-center gap-2 py-1.5 px-3 rounded-full bg-emerald-50 border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">System Online</span>
            </div>
          </div>

          <div className="mb-10">
            <h1 className="text-[24px] font-bold text-gray-800 tracking-tight mb-2">Team Login</h1>
            <p className="text-[13px] text-gray-500">
              Enter your email and 4-digit PIN.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 w-full">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError(false); }}
                  placeholder="e.g. yassin@mas.ai"
                  className={`w-full h-14 bg-[#fbfbfb] rounded-[24px] pl-12 pr-4 text-[14px] text-gray-800 border transition-all outline-none placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-100 ${error ? 'border-red-500/50' : 'border-gray-100'}`}
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Security PIN</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Key size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (error) setError(false); }}
                  placeholder="••••"
                  maxLength={4}
                  className={`w-full h-14 bg-[#fbfbfb] rounded-[24px] pl-12 pr-4 text-[16px] tracking-[0.5em] font-black text-gray-800 border transition-all outline-none placeholder:text-gray-400 placeholder:tracking-normal placeholder:font-normal focus:bg-white focus:ring-2 focus:ring-gray-100 ${error ? 'border-red-500/50 text-red-500' : 'border-gray-100'}`}
                  required
                />
                {error && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[#ef4444] animate-in fade-in slide-in-from-right-1 bg-red-50 px-2 py-1 rounded-full">
                    <AlertCircle size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Incorrect</span>
                  </div>
                )}
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full h-14 bg-black text-white rounded-[24px] text-[14px] font-bold flex items-center justify-center gap-2 transition-all hover:bg-gray-800 active:scale-[0.98] mt-6 shadow-md"
            >
              Authenticate
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
