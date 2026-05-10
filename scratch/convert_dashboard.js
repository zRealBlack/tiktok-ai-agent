const fs = require('fs');

// Read the HTML
const htmlBuffer = fs.readFileSync('scratch/stitch_dashboard.html');
let html = htmlBuffer.toString('utf16le');
if (html.indexOf('<html') === -1) {
  html = htmlBuffer.toString('utf8');
}

// Extract body
const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/);
let bodyHtml = bodyMatch ? bodyMatch[1] : html;

// Convert to JSX
let jsx = bodyHtml
  .replace(/class=/g, 'className=')
  .replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}')
  .replace(/<img([^>]+)>/g, (match, attrs) => {
      if (!attrs.endsWith('/')) return `<img${attrs}/>`;
      return match;
  })
  .replace(/<input([^>]+)>/g, (match, attrs) => {
      if (!attrs.endsWith('/')) return `<input${attrs}/>`;
      return match;
  })
  .replace(/<hr([^>]+)>/g, (match, attrs) => {
      if (!attrs.endsWith('/')) return `<hr${attrs}/>`;
      return match;
  })
  .replace(/<br([^>]*?)>/g, '<br />');

// Inject next/link
jsx = jsx.replace(/{?\/\*\s*Top Navigation\s*\*\/}?}?\s*<div className="flex items-center gap-6 text-sm text-gray-500">[\s\S]*?<\/div>/, 
`{/* Top Navigation */}
<div className="flex items-center gap-6 text-sm text-gray-500">
  <Link href="/dashboard/overview" className="hover:text-gray-800 transition-colors">Overview</Link>
  <Link href="/dashboard/audit" className="hover:text-gray-800 transition-colors">Audit</Link>
  <Link href="/dashboard/competitors" className="hover:text-gray-800 transition-colors">Competitors</Link>
  <Link href="/dashboard/ideas" className="hover:text-gray-800 transition-colors">Ideas</Link>
</div>`);

const pageContent = `
import React from 'react';
import Link from 'next/link';

export default function DashboardHub() {
  return (
    <div className="min-h-screen w-full bg-[#e4dfd8] flex items-center justify-center p-8" style={{
      backgroundImage: "url(https://lh3.googleusercontent.com/aida/ADBb0uhCilLHmLfDhPMwiCs2nL08qwA6V4xXkJYQ4KtwbpzOH62ThNmDWsEtxzYscnGYjlnkSs9KqANozl3XsH_1co8MEq1TXxitKN8M_ZLcIfMUc-DYny0LMDOLM5Tt0mMigyTZCfAzzVB91vXKYlO7L7hsdofrt6vkvAAaiwsKoPmx8H-JHJyiR5sM-gNy-r6UYF4_Z61SW9RSycIBI7sRuqVXMtbvBMHknTg4V6fzeOS9J6BZeTdDTHgVCjdnfkDJv5uefwuLfcCg)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      fontFamily: "'Inter', sans-serif"
    }}>
      ${jsx}
    </div>
  );
}
`;

fs.writeFileSync('app/dashboard/page.tsx', pageContent);
console.log("Created app/dashboard/page.tsx");
