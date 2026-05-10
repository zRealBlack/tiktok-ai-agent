const fs = require('fs');

let c = fs.readFileSync('app/dashboard/page.tsx', 'utf8');

const parts = c.split(/\{\/\*\s*Dashboard Content\s*\*\/\}/);
if (parts.length < 2) {
    console.log("Could not split by Dashboard Content");
    process.exit(1);
}

const beforeContent = parts[0];
const afterContentSplit = parts[1].split(/\{\/\*\s*END: Main Dashboard Area\s*\*\/\}/);
const contentInner = afterContentSplit[0];
const afterContent = afterContentSplit[1];

const layoutJsx = beforeContent + `{children}\n</main>\n{/* END: Main Dashboard Area */}` + afterContent;

const pageJsx = `'use client';
import React from 'react';
import Link from 'next/link';
import { useData } from "@/components/DataContext";

export default function DashboardPage() {
  const { account, videos } = useData();

  return (
    <>
      {/* Dashboard Content */}
      ${contentInner}
    </>
  );
}`;

const layoutFile = `'use client';
import React from 'react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[#e4dfd8] flex items-center justify-center p-8" style={{
      backgroundImage: "url(https://lh3.googleusercontent.com/aida/ADBb0uhCilLHmLfDhPMwiCs2nL08qwA6V4xXkJYQ4KtwbpzOH62ThNmDWsEtxzYscnGYjlnkSs9KqANozl3XsH_1co8MEq1TXxitKN8M_ZLcIfMUc-DYny0LMDOLM5Tt0mMigyTZCfAzzVB91vXKYlO7L7hsdofrt6vkvAAaiwsKoPmx8H-JHJyiR5sM-gNy-r6UYF4_Z61SW9RSycIBI7sRuqVXMtbvBMHknTg4V6fzeOS9J6BZeTdDTHgVCjdnfkDJv5uefwuLfcCg)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      fontFamily: "'Inter', sans-serif"
    }}>
      ${layoutJsx.replace(/export default function DashboardHub\(\) \{\s*return \(\s*<div[^>]*>\s*/, '')}
`;

fs.writeFileSync('app/dashboard/layout.tsx', layoutFile);
fs.writeFileSync('app/dashboard/page.tsx', pageJsx);
console.log("Split dashboard into layout and page");
