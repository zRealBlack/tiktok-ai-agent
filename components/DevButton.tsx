'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';

export default function DevButton() {
  const pathname = usePathname();
  // Hide the button when already on the developer page
  if (pathname?.startsWith('/developer')) return null;

  return (
    <Link
      href="/developer"
      title="Developer Panel"
      className="hidden md:flex"
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 9999,
        width: 34,
        height: 34,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.85)',
        border: '1px solid rgba(0,0,0,0.08)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'all 0.18s',
        textDecoration: 'none',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = '#ef4444';
        (e.currentTarget as HTMLElement).style.borderColor = '#ef4444';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.85)';
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,0.08)';
      }}
    >
      <ShieldAlert size={15} color="#6b7280" />
    </Link>
  );
}
