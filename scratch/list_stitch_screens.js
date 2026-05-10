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
    const screensRes = await callMcp("list_screens", { projectId: projectId });
    
    if (screensRes.result && screensRes.result.content) {
      const data = JSON.parse(screensRes.result.content[0].text);
      if (data.screens && data.screens.length > 0) {
        data.screens.forEach(s => {
          console.log(`Title: ${s.title}`);
          console.log(`ID: ${s.name.split('/').pop()}`);
          console.log('---');
        });
      }
    }
  } catch (e) {
    console.error(e);
  }
}

run();
