'use client';

import { useEffect, useState } from "react";

interface Generation {
  label: string;
  pct: number;
  color: string;
}

const Bar = ({ gen, delay }: { gen: Generation; delay: number }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div className="flex items-center gap-3">
      <div className="w-20 text-[12px] font-medium shrink-0" style={{ color: 'var(--text-secondary)' }}>
        {gen.label}
      </div>
      <div className="flex-1 h-2 rounded-full glass-elevated overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: mounted ? `${gen.pct}%` : "0%",
            backgroundColor: gen.color,
            transitionDelay: `${delay}ms`,
          }}
        />
      </div>
      <div className="w-10 text-right text-[12px] font-bold shrink-0" style={{ color: 'var(--text-primary)' }}>
        {gen.pct}%
      </div>
    </div>
  );
};

export default function GenerationBars({ generations }: { generations: Generation[] }) {
  return (
    <div className="space-y-3">
      {generations.map((gen, i) => (
        <Bar key={gen.label} gen={gen} delay={i * 120} />
      ))}
    </div>
  );
}
