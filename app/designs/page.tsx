'use client';

const DESIGNS = [
  {
    id: 'hq',
    name: 'HQ Command Center',
    desc: 'Top navigation bar, full-width stats strip, data table layout. Analytics / enterprise feel.',
    tags: ['Top Nav', 'Table View', 'Dense Data'],
    accent: '#ef4444',
  },
  {
    id: 'bento',
    name: 'Bento Grid',
    desc: 'Icon-only slim sidebar, uneven bento box grid, floating AI button. Modern SaaS / macOS feel.',
    tags: ['Icon Sidebar', 'Bento Cards', 'Floating AI'],
    accent: '#8b5cf6',
  },
  {
    id: 'studio',
    name: 'Creator Studio',
    desc: 'Three-panel split: nav+stats left, video feed center, competitors right. TikTok creator tool feel.',
    tags: ['3-Panel Split', 'Media Feed', 'Right Panel'],
    accent: '#fe2c55',
  },
];

export default function DesignsGallery() {
  return (
    <div style={{ background: '#050505', minHeight: '100vh', fontFamily: 'Inter, sans-serif', padding: '40px 32px' }}>
      <div style={{ maxWidth: 1300, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.04em' }}>Design Concepts</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: 0 }}>3 completely different UI layouts — click any to open full size</p>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {DESIGNS.map((d) => (
            <a key={d.id} href={`/designs/${d.id}`} target="_blank" rel="noopener"
              style={{ display: 'block', textDecoration: 'none', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: '#111', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 60px ${d.accent}22`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
            >
              {/* Preview iframe */}
              <div style={{ position: 'relative', height: 320, overflow: 'hidden', background: '#000' }}>
                <iframe
                  src={`/designs/${d.id}`}
                  style={{ width: '200%', height: '200%', border: 'none', transform: 'scale(0.5)', transformOrigin: 'top left', pointerEvents: 'none' }}
                  scrolling="no"
                />
                {/* Click overlay */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.6))', display: 'flex', alignItems: 'flex-end', padding: 16 }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600, background: 'rgba(0,0,0,0.5)', padding: '4px 10px', borderRadius: 100, backdropFilter: 'blur(8px)' }}>
                    Click to open full size ↗
                  </span>
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: '20px 22px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.accent, flexShrink: 0 }} />
                  <h2 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>{d.name}</h2>
                </div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: '0 0 14px', lineHeight: 1.6 }}>{d.desc}</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                  {d.tags.map(t => (
                    <span key={t} style={{ fontSize: 10, padding: '3px 10px', borderRadius: 100, background: `${d.accent}18`, color: d.accent, fontWeight: 700 }}>{t}</span>
                  ))}
                </div>
              </div>
            </a>
          ))}
        </div>

        <p style={{ textAlign: 'center', marginTop: 40, fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
          Tell Yassin which direction you prefer — or which parts to mix — and we&apos;ll build it out.
        </p>
      </div>
    </div>
  );
}
