'use client';

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  content: string;
}

export default function MarkdownMessage({ content }: Props) {
  return (
    <div className="max-w-none text-[13px] leading-relaxed break-words markdown-content" style={{ color: 'inherit' }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        table: ({node, ...props}) => (
          <div className="overflow-x-auto my-3 rounded-xl" style={{ border: '1px solid var(--glass-elevated-border)' }}>
            <table className="w-full text-[12px] text-left border-collapse min-w-[300px]" {...props} />
          </div>
        ),
        th: ({node, ...props}) => (
          <th className="px-3 py-2 border-b font-bold" style={{ borderColor: 'var(--glass-elevated-border)', background: 'var(--glass-elevated)' }} {...props} />
        ),
        td: ({node, ...props}) => (
          <td className="px-3 py-2 border-b" style={{ borderColor: 'var(--glass-elevated-border)' }} {...props} />
        ),
        code: ({node, inline, className, children, ...props}: any) => {
          return inline ? (
            <code className="px-1 py-0.5 rounded font-mono text-[11px]" style={{ background: 'var(--glass-elevated)', color: 'var(--text-secondary)' }} {...props}>
              {children}
            </code>
          ) : (
            <pre className="p-3 mb-2 rounded-xl overflow-x-auto font-mono text-[11px]" style={{ background: 'var(--glass-elevated)' }}>
              <code {...props}>{children}</code>
            </pre>
          );
        },
        p: ({node, ...props}) => <p className="mb-2 last:mb-0" style={{ color: 'inherit' }} {...props} />,
        ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2 space-y-1" style={{ color: 'inherit' }} {...props} />,
        ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2 space-y-1" style={{ color: 'inherit' }} {...props} />,
        li: ({node, ...props}) => <li className="" style={{ color: 'inherit' }} {...props} />,
        a: ({node, ...props}) => <a className="text-blue-500 hover:underline inline-flex items-center" target="_blank" rel="noreferrer" {...props} />,
        h1: ({node, ...props}) => <h1 className="text-base font-bold mb-2 mt-4" {...props} />,
        h2: ({node, ...props}) => <h2 className="text-[15px] font-bold mb-2 mt-3" {...props} />,
        h3: ({node, ...props}) => <h3 className="text-[14px] font-bold mb-1 mt-2" {...props} />,
        strong: ({node, ...props}) => <strong className="font-bold" style={{ color: 'var(--text-primary)' }} {...props} />,
        em: ({node, ...props}) => <em className="italic" {...props} />,
        blockquote: ({node, ...props}) => (
          <blockquote className="pl-3 my-2 border-l-2 italic" style={{ borderColor: 'var(--text-secondary)', color: 'var(--text-muted)' }} {...props} />
        ),
      }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
