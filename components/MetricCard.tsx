'use client';

import { useEffect, useRef, useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: number | string;
  change?: number;
  changeSuffix?: string;
  prefix?: string;
  suffix?: string;
  format?: "number" | "decimal" | "raw";
  icon?: React.ReactNode;
  highlight?: boolean;
}

function formatNum(n: number, fmt: "number" | "decimal" | "raw" = "number") {
  if (fmt === "decimal") return n.toFixed(1);
  if (fmt === "raw") return String(n);
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

export default function MetricCard({
  label, value, change, changeSuffix = "%", prefix = "", suffix = "",
  format = "number", icon, highlight,
}: MetricCardProps) {
  const [displayed, setDisplayed] = useState(0);
  const animRef = useRef<number | undefined>(undefined);
  const numericValue = typeof value === "number" ? value : parseFloat(value as string) || 0;

  useEffect(() => {
    const duration = 900;
    const start = performance.now();
    const animate = (now: number) => {
      const pct = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - pct, 3);
      setDisplayed(Math.round(numericValue * eased));
      if (pct < 1) animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [numericValue]);

  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div
      className={`glass-panel rounded-2xl p-5 transition-all duration-200 hover:scale-[1.015] hover:-translate-y-0.5 ${highlight ? "ring-1 ring-inset" : ""}`}
      style={highlight ? { '--tw-ring-color': 'var(--glass-border)' } as React.CSSProperties : undefined}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
        {icon && <div style={{ color: 'var(--text-faint)' }}>{icon}</div>}
      </div>

      <div className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
        {prefix}
        {format === "decimal" ? numericValue.toFixed(1) : format === "raw" ? value : formatNum(displayed, format)}
        {suffix}
      </div>

      {change !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-[12px] font-semibold ${
          isPositive ? "text-emerald-500" : isNegative ? "text-red-500" : ""
        }`} style={!isPositive && !isNegative ? { color: 'var(--text-muted)' } : undefined}>
          {isPositive ? <TrendingUp size={13} /> : isNegative ? <TrendingDown size={13} /> : <Minus size={13} />}
          {isPositive ? "+" : ""}{change}{changeSuffix} this week
        </div>
      )}
    </div>
  );
}
