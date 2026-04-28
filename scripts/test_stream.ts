async function testTikWM() {
  const tiktokUrl = "https://www.tiktok.com/@rasayel_podcast/video/7299071591109922054";
  console.log("Fetching from TikWM API...");
  const res = await fetch(`https://www.tikwm.com/api/?url=${tiktokUrl}`);
  const json = await res.json();
  console.log("TikWM Response data.play:", json.data?.play);
  
  if (json.data?.play) {
    console.log("Success! Found video URL.");
  } else {
    console.log("Failed to find video URL in TikWM response.");
  }
  
}

testTikWM().catch(console.error);
