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
    const authUserStr = sessionStorage.getItem(SESSION_KEY);
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
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
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
    <div className="fixed inset-0 z-[9999] bg-[#f8f9fa] flex items-center justify-center overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-red-500/5 blur-[120px] pointer-events-none" />
      
      <div className="max-w-md w-full px-6 flex flex-col items-center animate-in fade-in zoom-in-95 duration-700">
        <div className="mb-10 relative">
          <Image 
            src={MasLogo} 
            alt="Mas AI Studio" 
            width={240} 
            height={80} 
            className="relative brightness-0 opacity-90"
            priority
          />
        </div>

        <div className="w-full bg-white rounded-3xl border border-zinc-200 p-8 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-zinc-100" />
          
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-4">
              <Users size={20} className="text-zinc-900" />
            </div>
            <h1 className="text-xl font-bold text-zinc-900 mb-2 tracking-tight">Team Login</h1>
            <p className="text-[12px] text-zinc-500 leading-relaxed max-w-[240px]">
              Secure access to Mas AI Studio. Authorized usage only.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
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
                className={`w-full h-12 bg-zinc-50 rounded-xl pl-10 pr-4 text-[13px] text-zinc-900 border transition-all outline-none placeholder:text-zinc-400 focus:bg-white ${
                  error ? 'border-red-500/50 focus:border-red-500' : 'border-zinc-200 focus:border-zinc-300'
                }`}
                autoFocus
                required
              />
            </div>

            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
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
                className={`w-full h-12 bg-zinc-50 rounded-xl pl-10 pr-4 text-[13px] text-zinc-900 border transition-all outline-none placeholder:text-zinc-400 focus:bg-white ${
                  error ? 'border-red-500/50 focus:border-red-500' : 'border-zinc-200 focus:border-zinc-300'
                }`}
                required
              />
              {error && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-red-600 animate-in fade-in slide-in-from-right-1">
                  <AlertCircle size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-tight">Incorrect</span>
                </div>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full h-12 bg-zinc-900 text-white rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all hover:bg-black active:scale-[0.98] mt-2"
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
              <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                <Users size={14} className="text-zinc-600" />
              </div>
              <span className="text-[10px] text-zinc-500 font-medium tracking-tight">Mas Ai Team</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                <Cpu size={14} className="text-zinc-600" />
              </div>
              <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest leading-none">100% AI Developed</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                <ShieldCheck size={14} className="text-zinc-600" />
              </div>
              <span className="text-[10px] text-zinc-500 font-medium tracking-tight">Session Secure</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5 py-1.5 px-4 rounded-full bg-zinc-100 border border-zinc-200/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">System Authenticated</span>
          </div>
        </div>
      </div>
    </div>
  );
}
