const fs = require('fs');

function fixStyles(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Replace style="key: value; key2: value2" with style={{ key: 'value', key2: 'value2' }}
    // But since it's just "width: 92%", we can do a simpler replace for width.
    content = content.replace(/style="width:\s*([^"]+)"/g, "style={{ width: '$1' }}");
    fs.writeFileSync(filePath, content);
}

fixStyles('app/dashboard/page.tsx');
fixStyles('app/team-chat/[id]/page.tsx');
console.log("Fixed styles");
