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
    <div className="fixed inset-0 z-[9999] bg-[#f2f2f2] flex items-center justify-center overflow-hidden font-sans">
      <div className="max-w-[400px] w-full px-6 flex flex-col items-center animate-in fade-in zoom-in-95 duration-700 z-10">
        
        {/* The new card */}
        <div className="w-full bg-white rounded-[32px] p-8 pb-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden flex flex-col items-center border border-gray-100">
          
          <img 
            src="/masmas.png" 
            alt="Mas AI Studio" 
            className="h-10 object-contain mb-8 opacity-90 drop-shadow-sm"
          />

          <div className="flex flex-col items-center text-center mb-8">
            <h1 className="text-xl font-bold text-gray-800 mb-2 tracking-tight">Team Login</h1>
            <p className="text-[12px] text-gray-500 leading-relaxed max-w-[240px]">
              Secure access to Mas AI Studio. Authorized usage only.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
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
                className={`w-full h-12 bg-[#fbfbfb] rounded-[20px] pl-11 pr-4 text-[13px] text-gray-800 border transition-all outline-none placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-100 ${
                  error ? 'border-red-500/50' : 'border-gray-100'
                }`}
                autoFocus
                required
              />
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
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
                className={`w-full h-12 bg-[#fbfbfb] rounded-[20px] pl-11 pr-4 text-[13px] text-gray-800 border transition-all outline-none placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-100 ${
                  error ? 'border-red-500/50' : 'border-gray-100'
                }`}
                required
              />
              {error && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[#ef4444] animate-in fade-in slide-in-from-right-1">
                  <AlertCircle size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-tight">Incorrect</span>
                </div>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full h-12 bg-black text-white rounded-[20px] text-[13px] font-bold flex items-center justify-center gap-2 transition-all hover:bg-gray-800 active:scale-[0.98] mt-4 shadow-sm"
            >
              Sign In
              <ArrowRight size={14} />
            </button>
          </form>
        </div>

        {/* Footer Details */}
        <div className="mt-8 flex flex-col items-center gap-5">
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                <Users size={14} className="text-gray-400" />
              </div>
              <span className="text-[10px] text-gray-500 font-medium tracking-tight">Mas Ai Team</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                <Cpu size={14} className="text-gray-400" />
              </div>
              <span className="text-[10px] text-gray-500 font-medium tracking-tight">100% AI Developed</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                <ShieldCheck size={14} className="text-gray-400" />
              </div>
              <span className="text-[10px] text-gray-500 font-medium tracking-tight">Session Secure</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5 py-1.5 px-4 rounded-full bg-white border border-gray-100 shadow-sm mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">System Authenticated</span>
          </div>
        </div>
      </div>
    </div>
  );
}
