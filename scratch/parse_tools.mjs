import fs from 'fs';

const data = JSON.parse(fs.readFileSync('scratch/payload_out.json', 'utf8'));

if (data.result && data.result.tools) {
  for (const tool of data.result.tools) {
    console.log(`Tool: ${tool.name}`);
    console.log(`Description: ${tool.description}`);
    console.log('---');
  }
} else {
  console.log("No tools found or error:", data);
}
