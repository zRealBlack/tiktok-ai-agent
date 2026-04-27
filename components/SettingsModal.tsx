'use client';

import { X, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const { theme, setTheme } = useTheme();

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)"
    }}>
      <div style={{
        background: "var(--glass-panel-bg, var(--glass-bg))",
        border: "1px solid var(--glass-border)",
        borderRadius: 24, padding: 32,
        width: "100%", maxWidth: 500,
        boxShadow: "var(--glass-shadow)",
        position: "relative"
      }}>
        <button 
          onClick={onClose}
          style={{
            position: "absolute", top: 20, right: 20,
            background: "transparent", border: "none", cursor: "pointer",
            color: "var(--text-muted)", padding: 4
          }}
        >
          <X size={20} />
        </button>

        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, color: "var(--text-primary)" }}>Settings</h2>

        {/* Tabs - currently just Preferences */}
        <div style={{ display: "flex", gap: 20, borderBottom: "1px solid var(--glass-border)", marginBottom: 24 }}>
          <div style={{ paddingBottom: 12, borderBottom: "2px solid var(--btn-primary-bg)", color: "var(--text-primary)", fontWeight: 700, fontSize: 14 }}>
            Preferences
          </div>
          <div style={{ paddingBottom: 12, color: "var(--text-muted)", fontWeight: 600, fontSize: 14, opacity: 0.5 }}>
            Account
          </div>
        </div>

        {/* Preferences Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>Appearance</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>Select your preferred theme mode.</div>
            
            <div style={{ display: "flex", gap: 12 }}>
              <button 
                onClick={() => setTheme('light')}
                style={{
                  flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                  padding: "16px", borderRadius: 16,
                  background: theme === 'light' ? "var(--glass-elevated)" : "transparent",
                  border: theme === 'light' ? "2px solid var(--btn-primary-bg)" : "2px solid var(--glass-elevated-border)",
                  cursor: "pointer", transition: "all 0.2s"
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#f4f4f5", display: "flex", alignItems: "center", justifyContent: "center", color: "#3f3f46" }}>
                  <Sun size={20} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Light Mode</span>
              </button>

              <button 
                onClick={() => setTheme('dark')}
                style={{
                  flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                  padding: "16px", borderRadius: 16,
                  background: theme === 'dark' ? "var(--glass-elevated)" : "transparent",
                  border: theme === 'dark' ? "2px solid var(--btn-primary-bg)" : "2px solid var(--glass-elevated-border)",
                  cursor: "pointer", transition: "all 0.2s"
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#18181b", display: "flex", alignItems: "center", justifyContent: "center", color: "#ececec" }}>
                  <Moon size={20} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Dark Mode</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
