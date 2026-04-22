'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Lock, ShieldCheck, Cpu, Users, ArrowRight, AlertCircle } from 'lucide-react';
import MasLogo from '@/public/MAS-aistudiored.png';

const PASS_KEY = 'MasAi@Yassin';
const SESSION_KEY = 'mas_ai_authenticated';

export default function PasswordGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isMounting, setIsMounting] = useState(true);

  useEffect(() => {
    const auth = sessionStorage.getItem(SESSION_KEY);
    if (auth === 'true') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setIsMounting(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === PASS_KEY) {
      sessionStorage.setItem(SESSION_KEY, 'true');
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
    <div className="fixed inset-0 z-[9999] bg-[#0a0a0c] flex items-center justify-center overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-red-600/10 blur-[120px] pointer-events-none" />
      
      <div className="max-w-md w-full px-6 flex flex-col items-center animate-in fade-in zoom-in-95 duration-700">
        <div className="mb-10 relative">
          <div className="absolute inset-0 bg-red-500/20 blur-[60px] rounded-full scale-150 animate-pulse" />
          <Image 
            src={MasLogo} 
            alt="Mas AI Studio" 
            width={240} 
            height={80} 
            className="relative drop-shadow-2xl"
            priority
          />
        </div>

        <div className="w-full glass-chat rounded-3xl border p-8 shadow-2xl relative overflow-hidden" style={{ borderColor: 'var(--glass-border)' }}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
          
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <Lock size={20} className="text-red-400" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2 tracking-tight">Admin Authentication</h1>
            <p className="text-[12px] text-zinc-400 leading-relaxed max-w-[240px]">
              Secure access to Mas AI Studio. Authorized usage only.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Enter Admin Password"
                className={`w-full h-12 bg-white/5 rounded-xl px-4 text-[13px] text-white border transition-all outline-none placeholder:text-zinc-600 focus:bg-white/[0.08] ${
                  error ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-white/20'
                }`}
                autoFocus
                required
              />
              {error && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-red-500 animate-in fade-in slide-in-from-right-1">
                  <AlertCircle size={14} />
                  <span className="text-[10px] font-bold">WRONG</span>
                </div>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full h-12 bg-white text-black rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all hover:bg-zinc-200 active:scale-[0.98]"
            >
              Unlock Studio
              <ArrowRight size={14} />
            </button>
          </form>
        </div>

        {/* Footer Details */}
        <div className="mt-12 flex flex-col items-center gap-6">
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                <Users size={14} className="text-zinc-400" />
              </div>
              <span className="text-[10px] text-zinc-500 font-medium">Mas Ai Team</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                <Cpu size={14} className="text-zinc-400" />
              </div>
              <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">100% AI Developed</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                <ShieldCheck size={14} className="text-zinc-400" />
              </div>
              <span className="text-[10px] text-zinc-500 font-medium">Session Secure</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 py-1.5 px-4 rounded-full bg-white/5 border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-tighter">System Live</span>
          </div>
        </div>
      </div>
    </div>
  );
}
