'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light' | 'neon' | 'terminal' | 'minimal';

const THEME_HTML_CLASSES: Record<Theme, string[]> = {
  dark:     ['dark'],
  light:    [],
  neon:     ['dark', 'theme-neon'],
  terminal: ['dark', 'theme-terminal'],
  minimal:  ['theme-minimal'],
};

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}>({ theme: 'dark', setTheme: () => {}, toggle: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

function applyTheme(theme: Theme) {
  const el = document.documentElement;
  el.classList.remove('dark', 'theme-neon', 'theme-terminal', 'theme-minimal');
  THEME_HTML_CLASSES[theme].forEach(c => el.classList.add(c));
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    const saved = (localStorage.getItem('theme') as Theme) || 'dark';
    setThemeState(saved);
    applyTheme(saved);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('theme', t);
    applyTheme(t);
  };

  // Legacy toggle: dark ↔ light
  const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
