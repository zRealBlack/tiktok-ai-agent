import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

async function run() {
  const transport = new SSEClientTransport(
    new URL("https://stitch.googleapis.com/mcp"),
    {
      headers: {
        "X-Goog-Api-Key": "AQ.Ab8RN6IVaW6-o4lH9db5em4nihw0Ulq_2-u544X9lwP69ftW3A"
      }
    }
  );

  const client = new Client(
    {
      name: "tiktok-agent-client",
      version: "1.0.0"
    },
    {
      capabilities: {}
    }
  );

  try {
    console.log("Connecting to Stitch MCP server...");
    await client.connect(transport);
    
    console.log("Connected! Fetching tools...");
    const tools = await client.listTools();
    console.log(JSON.stringify(tools, null, 2));

    await client.close();
  } catch (error) {
    console.error("Error communicating with MCP server:", error);
  }
}

run();
