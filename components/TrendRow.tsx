import { Hash, Music, Film } from "lucide-react";

interface Trend {
  rank: number;
  name: string;
  type: "format" | "sound" | "hook";
  views: string;
}

const cfg = {
  format: { label: "Format", icon: Film },
  sound:  { label: "Sound",  icon: Music },
  hook:   { label: "Hook",   icon: Hash },
};

export default function TrendRow({ trend }: { trend: Trend }) {
  const { label, icon: Icon } = cfg[trend.type] || cfg.format;
  return (
    <div className="flex items-center gap-4 py-2.5 border-b last:border-0 transition-colors"
      style={{ borderColor: 'var(--glass-elevated-border)' }}>
      <div className="w-6 h-6 rounded-full glass-elevated flex items-center justify-center text-[11px] font-bold shrink-0"
        style={{ color: 'var(--text-muted)' }}>
        {trend.rank}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{trend.name}</div>
      </div>
      <span className="flex items-center gap-1 glass-elevated px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0"
        style={{ color: 'var(--text-muted)' }}>
        <Icon size={9} /> {label}
      </span>
      <div className="text-[12px] font-semibold shrink-0 min-w-[48px] text-right" style={{ color: 'var(--text-muted)' }}>
        {trend.views}
      </div>
    </div>
  );
}
