const fs = require('fs');

const htmlBuffer = fs.readFileSync('scratch/stitch_team_chat.html');
let html = htmlBuffer.toString('utf16le');
if (html.indexOf('<html') === -1) {
  html = htmlBuffer.toString('utf8');
}

const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/);
let bodyHtml = bodyMatch ? bodyMatch[1] : html;

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

// Make a dynamic back link to the main chat
jsx = jsx.replace(/<a className="text-gray-400 hover:text-gray-600 p-2 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center w-8 h-8" href="#">/g,
  '<Link className="text-gray-400 hover:text-gray-600 p-2 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center w-8 h-8" href="/">');

const pageContent = `
import React from 'react';
import Link from 'next/link';

export default function TeamChatPage({ params }: { params: { id: string } }) {
  // We can eventually load the team member based on params.id
  
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

fs.writeFileSync('app/team-chat/[id]/page.tsx', pageContent);
console.log("Created app/team-chat/[id]/page.tsx");
