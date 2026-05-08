'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Lock, ShieldCheck, Cpu, Users, ArrowRight, AlertCircle, Mail } from 'lucide-react';
import { authenticateUser } from '@/lib/auth';

const SESSION_KEY = 'mas_ai_authenticated_user';

let globalAdminVerified = false;

export default function PasswordGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [isTeamAuthenticated, setIsTeamAuthenticated] = useState<boolean | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(globalAdminVerified);
  
  const [loginMode, setLoginMode] = useState<'team' | 'admin'>('team');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [error, setError] = useState(false);
  const [isMounting, setIsMounting] = useState(true);
  const [failCount, setFailCount] = useState(0);
  const [lockUntil, setLockUntil] = useState<number | null>(null);
  const [lockSecondsLeft, setLockSecondsLeft] = useState(0);

  useEffect(() => {
    setIsAdminAuthenticated(globalAdminVerified);
    if (pathname?.startsWith('/developer')) {
      setLoginMode('admin');
    } else {
      setLoginMode('team');
    }
  }, [pathname]);

  // Countdown timer for lockout
  useEffect(() => {
    if (!lockUntil) return;
    const interval = setInterval(() => {
      const secs = Math.ceil((lockUntil - Date.now()) / 1000);
      if (secs <= 0) {
        setLockUntil(null);
        setLockSecondsLeft(0);
        setFailCount(0);
        clearInterval(interval);
      } else {
        setLockSecondsLeft(secs);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [lockUntil]);

  useEffect(() => {
    const authUserStr = localStorage.getItem(SESSION_KEY);
    if (authUserStr) {
      try {
        const user = JSON.parse(authUserStr);
        if (user && user.id) {
          setIsTeamAuthenticated(true);
        } else {
          setIsTeamAuthenticated(false);
        }
      } catch {
        setIsTeamAuthenticated(false);
      }
    } else {
      setIsTeamAuthenticated(false);
    }
    setIsMounting(false);
  }, []);

  const handleTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = authenticateUser(email, password);
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      window.dispatchEvent(new Event("mas_user_login"));
      setIsTeamAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  const handleAdminPinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (lockUntil && Date.now() < lockUntil) return; // locked out
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setAdminPin(val);
    if (error) setError(false);

    if (val.length === 6) {
      if (val === '272008') {
        globalAdminVerified = true;
        setIsAdminAuthenticated(true);
        setFailCount(0);
        setLockUntil(null);
        router.push('/developer');
      } else {
        const newFail = failCount + 1;
        setFailCount(newFail);
        setError(true);
        setTimeout(() => setAdminPin(''), 600);
        // Lockout tiers: 3 fails → 30s, 5 fails → 60s, 7+ fails → 120s
        if (newFail >= 3) {
          const waitMs = newFail >= 7 ? 120000 : newFail >= 5 ? 60000 : 30000;
          const until = Date.now() + waitMs;
          setLockUntil(until);
          setLockSecondsLeft(Math.ceil(waitMs / 1000));
        }
      }
    }
  };

  if (isMounting || isTeamAuthenticated === null) {
    return <div className="fixed inset-0 bg-[#0a0a0c] flex items-center justify-center" />;
  }

  const isDeveloperRoute = pathname?.startsWith('/developer');

  if (isDeveloperRoute && isAdminAuthenticated) {
    return <>{children}</>;
  }

  if (!isDeveloperRoute && isTeamAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-[#f2f2f2] flex items-center justify-center p-4 font-sans">
      <div className="max-w-[850px] w-full bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col md:flex-row border border-gray-100 animate-in fade-in zoom-in-95 duration-700">
        
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

        <div className="flex-1 p-10 md:p-14 flex flex-col justify-center relative">
          <div className="absolute top-6 right-8">
            <div className="flex items-center gap-2 py-1.5 px-3 rounded-full bg-emerald-50 border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">System Online</span>
            </div>
          </div>

          <div className="mb-10">
            <h1 className="text-[24px] font-bold text-gray-800 tracking-tight mb-2">
              {loginMode === 'team' ? 'Team Login' : 'Developer Login'}
            </h1>
            <p className="text-[13px] text-gray-500">
              {loginMode === 'team' 
                ? 'Enter your email and password to access your workspace.' 
                : 'Enter your 6-digit Master PIN.'}
            </p>
          </div>

          <form onSubmit={loginMode === 'team' ? handleTeamSubmit : (e) => e.preventDefault()} className="space-y-6 w-full">
            {loginMode === 'team' ? (
              <>
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
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Lock size={18} />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); if (error) setError(false); }}
                      placeholder="Enter your password"
                      className={`w-full h-14 bg-[#fbfbfb] rounded-[24px] pl-12 pr-4 text-[14px] text-gray-800 border transition-all outline-none placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-100 ${error ? 'border-red-500/50 text-red-500' : 'border-gray-100'}`}
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
              </>
            ) : (
              <div className="space-y-6 flex flex-col items-center justify-center mt-2 pb-4">
                <div className="relative w-full max-w-[340px] mx-auto mt-4">
                  <input
                    type="tel"
                    value={adminPin}
                    onChange={handleAdminPinChange}
                    disabled={!!(lockUntil && Date.now() < lockUntil)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10 disabled:cursor-not-allowed"
                    autoFocus
                  />
                  <div className={`flex justify-between w-full gap-2 ${error ? 'animate-pulse' : ''}`}>
                    {[...Array(6)].map((_, i) => {
                      const isFilled = i < adminPin.length;
                      return (
                        <div key={i} className={`w-[46px] h-[46px] rounded-full flex items-center justify-center transition-all duration-300 ${isFilled ? 'bg-gray-50 border-2 border-gray-800' : 'bg-gray-50/30 border border-gray-200'}`}>
                          <div className={`rounded-full transition-all duration-300 ${isFilled ? 'w-2.5 h-2.5 bg-gray-800' : 'w-1.5 h-1.5 bg-gray-400'}`} />
                        </div>
                      );
                    })}
                  </div>
                </div>
                {lockUntil && lockSecondsLeft > 0 ? (
                  <div className="flex items-center gap-1.5 text-orange-500 bg-orange-50 px-4 py-2 rounded-full mt-2">
                    <AlertCircle size={14} />
                    <span className="text-[11px] font-bold">Too many attempts — wait {lockSecondsLeft}s</span>
                  </div>
                ) : error ? (
                  <div className="flex items-center gap-1.5 text-[#ef4444] animate-in fade-in bg-red-50 px-3 py-1.5 rounded-full mt-2">
                    <AlertCircle size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Incorrect PIN</span>
                  </div>
                ) : null}
              </div>
            )}
            
            {loginMode === 'team' && (
              <button
                type="submit"
                className="w-full h-14 bg-black text-white rounded-[24px] text-[14px] font-bold flex items-center justify-center gap-2 transition-all hover:bg-gray-800 active:scale-[0.98] mt-6 shadow-md"
              >
                Authenticate
                <ArrowRight size={16} />
              </button>
            )}

            <div className="flex justify-center mt-6">
              {loginMode === 'admin' ? (
                isTeamAuthenticated ? (
                  // Already logged in as team → go back to studio
                  <button
                    type="button"
                    onClick={() => router.push('/')}
                    className="text-[12px] font-semibold text-gray-400 hover:text-gray-800 transition-colors"
                  >
                    ← Back to Studio
                  </button>
                ) : (
                  // Not logged in → go back to team login
                  <button
                    type="button"
                    onClick={() => { setLoginMode('team'); setError(false); setAdminPin(''); }}
                    className="text-[12px] font-semibold text-gray-400 hover:text-gray-800 transition-colors"
                  >
                    Back to Team Login
                  </button>
                )
              ) : (
                <button
                  type="button"
                  onClick={() => { setLoginMode('admin'); setError(false); setAdminPin(''); }}
                  className="text-[12px] font-semibold text-gray-400 hover:text-gray-800 transition-colors"
                >
                  Login in to admin panel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
