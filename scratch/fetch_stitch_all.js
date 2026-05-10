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
    console.log("Listing all projects...");
    const allProjs = await callMcp("list_projects", {});
    fs.writeFileSync('scratch/stitch_projects.json', JSON.stringify(allProjs, null, 2));
    console.log("Saved projects to scratch/stitch_projects.json");
  } catch (e) {
    console.error(e);
  }
}

run();
