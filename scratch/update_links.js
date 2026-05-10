const fs = require('fs');

let pageContent = fs.readFileSync('app/page.tsx', 'utf8');

// Replace Dashboard link
pageContent = pageContent.replace(/<a className="flex items-center gap-3 px-4 py-2\.5 text-gray-600 bg-white rounded-full transition-all shadow-sm" href="#">([\s\S]*?)<\/a>/,
  '<Link className="flex items-center gap-3 px-4 py-2.5 text-gray-600 bg-white rounded-full transition-all shadow-sm" href="/dashboard">$1</Link>');

// Wrap team members with Link instead of onClick
// Let's replace the whole Team Members map function
pageContent = pageContent.replace(/\{computedConversations\.filter\(c => !c\.isAI\)\.map\(c => \([\s\S]*?className=\{`flex items-center gap-3 p-2 hover:bg-white rounded-xl cursor-pointer transition-colors \$\{activeId === c\.id \? 'bg-white shadow-sm' : ''\}`\}[\s\S]*?onClick=\{[\s\S]*?\}[\s\S]*?>/g,
  `{computedConversations.filter(c => !c.isAI).map(c => (
      <Link 
        href={\`/team-chat/\${c.id}\`}
        key={c.id} 
        className={\`flex items-center gap-3 p-2 hover:bg-white rounded-xl cursor-pointer transition-colors \${activeId === c.id ? 'bg-white shadow-sm' : ''}\`}
      >`);

// Make sure to replace the closing </div> of that map with </Link>
pageContent = pageContent.replace(/<\/p>\s*<\/div>\s*<\/div>\s*\)\)}/g, 
  `</p>
        </div>
      </Link>
    ))}`);

fs.writeFileSync('app/page.tsx', pageContent);
console.log("Updated app/page.tsx links");
