const fs = require('fs');

let html = fs.readFileSync('scratch/stitch_ui_utf8.html', 'utf8');

// Extract the contents of <body>
const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/);
let bodyHtml = bodyMatch ? bodyMatch[1] : html;

// Basic JSX replacements
let jsx = bodyHtml
  .replace(/class=/g, 'className=')
  .replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}')
  .replace(/<img([^>]+)>/g, (match, attrs) => {
      // Ensure self-closing
      if (!attrs.endsWith('/')) {
          return `<img${attrs}/>`;
      }
      return match;
  })
  .replace(/<input([^>]+)>/g, (match, attrs) => {
      if (!attrs.endsWith('/')) {
          return `<input${attrs}/>`;
      }
      return match;
  })
  .replace(/<hr([^>]+)>/g, (match, attrs) => {
      if (!attrs.endsWith('/')) {
          return `<hr${attrs}/>`;
      }
      return match;
  })
  .replace(/<br([^>]*?)>/g, '<br />');

fs.writeFileSync('scratch/stitch_ui.jsx', jsx);
console.log("Converted to scratch/stitch_ui.jsx");
