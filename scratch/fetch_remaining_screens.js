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
    const dashboardId = "c4e57347f57b4add84d7c6799a7ee45f";
    const teamChatId = "1f23a224027146fb9c03c29d77746ede";

    console.log("Fetching Dashboard code...");
    const dashRes = await callMcp("get_screen", { 
        name: `projects/${projectId}/screens/${dashboardId}`,
        projectId: projectId,
        screenId: dashboardId
    });
    fs.writeFileSync('scratch/stitch_dashboard.json', JSON.stringify(dashRes, null, 2));

    console.log("Fetching Team Chat code...");
    const teamRes = await callMcp("get_screen", { 
        name: `projects/${projectId}/screens/${teamChatId}`,
        projectId: projectId,
        screenId: teamChatId
    });
    fs.writeFileSync('scratch/stitch_team_chat.json', JSON.stringify(teamRes, null, 2));

    console.log("Done extracting metadata");
  } catch (e) {
    console.error(e);
  }
}

run();
