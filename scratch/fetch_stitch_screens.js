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
    const projectId = "889019208377206697";
    console.log("Listing screens for project:", projectId);
    const screensRes = await callMcp("list_screens", { projectId: projectId });
    fs.writeFileSync('scratch/stitch_screens.json', JSON.stringify(screensRes, null, 2));
    
    // Check if we can get the code for the first screen
    if (screensRes.result && screensRes.result.content) {
      const data = JSON.parse(screensRes.result.content[0].text);
      if (data.screens && data.screens.length > 0) {
        const firstScreenId = data.screens[0].name.split('/').pop();
        console.log("Fetching code for screen:", firstScreenId);
        
        const screenCodeRes = await callMcp("get_screen", { 
           name: `projects/${projectId}/screens/${firstScreenId}`,
           projectId: projectId,
           screenId: firstScreenId
        });
        fs.writeFileSync('scratch/stitch_screen_code.json', JSON.stringify(screenCodeRes, null, 2));
        console.log("Saved screen code");
      }
    }
  } catch (e) {
    console.error(e);
  }
}

run();
