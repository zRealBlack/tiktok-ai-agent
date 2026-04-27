'use client';

import { useState } from "react";
import { Search } from "lucide-react";

const TABS = ["Today", "This Week", "This Month", "Reports"];

export default function TopBar() {
  const [active, setActive] = useState(2); // "This Month" active by default

  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 30,
      display: "flex", alignItems: "center",
      padding: "16px 28px 0",
      gap: 20,
      pointerEvents: "none", // let clicks pass through the empty space
    }}>
      {/* Pill tabs — center */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", pointerEvents: "auto" }}>
        <div style={{
          display: "flex", gap: 4,
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          borderRadius: 100, padding: 4,
          backdropFilter: "blur(16px)",
          boxShadow: "var(--glass-shadow)",
        }}>
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setActive(i)}
              style={{
                padding: "8px 20px", borderRadius: 100, border: "none",
                cursor: "pointer", fontSize: 13, fontWeight: 600,
                transition: "all 0.18s",
                background: active === i ? "var(--btn-primary-bg)" : "transparent",
                color: active === i ? "#fff" : "var(--text-muted)",
                boxShadow: active === i ? "0 4px 12px rgba(239,68,68,0.3)" : "none",
              }}
            >
              {t}
            </button>
          ))}
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
