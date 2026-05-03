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
    <div className="fixed inset-0 z-[9999] bg-[var(--bg-base)] flex items-center justify-center overflow-hidden font-sans">
      {/* Background Decor */}
      <div
        aria-hidden
        style={{
          position: "absolute", top: -100, left: -100, width: 640, height: 640,
          background: "radial-gradient(ellipse at 35% 35%, rgba(239,68,68,0.18) 0%, rgba(139,92,246,0.12) 42%, transparent 68%)",
          filter: "blur(56px)", pointerEvents: "none", zIndex: 0,
        }}
      />
      
      <div className="max-w-md w-full px-6 flex flex-col items-center animate-in fade-in zoom-in-95 duration-700 z-10">
        <div className="mb-10 relative">
          <Image 
            src={MasLogo} 
            alt="Mas AI Studio" 
            width={240} 
            height={80} 
            className="relative dynamic-logo opacity-90"
            priority
          />
        </div>

        <div className="w-full bg-[var(--glass-bg)] backdrop-blur-2xl rounded-3xl border border-[var(--glass-border)] p-8 shadow-[var(--glass-shadow)] relative overflow-hidden">
          
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[var(--glass-elevated)] border border-[var(--glass-elevated-border)] flex items-center justify-center mb-4">
              <Users size={20} className="text-[var(--text-primary)]" />
            </div>
            <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2 tracking-tight">Team Login</h1>
            <p className="text-[12px] text-[var(--text-muted)] leading-relaxed max-w-[240px]">
              Secure access to Mas AI Studio. Authorized usage only.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                <Mail size={16} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Email Address"
                className={`w-full h-12 bg-[var(--input-bg)] rounded-xl pl-10 pr-4 text-[13px] text-[var(--text-primary)] border transition-all outline-none placeholder:text-[var(--text-faint)] focus:bg-[var(--glass-elevated)] ${
                  error ? 'border-red-500/50 focus:border-red-500' : 'border-[var(--input-border)] focus:border-[var(--text-muted)]'
                }`}
                autoFocus
                required
              />
            </div>

            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                <Key size={16} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Password"
                className={`w-full h-12 bg-[var(--input-bg)] rounded-xl pl-10 pr-4 text-[13px] text-[var(--text-primary)] border transition-all outline-none placeholder:text-[var(--text-faint)] focus:bg-[var(--glass-elevated)] ${
                  error ? 'border-red-500/50 focus:border-red-500' : 'border-[var(--input-border)] focus:border-[var(--text-muted)]'
                }`}
                required
              />
              {error && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[#ef4444] animate-in fade-in slide-in-from-right-1">
                  <AlertCircle size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-tight">Incorrect</span>
                </div>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full h-12 bg-[var(--btn-primary-bg)] text-[#fff] rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] mt-2 shadow-[0_4px_16px_rgba(239,68,68,0.3)]"
            >
              Sign In
              <ArrowRight size={14} />
            </button>
          </form>
        </div>

        {/* Footer Details */}
        <div className="mt-12 flex flex-col items-center gap-6">
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-8 h-8 rounded-full bg-[var(--glass-elevated)] border border-[var(--glass-border)] flex items-center justify-center">
                <Users size={14} className="text-[var(--text-muted)]" />
              </div>
              <span className="text-[10px] text-[var(--text-faint)] font-medium tracking-tight">Mas Ai Team</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-8 h-8 rounded-full bg-[var(--glass-elevated)] border border-[var(--glass-border)] flex items-center justify-center">
                <Cpu size={14} className="text-[var(--text-muted)]" />
              </div>
              <span className="text-[10px] text-[var(--text-faint)] font-medium uppercase tracking-widest leading-none">100% AI Developed</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-8 h-8 rounded-full bg-[var(--glass-elevated)] border border-[var(--glass-border)] flex items-center justify-center">
                <ShieldCheck size={14} className="text-[var(--text-muted)]" />
              </div>
              <span className="text-[10px] text-[var(--text-faint)] font-medium tracking-tight">Session Secure</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5 py-1.5 px-4 rounded-full bg-[var(--glass-elevated)] border border-[var(--glass-border)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-tighter">System Authenticated</span>
          </div>
        </div>
      </div>
    </div>
  );
}
