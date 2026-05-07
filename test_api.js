const apiKey = "AIzaSyACBKXT7ztdbI2l0KnjkxbxLaZAn5SEeeM";

async function testKey() {
  console.log("Testing API key and getting models list...");
  
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Failed to fetch models:", res.status, errorText);
      return;
    }
    
    const data = await res.json();
    const modelNames = data.models.map(m => m.name);
    console.log("Total models available:", modelNames.length);
    
    // Check for gemini 3 models
    const gemini3Models = modelNames.filter(m => m.includes("gemini-3"));
    console.log("Gemini 3 models found:", gemini3Models.length ? gemini3Models : "None found");
    
    // Print some models for reference
    console.log("Some available models:", modelNames.filter(m => m.includes("gemini")).slice(0, 5));
    
  } catch (err) {
    console.error("Error:", err);
  }
}

testKey();
