'use client';

import React from "react";

interface Props {
  content: string;
}

// Lightweight markdown parser: handles **bold**, *italic*, # headings, and line breaks
export default function MarkdownMessage({ content }: Props) {
  const lines = content.split("\n");

  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        // Heading
        if (line.startsWith("### ")) return <p key={i} className="font-bold text-[13px] mt-2">{renderInline(line.slice(4))}</p>;
        if (line.startsWith("## ")) return <p key={i} className="font-bold text-[14px] mt-2">{renderInline(line.slice(3))}</p>;
        if (line.startsWith("# ")) return <p key={i} className="font-bold text-[15px] mt-2">{renderInline(line.slice(2))}</p>;

        // Bullet list items (-, *, ✦, •)
        const bulletMatch = line.match(/^(\s*)([-•*✦]|\d+\.) (.+)/);
        if (bulletMatch) {
          const indent = bulletMatch[1].length;
          return (
            <div key={i} className="flex items-start gap-1.5" style={{ paddingLeft: `${indent * 8}px` }}>
              <span className="shrink-0 mt-0.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>✦</span>
              <span className="text-[13px] leading-relaxed">{renderInline(bulletMatch[3])}</span>
            </div>
          );
        }

        // Empty line → small spacer
        if (line.trim() === "") return <div key={i} className="h-1" />;

        // Regular paragraph
        return (
          <p key={i} className="text-[13px] leading-relaxed">
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
}

// Inline: **bold**, *italic*, `code`
function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // **bold**
    const boldIdx = remaining.indexOf("**");
    const boldEnd = boldIdx >= 0 ? remaining.indexOf("**", boldIdx + 2) : -1;
    if (boldIdx >= 0 && boldEnd > boldIdx + 1) {
      if (boldIdx > 0) parts.push(<span key={key++}>{remaining.slice(0, boldIdx)}</span>);
      parts.push(<strong key={key++} className="font-bold">{remaining.slice(boldIdx + 2, boldEnd)}</strong>);
      remaining = remaining.slice(boldEnd + 2);
      continue;
    }

    // *italic* (single asterisk, not double)
    const itMatch = remaining.match(/^([^*]*)\*([^*]+)\*(.*)/);
    if (itMatch) {
      if (itMatch[1]) parts.push(<span key={key++}>{itMatch[1]}</span>);
      parts.push(<em key={key++} className="italic">{itMatch[2]}</em>);
      remaining = itMatch[3];
      continue;
    }

    // `code`
    const btIdx = remaining.indexOf("`");
    const btEnd = btIdx >= 0 ? remaining.indexOf("`", btIdx + 1) : -1;
    if (btIdx >= 0 && btEnd > btIdx) {
      if (btIdx > 0) parts.push(<span key={key++}>{remaining.slice(0, btIdx)}</span>);
      parts.push(
        <code key={key++} className="px-1 py-0.5 rounded text-[12px]"
          style={{ background: 'var(--glass-elevated)', color: 'var(--text-secondary)' }}>
          {remaining.slice(btIdx + 1, btEnd)}
        </code>
      );
      remaining = remaining.slice(btEnd + 1);
      continue;
    }

    // no more matches — output rest as plain text
    parts.push(<span key={key++}>{remaining}</span>);
    break;
  }

  return parts;
}
