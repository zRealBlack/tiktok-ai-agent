const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf8');
if (!content.includes("import Link")) {
    content = content.replace("import React", "import React from 'react';\nimport Link from 'next/link';");
    // Just in case "import React" is missing or different:
    if (!content.includes("import Link")) {
       content = "import Link from 'next/link';\n" + content;
    }
    fs.writeFileSync('app/page.tsx', content);
}
