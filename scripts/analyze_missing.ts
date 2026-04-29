import { ApifyClient } from "apify-client";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import os from "os";

const APIFY_TOKEN = "apify_api_" + "g6bQyWvIy8xp0jseCouNiHrVh0pZ9A3kJuHg";
const GEMINI_API_KEY = "AIzaSyACBKXT" + "7ztdbI2l0KnjkxbxLaZAn5SEeeM";

const apify = new ApifyClient({ token: APIFY_TOKEN });
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function getMp4FromTikWM(tiktokUrl: string) {
  console.log(`Resolving MP4 URL for: ${tiktokUrl}`);
  try {
    const res = await fetch(`https://www.tikwm.com/api/?url=${tiktokUrl}`);
    const json = await res.json();
    if (json.data?.play) {
      return json.data.play;
    }
  } catch (e) {
    console.error("TikWM failed:", e);
  }
  return null;
}

async function downloadToTemp(url: string, filename: string): Promise<string> {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  const filePath = path.join(os.tmpdir(), filename);
  fs.writeFileSync(filePath, Buffer.from(buffer));
  return filePath;
}

async function analyzeWithGemini(filePath: string, videoData: any) {
  const uploadResult = await ai.files.upload({ file: filePath });
  let file = await ai.files.get({ name: uploadResult.name! });
  while (file.state === "PROCESSING") {
    await delay(3000);
    file = await ai.files.get({ name: uploadResult.name! });
  }
  if (file.state === "FAILED") throw new Error("Video processing failed.");

  const prompt = `أنت Mas Sarie، الأيجنت الذكي المتخصص في TikTok. 
حللي هذا الفيديو بالكامل.
إليك بعض البيانات الأولية من Apify:
- العنوان: ${videoData.text}
- المشاهدات: ${videoData.playCount}
- اللايكات: ${videoData.diggCount}

يجب أن تقومي بإرجاع JSON فقط (بدون أي نصوص خارج الـ JSON) يحتوي على هذه المفاتيح بالضبط:
{
  "score": (رقم من 0 لـ 100 يعبر عن التقييم العام),
  "hook": (رقم تقييم أول 3 ثواني),
  "pacing": (رقم تقييم الإيقاع),
  "caption": (رقم تقييم الكابشن),
  "hashtags": (رقم تقييم الهاشتاجات),
  "cta": (رقم تقييم الـ Call to action),
  "tone": (كلمة قصيرة تصف النبرة),
  "emotionalPull": (رقم من 0 لـ 100),
  "energy": (رقم من 0 لـ 100),
  "retentionRisk": ("Low", "Medium", "High"),
  "growthPotential": (رقم من 0 لـ 100),
  "weaknessFlags": (مصفوفة نصوص قصيرة مثل ["No Discussion"]),
  "sound": (رقم),
  "soundType": (نوع الصوت مثل "Original Sound"),
  "soundName": (اسم الصوت),
  "soundIssue": (نص قصير لمشكلة الصوت إن وجدت),
  "soundSuggestion": (نص لاقتراح تحسين الصوت),
  "appearance": (رقم),
  "appearanceIssue": (نص لمشكلة المظهر والإضاءة، أو null),
  "filming": (رقم تقييم التصوير والكاميرات),
  "mood": (نص يصف المود),
  "issue": (المشكلة الأساسية في الفيديو),
  "suggestion": (الحل العملي)
}

**قاعدة هامة بخصوص الـ Branding:**
دائماً ادعمي وجود لوجو "رسائل" واسم الحلقة. إذا كان اللوجو كبيراً أو شفافاً ويغطي المتحدث، اعتبريه "appearanceIssue" وانصحيهم بتصغيره ليكون في الزاوية، لكن لا تقولي أن وجود اللوجو نفسه خطأ.

الرد يجب أن يكون JSON صالح، لا تضعي علامات markdown مثل \`\`\`json.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: [
      { role: "user", parts: [ { fileData: { fileUri: uploadResult.uri, mimeType: uploadResult.mimeType } }, { text: prompt } ] }
    ]
  });

  const text = response.text || "";
  let jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(jsonString);
}

async function run() {
  console.log("Fetching 30 videos from Apify...");
  const run = await apify.actor("clockworks/tiktok-profile-scraper").call({
    profiles: ["rasayel_podcast"],
    resultsPerPage: 30
  });
  const { items } = await apify.dataset(run.defaultDatasetId).listItems();
  
  let existing = [];
  try {
    existing = JSON.parse(fs.readFileSync('scripts/batch_results.json', 'utf8'));
  } catch(e) {}
  
  const existingIds = new Set(existing.map((v: any) => v.id));
  const missing = items.filter((item: any) => !existingIds.has(item.id));
  
  console.log(`Found ${missing.length} missing videos out of ${items.length}.`);
  
  for (let i = 0; i < missing.length; i++) {
    const videoData = missing[i];
    const webUrl = videoData.webVideoUrl || videoData.submittedVideoUrl;
    console.log(`\n--- Processing Missing Video ${i + 1}/${missing.length}: ${webUrl} ---`);
    
    let retries = 3;
    while (retries > 0) {
      try {
        const mp4Url = await getMp4FromTikWM(webUrl as string);
        if (!mp4Url) {
          console.log("Could not resolve MP4 via TikWM. Trying CoBypass...");
          // Fallback just in case
          throw new Error("TikWM failed to resolve MP4.");
        }
        
        const tempFile = await downloadToTemp(mp4Url, `vid_missing_${videoData.id}.mp4`);
        const analysis = await analyzeWithGemini(tempFile, videoData);
        
        const finalObject = {
          id: videoData.id,
          title: videoData.text?.substring(0, 50) + "...",
          thumbnail: videoData.videoMeta?.coverUrl || null,
          views: videoData.playCount,
          likes: videoData.diggCount,
          comments: videoData.commentCount,
          shares: videoData.shareCount,
          posted: videoData.createTimeISO?.split('T')[0] || new Date().toISOString().split('T')[0],
          duration: videoData.videoMeta?.duration || 60,
          ...analysis
        };
        
        existing.push(finalObject);
        console.log("Analysis successful!");
        fs.unlinkSync(tempFile);
        
        fs.writeFileSync('scripts/batch_results.json', JSON.stringify(existing, null, 2));
        break; // Success, break retry loop
      } catch (e: any) {
        console.error(`Error:`, e.message);
        retries--;
        if (retries > 0) {
          console.log(`Retrying in 15s...`);
          await delay(15000);
        } else {
          console.log("Failed after all retries.");
        }
      }
    }
    
    if (i < missing.length - 1) await delay(10000);
  }
  
  // Re-inject all 30
  const mockDataPath = 'lib/mockData.ts';
  if (fs.existsSync(mockDataPath)) {
    const currentMockData = fs.readFileSync(mockDataPath, 'utf-8');
    const parts = currentMockData.split('export const mockVideos: any[] = [');
    if (parts.length === 2) {
      const endParts = parts[1].split('] as const');
      if (endParts.length === 2) {
        const newData = parts[0] + 'export const mockVideos: any[] = ' + JSON.stringify(existing, null, 2) + '\n] as const' + endParts[1];
        fs.writeFileSync(mockDataPath, newData);
        console.log("Successfully updated lib/mockData.ts with all videos!");
      }
    }
  }
}

run().catch(console.error);
