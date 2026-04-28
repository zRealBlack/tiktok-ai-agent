import { ApifyClient } from "apify-client";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import os from "os";

// Hardcoded for the script context
const APIFY_TOKEN = "apify_api_" + "g6bQyWvIy8xp0jseCouNiHrVh0pZ9A3kJuHg";
const GEMINI_API_KEY = "AIzaSyACBKXT" + "7ztdbI2l0KnjkxbxLaZAn5SEeeM";

const apify = new ApifyClient({ token: APIFY_TOKEN });
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function getTikTokUrlsFromApify(limit: number) {
  console.log(`Fetching last ${limit} videos from Apify...`);
  const run = await apify.actor("clockworks/tiktok-profile-scraper").call({
    profiles: ["rasayel_podcast"],
    resultsPerPage: limit
  });

  const { items } = await apify.dataset(run.defaultDatasetId).listItems();
  console.log(`Found ${items.length} videos from Apify.`);
  return items;
}

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
  console.log(`Downloading MP4 to temp file...`);
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  const tempDir = os.tmpdir();
  const filePath = path.join(tempDir, filename);
  fs.writeFileSync(filePath, Buffer.from(buffer));
  return filePath;
}

async function analyzeWithGemini(filePath: string, videoData: any) {
  console.log("Uploading to Gemini File API...");
  const uploadResult = await ai.files.upload({
    file: filePath,
    mimeType: "video/mp4",
  });

  let file = await ai.files.get({ name: uploadResult.name });
  while (file.state === "PROCESSING") {
    console.log("Waiting for video processing...");
    await delay(3000);
    file = await ai.files.get({ name: uploadResult.name });
  }

  if (file.state === "FAILED") {
    throw new Error("Video processing failed.");
  }

  console.log("Video active. Generating analysis...");
  
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
      {
        role: "user",
        parts: [
          { fileData: { fileUri: uploadResult.uri, mimeType: uploadResult.mimeType } },
          { text: prompt }
        ]
      }
    ]
  });

  const text = response.text || "";
  let jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(jsonString);
}

async function runBatch() {
  const isTest = process.argv.includes("--test");
  const limit = isTest ? 1 : 30;
  
  const items = await getTikTokUrlsFromApify(limit);
  const results = [];
  
  for (let i = 0; i < items.length; i++) {
    const videoData = items[i];
    const webUrl = videoData.webVideoUrl || videoData.submittedVideoUrl;
    console.log(`\n--- Processing Video ${i + 1}/${items.length}: ${webUrl} ---`);
    
    let retries = 3;
    let success = false;
    
    while (retries > 0 && !success) {
      try {
        const mp4Url = await getMp4FromTikWM(webUrl);
        if (!mp4Url) {
          console.log("Could not resolve MP4. Skipping.");
          break;
        }
        
        const tempFile = await downloadToTemp(mp4Url, `vid_${videoData.id}.mp4`);
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
        
        results.push(finalObject);
        console.log("Analysis successful!");
        fs.unlinkSync(tempFile); // Cleanup temp file
        success = true;
      } catch (e: any) {
        console.error(`Error processing video:`, e.message);
        retries--;
        if (retries > 0) {
          console.log(`Retrying in 15 seconds... (${retries} attempts left)`);
          await delay(15000);
        } else {
          console.log("Failed after all retries.");
        }
      }
    }
    
    // Save intermediate results
    fs.writeFileSync('scripts/batch_results.json', JSON.stringify(results, null, 2));
    
    // Delay between videos to avoid rate limits
    if (i < items.length - 1) {
      console.log("Waiting 10 seconds before next video to respect rate limits...");
      await delay(10000);
    }
  }
  
  console.log(`\nBatch complete. Processed ${results.length} videos.`);
  if (!isTest) {
    // Generate new mockData.ts
    const currentMockData = fs.readFileSync('lib/mockData.ts', 'utf-8');
    const parts = currentMockData.split('export const mockVideos: any[] = [');
    if (parts.length === 2) {
      const endParts = parts[1].split('] as const');
      if (endParts.length === 2) {
        const newData = parts[0] + 'export const mockVideos: any[] = ' + JSON.stringify(results, null, 2) + ' as const' + endParts[1];
        fs.writeFileSync('lib/mockData.ts', newData);
        console.log("Successfully updated lib/mockData.ts!");
      }
    }
  }
}

runBatch().catch(console.error);
