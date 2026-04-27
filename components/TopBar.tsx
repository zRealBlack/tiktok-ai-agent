'use client';

import { useState } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { useData } from "@/components/DataContext";

export default function TopBar() {
  const { account } = useData();
  const [isOpen, setIsOpen] = useState(false);
  
  const currentAccount = account?.username || "@rasayel_podcast";

  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 30,
      display: "flex", alignItems: "center",
      padding: "16px 28px 0",
      gap: 20,
      pointerEvents: "none", // let clicks pass through the empty space
    }}>
      {/* Account Dropdown — center */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", pointerEvents: "auto" }}>
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              borderRadius: 100, padding: "6px 18px 6px 8px",
              backdropFilter: "blur(16px)",
              boxShadow: "var(--glass-shadow)",
              cursor: "pointer", fontSize: 13, fontWeight: 600,
              color: "var(--text-primary)",
              transition: "all 0.18s",
            }}
          >
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--btn-primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', flexShrink: 0 }}>R</div>
            {currentAccount}
            <ChevronDown size={14} color="var(--text-muted)" style={{ marginLeft: 4, transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
          </button>
          
          {isOpen && (
            <div style={{
              position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: 8,
              background: "var(--glass-panel-bg)",
              border: "1px solid var(--glass-border)",
              borderRadius: 16, padding: 6,
              backdropFilter: "blur(24px)",
              boxShadow: "var(--glass-shadow)",
              minWidth: 220, zIndex: 50,
            }}>
              <div style={{ padding: "8px 12px", fontSize: 10, fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 1 }}>Switch Account</div>
              <button 
                onClick={() => setIsOpen(false)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 12px", borderRadius: 10, border: "none",
                  background: "rgba(255,255,255,0.05)", cursor: "pointer",
                  color: "var(--text-primary)", fontSize: 13, fontWeight: 600,
                  textAlign: "left", transition: "background 0.15s"
                }}
              >
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--btn-primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', flexShrink: 0 }}>R</div>
                <div style={{ flex: 1 }}>{currentAccount}</div>
                <Check size={14} color="var(--btn-primary-bg)" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search pill — right */}
      <div style={{ pointerEvents: "auto" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          borderRadius: 100, padding: "9px 18px",
          backdropFilter: "blur(16px)",
          boxShadow: "var(--glass-shadow)",
          cursor: "text",
        }}>
          <Search size={14} color="var(--text-muted)" />
          <span style={{ fontSize: 13, color: "var(--text-faint)", userSelect: "none" }}>Search...</span>
          <kbd style={{
            fontSize: 10, color: "var(--text-faint)",
            background: "var(--glass-elevated)",
            border: "1px solid var(--glass-elevated-border)",
            borderRadius: 6, padding: "2px 6px",
            fontFamily: "inherit",
          }}>⌘K</kbd>
        </div>
      </div>
    </div>
  );
}
