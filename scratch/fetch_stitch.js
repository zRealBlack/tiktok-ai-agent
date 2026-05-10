const fs = require('fs');

async function callMcp(method, params = {}) {
  const url = "https://stitch.googleapis.com/mcp";
  const apiKey = "AQ.Ab8RN6IVaW6-o4lH9db5em4nihw0Ulq_2-u544X9lwP69ftW3A";

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: method,
        arguments: params
      }
    })
  });

  return await response.json();
}

async function run() {
  try {
    console.log("Fetching project MasAiNew1...");
    const projRes = await callMcp("get_project", { name: "MasAiNew1" });
    
    // Project names might be projects/{uuid}. The user said "called MasAiNew1".
    // If it fails, let's list all projects and find the one with displayName MasAiNew1.
    const allProjs = await callMcp("list_projects", {});
    let targetProjectId = null;
    if (allProjs.result && allProjs.result.content) {
      const text = allProjs.result.content[0].text;
      const parsed = JSON.parse(text);
      for (const p of parsed.projects || []) {
        if (p.displayName === 'MasAiNew1') {
          targetProjectId = p.name;
          break;
        }
      }
    }
    
    if (!targetProjectId) {
       console.log("Could not find project MasAiNew1");
       return;
    }
    console.log("Found Project ID:", targetProjectId);

    const screensRes = await callMcp("list_screens", { project: targetProjectId });
    const screensData = JSON.parse(screensRes.result.content[0].text);
    
    fs.writeFileSync('scratch/stitch_screens.json', JSON.stringify(screensData, null, 2));
    console.log("Saved screens to scratch/stitch_screens.json");
    
  } catch (e) {
    console.error(e);
  }
}

run();
