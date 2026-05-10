const { execSync } = require('child_process');

const curlCmd = `curl.exe -s -X POST https://stitch.googleapis.com/mcp -H "X-Goog-Api-Key: AQ.Ab8RN6IVaW6-o4lH9db5em4nihw0Ulq_2-u544X9lwP69ftW3A" -H "Content-Type: application/json" -d @scratch/payload.json`;
const output = execSync(curlCmd, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });

const data = JSON.parse(output);
if (data.result && data.result.tools) {
  for (const tool of data.result.tools) {
    if (tool.name === 'list_screens' || tool.name === 'get_screen') {
      console.log(`Tool: ${tool.name}`);
      console.log(`Schema: ${JSON.stringify(tool.inputSchema, null, 2)}`);
      console.log('---');
    }
  }
}
