import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { buildAgentContext, AGENT_SYSTEM_PROMPT } from './lib/agentContext';

async function run() {
  const ai = new GoogleGenAI({ apiKey: "AIzaSyACBKXT7ztdbI2l0KnjkxbxLaZAn5SEeeM" });
  
  console.log("Uploading video to Gemini...");
  let uploadResult = await ai.files.upload({ file: 'sarie_video.mp4' });
  console.log("Upload complete. Waiting for video processing...");
  
  // Wait for processing
  while (uploadResult.state === 'PROCESSING') {
    await new Promise(resolve => setTimeout(resolve, 5000));
    uploadResult = await ai.files.get({ name: uploadResult.name! });
    console.log("State:", uploadResult.state);
  }
  
  if (uploadResult.state === 'FAILED') {
    console.error("Video processing failed.");
    return;
  }
  
  console.log("Video is ACTIVE. Analyzing with Sarie's context...");
  
  // Mock data to fill the context
  const mockContext = buildAgentContext({
    account: { username: "@rasayel_podcast", followers: 279600 },
    videos: [],
    generations: [],
    trends: [],
    competitors: []
  });
  
  const systemPrompt = AGENT_SYSTEM_PROMPT.replace("{{CONTEXT}}", mockContext);
  
  let response;
  let retries = 3;
  while (retries > 0) {
    try {
      response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: [
          {
            role: "user",
            parts: [
              { fileData: { fileUri: uploadResult.uri, mimeType: uploadResult.mimeType } },
              { text: "أرجو تحليل هذا الفيديو بناءً على التعليمات الخاصة بيكي كـ Mas Sarie. اديني تحليل شامل للصوت والإضاءة وحركة الكاميرا والهوك وقدمي 3 توصيات لتحسين المشاهدات." }
            ]
          }
        ],
        config: {
          systemInstruction: systemPrompt
        }
      });
      break;
    } catch (e: any) {
      if (e.status === 503) {
        console.log("503 High Demand... retrying in 10 seconds.");
        retries--;
        await new Promise(r => setTimeout(r, 10000));
      } else {
        throw e;
      }
    }
  }

  if (!response) {
    console.error("Failed after retries due to 503.");
    return;
  }
  
  const analysisText = response.text;
  console.log("Analysis complete!");
  
  // Generate docx
  const doc = new Document({
    sections: [{
      properties: {},
      children: (analysisText || "").split('\n').map(line => new Paragraph({
        children: [new TextRun(line)]
      }))
    }]
  });
  
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync('Sarie_Video_Analysis.docx', buffer);
  console.log("Saved to Sarie_Video_Analysis.docx");
}

run().catch(console.error);
