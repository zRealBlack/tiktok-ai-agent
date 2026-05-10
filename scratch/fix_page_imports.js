const fs = require('fs');

let content = fs.readFileSync('app/page.tsx', 'utf8');

// remove all instances of 'use client'; and import Link
content = content.replace(/'use client';\r?\n?/g, '');
content = content.replace(/"use client";\r?\n?/g, '');
content = content.replace(/import Link from 'next\/link';\r?\n?/g, '');

content = "'use client';\nimport Link from 'next/link';\n" + content;

fs.writeFileSync('app/page.tsx', content);
console.log("Fixed page.tsx top level imports");
