import os

# Base coordinates for the 8 roots + Persona
roots = {
    "Team": {"x": -350, "y": 0, "dx": 0, "dy": 0},
    "Client": {"x": -200, "y": 300, "dx": -600, "dy": 450},
    "DB": {"x": -250, "y": 200, "dx": 0, "dy": -150},
    "Persona": {"x": -250, "y": -150, "dx": 0, "dy": 0},
    "Video": {"x": 300, "y": -300, "dx": 50, "dy": 50},
    "Competitors": {"x": 400, "y": -150, "dx": 100, "dy": -400},
    "AI": {"x": 300, "y": 150, "dx": 300, "dy": 500},
    "Conv": {"x": 250, "y": 300, "dx": 250, "dy": -50},
    "Admin": {"x": 100, "y": 350, "dx": 350, "dy": 700},
}

with open(r"c:\Users\yasso\.gemini\antigravity\scratch\tiktok-agent\components\NeuralGraph.tsx", "r", encoding="utf-8") as f:
    content = f.read()

header = content.split("          {/* Main Branches */}")[0]
footer = "      {/* UI Overlay Controls (Non-draggable) */}" + content.split("      {/* UI Overlay Controls (Non-draggable) */}")[1]

# We construct the entire middle section with perfectly shifted coordinates.
middle = """          {/* Main Branches (3 Pillars) */}
          <path d="M 0 0 C -50 0, -100 0, -150 0" stroke="url(#glowPurple)" strokeWidth="3" fill="none" className="animate-[pulse_4s_ease-in-out_infinite]" />
          <path d="M 0 0 C 50 -50, 100 -100, 150 -150" stroke="url(#glowCyan)" strokeWidth="3" fill="none" className="animate-[pulse_3s_ease-in-out_infinite]" />
          <path d="M 0 0 C 50 50, 100 100, 150 150" stroke="url(#glowOrange)" strokeWidth="3" fill="none" className="animate-[pulse_3.5s_ease-in-out_infinite]" />

          {/* ----------------------------------------------------- */}
          {/* MEMORY SUB-ROOTS (-150, 0) */}
          {/* ----------------------------------------------------- */}
          {/* To Persona (-250, -150) */}
          <path d="M -150 0 C -200 -50, -250 -100, -250 -150" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M -250 -150 C -250 -200, -250 -250, -250 -300" stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />
          <path d="M -250 -150 C -300 -180, -350 -200, -400 -220" stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />
          <path d="M -250 -150 C -300 -120, -350 -100, -400 -80" stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />

          {/* To Team (-350, 0) */}
          <path d="M -150 0 C -200 0, -250 0, -350 0" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" fill="none" />
          {TEAM_MEMBERS.map((user, i) => {
             const yOffset = (i - (TEAM_MEMBERS.length - 1) / 2) * 250;
             const x = -550;
             const y = yOffset;
             return (
               <g key={`line-group-${user.id}`}>
                 <path d={`M -350 0 C -450 0, -450 ${y}, ${x} ${y}`} stroke="rgba(168,85,247,0.2)" strokeWidth="1.5" fill="none" />
                 <path d={`M ${x} ${y} C ${x - 40} ${y - 10}, ${x - 70} ${y - 30}, ${x - 100} ${y - 40}`} stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />
                 <path d={`M ${x} ${y} C ${x - 50} ${y + 5}, ${x - 90} ${y + 5}, ${x - 130} ${y + 10}`} stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />
                 <path d={`M ${x} ${y} C ${x - 30} ${y + 20}, ${x - 50} ${y + 40}, ${x - 70} ${y + 60}`} stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />
               </g>
             );
          })}

          {/* To Upstash DB (-250, 200) */}
          <path d="M -150 0 C -200 100, -220 150, -250 200" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" fill="none" />

          {/* To Client (-200, 300) */}
          <path d="M -150 0 C -180 100, -190 200, -200 300" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M -200 300 C -150 300, -100 200, -50 200" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M -200 300 C -150 300, -50 300, 0 300" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M -200 300 C -150 300, -100 400, -50 400" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" fill="none" />
          {/* Client Tier 3 */}
          <path d="M 0 300 C 20 270, 30 260, 50 250" stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />
          <path d="M 0 300 C 30 300, 50 300, 80 300" stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />
          <path d="M 0 300 C 20 330, 30 340, 50 350" stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />

          {/* ----------------------------------------------------- */}
          {/* ANALYSIS SUB-ROOTS (150, -150) */}
          {/* ----------------------------------------------------- */}
          {/* To Video Analytics (300, -300) */}
          <path d="M 150 -150 C 200 -200, 250 -250, 300 -300" stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 300 -300 C 320 -330, 340 -350, 350 -370" stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 300 -300 C 350 -300, 390 -300, 430 -300" stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" fill="none" />
          {/* Video Analytics Tier 3 */}
          <path d="M 350 -370 C 360 -400, 365 -410, 370 -430" stroke="rgba(6,182,212,0.2)" strokeWidth="1" fill="none" />
          <path d="M 350 -370 C 380 -380, 395 -390, 410 -400" stroke="rgba(6,182,212,0.2)" strokeWidth="1" fill="none" />
          <path d="M 430 -300 C 450 -290, 465 -285, 480 -280" stroke="rgba(6,182,212,0.2)" strokeWidth="1" fill="none" />
          <path d="M 430 -300 C 460 -310, 480 -320, 500 -330" stroke="rgba(6,182,212,0.2)" strokeWidth="1" fill="none" />

          {/* To Competitors (400, -150) */}
          <path d="M 150 -150 C 250 -150, 300 -150, 400 -150" stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 400 -150 L 500 -200" stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 400 -150 L 550 -120" stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 400 -150 L 480 -50" stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" fill="none" />

          {/* ----------------------------------------------------- */}
          {/* COGNITION SUB-ROOTS (150, 150) */}
          {/* ----------------------------------------------------- */}
          {/* To AI Engine (300, 150) */}
          <path d="M 150 150 C 200 150, 250 150, 300 150" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 300 150 C 330 120, 350 100, 370 80" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 300 150 C 330 180, 350 200, 370 220" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />
          {/* AI Engine Tier 3 */}
          <path d="M 370 80 C 380 50, 390 40, 400 20" stroke="rgba(249,115,22,0.2)" strokeWidth="1" fill="none" />
          <path d="M 370 80 C 390 80, 410 80, 430 80" stroke="rgba(249,115,22,0.2)" strokeWidth="1" fill="none" />
          <path d="M 370 220 C 390 220, 410 220, 430 220" stroke="rgba(249,115,22,0.2)" strokeWidth="1" fill="none" />
          <path d="M 370 220 C 390 240, 410 260, 430 280" stroke="rgba(249,115,22,0.2)" strokeWidth="1" fill="none" />

          {/* To Conversational (250, 300) */}
          <path d="M 150 150 C 180 200, 210 250, 250 300" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 250 300 C 230 340, 210 360, 200 380" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 250 300 C 270 340, 290 360, 300 380" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />

          {/* To Admin Ops (100, 350) */}
          <path d="M 150 150 C 130 200, 110 250, 100 350" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 100 350 C 70 370, 50 390, 30 400" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 100 350 C 120 390, 140 410, 150 430" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />
        </svg>

        {/* --- NODES --- */}
        
        {/* Core Brain Node */}
        <Node x={0} y={0} label="Sarie Central Intelligence" glowColor="#ef4444" subLabel="Core Memory Hub">
          <div className="w-[300px] h-[300px] flex items-center justify-center pointer-events-auto relative" style={{ mixBlendMode: 'multiply' }}>
            <Image 
              src={BrainImage} 
              alt="Brain" 
              fill
              className="object-contain"
              style={{ filter: 'invert(1) grayscale(1) contrast(5)' }} 
              priority
              draggable={false}
            />
            {/* Color Overlay that matches 3 pillars */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                mixBlendMode: 'screen',
                background: `
                  radial-gradient(circle at 10% 50%, #a855f7 0%, transparent 60%),
                  radial-gradient(circle at 80% 10%, #06b6d4 0%, transparent 60%),
                  radial-gradient(circle at 80% 90%, #f97316 0%, transparent 60%)
                `
              }}
            />
          </div>
        </Node>

        {/* ======================================= */}
        {/* PILLAR 1: MEMORY (LEFT) */}
        <Node x={-150} y={0} label="Memory Vault" glowColor="#a855f7" subLabel="Entity Storage">
          <div className="w-20 h-20 bg-purple-500/5 border border-purple-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Database size={28} className="text-purple-500" />
          </div>
        </Node>

        {/* Persona */}
        <Node x={-250} y={-150} label="Sarie Persona" glowColor="#a855f7">
           <div className="w-8 h-8 bg-purple-500/10 border border-purple-500/30 rounded-full flex items-center justify-center font-bold text-purple-400 text-xs">P</div>
        </Node>
        <Node x={-250} y={-300} glowColor="#a855f7" label="Appearance: Male">
           <div className="w-2 h-2 bg-purple-500/50 border border-purple-300/50 rounded-full" />
        </Node>
        <Node x={-400} y={-220} glowColor="#a855f7" label="Character: Friendly">
           <div className="w-2 h-2 bg-purple-500/50 border border-purple-300/50 rounded-full" />
        </Node>
        <Node x={-400} y={-80} glowColor="#a855f7" label="Hopes: Scale Automation">
           <div className="w-2 h-2 bg-purple-500/50 border border-purple-300/50 rounded-full" />
        </Node>

        {/* Upstash DB */}
        <Node x={-250} y={200} label="Upstash KV DB" glowColor="#a855f7" subLabel="Live Vector Sync">
          <div className="w-12 h-12 bg-purple-500/5 border border-purple-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Database size={20} className="text-purple-500" />
          </div>
        </Node>

        {/* Client (-200, 300) */}
        <Node x={-200} y={300} label="@rasayel_podcast" glowColor="#a855f7" subLabel="Active Target">
          <div className="w-12 h-12 bg-purple-500/5 border border-purple-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Building2 size={20} className="text-purple-500" />
          </div>
        </Node>
        <Node x={-50} y={200} label="Follower Base" glowColor="#a855f7">
           <div className="w-4 h-4 bg-purple-500/20 border border-purple-500/40 rounded-full" />
        </Node>
        <Node x={0} y={300} label="Content Strategy" glowColor="#a855f7">
           <div className="w-6 h-6 bg-purple-500/20 border border-purple-500/40 rounded-full" />
        </Node>
        <Node x={50} y={250} glowColor="#a855f7" label="Hook #1: Controversy"><div className="w-2 h-2 bg-purple-500/50 border border-purple-300/50 rounded-full" /></Node>
        <Node x={80} y={300} glowColor="#a855f7" label="Hook #2: Value Drop"><div className="w-2 h-2 bg-purple-500/50 border border-purple-300/50 rounded-full" /></Node>
        <Node x={50} y={350} glowColor="#a855f7" label="Hook #3: Storytime"><div className="w-2 h-2 bg-purple-500/50 border border-purple-300/50 rounded-full" /></Node>
        <Node x={-50} y={400} label="Recent Viral Data" glowColor="#a855f7">
           <div className="w-4 h-4 bg-purple-500/20 border border-purple-500/40 rounded-full" />
        </Node>

        {/* Team (-350, 0) */}
        <Node x={-350} y={0} label="Team Context" glowColor="#a855f7" subLabel="Identities">
          <div className="w-12 h-12 bg-purple-500/5 border border-purple-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Users size={20} className="text-purple-500" />
          </div>
        </Node>
        {TEAM_MEMBERS.map((user, i) => {
             const yOffset = (i - (TEAM_MEMBERS.length - 1) / 2) * 250;
             const x = -550;
             const y = yOffset;
             return (
               <div key={`node-group-${user.id}`}>
                 <Node x={x} y={y} label={user.name} subLabel={user.role} glowColor="#a855f7">
                   <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/30 rounded-full flex items-center justify-center text-purple-400 font-bold text-xs backdrop-blur-sm">{user.name.charAt(0)}</div>
                 </Node>
                 <Node x={x - 100} y={y - 40} glowColor="#a855f7" label="Session Context"><div className="w-2 h-2 bg-purple-500/50 border border-purple-300/50 rounded-full" /></Node>
                 <Node x={x - 130} y={y + 10} glowColor="#a855f7" label={user.id === 'yassin' ? 'Admin Privileges' : 'Query History'}><div className="w-2 h-2 bg-purple-500/50 border border-purple-300/50 rounded-full" /></Node>
                 <Node x={x - 70} y={y + 60} glowColor="#a855f7" label="API Quota Logs"><div className="w-2 h-2 bg-purple-500/50 border border-purple-300/50 rounded-full" /></Node>
               </div>
             );
        })}

        {/* ======================================= */}
        {/* PILLAR 2: ANALYSIS (TOP RIGHT) */}
        <Node x={150} y={-150} label="Analysis Engine" glowColor="#06b6d4" subLabel="Audits & Competitors">
          <div className="w-20 h-20 bg-cyan-500/5 border border-cyan-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <TrendingUp size={28} className="text-cyan-500" />
          </div>
        </Node>

        {/* Competitor Matrix (400, -150) */}
        <Node x={400} y={-150} label="Competitor Matrix" glowColor="#06b6d4">
          <div className="w-12 h-12 bg-cyan-500/5 border border-cyan-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <TrendingUp size={20} className="text-cyan-500" />
          </div>
        </Node>
        <Node x={500} y={-200} label="Mahmoud Ismail" glowColor="#06b6d4"><div className="w-4 h-4 bg-cyan-500 border border-cyan-300 rounded-full" /></Node>
        <Node x={550} y={-120} label="Nadya Alnoor" glowColor="#06b6d4"><div className="w-4 h-4 bg-cyan-500 border border-cyan-300 rounded-full" /></Node>
        <Node x={480} y={-50} label="Other Competitors" glowColor="#06b6d4"><div className="w-4 h-4 bg-cyan-500 border border-cyan-300 rounded-full" /></Node>

        {/* Video Analytics (300, -300) */}
        <Node x={300} y={-300} label="Video Analytics" glowColor="#06b6d4">
          <div className="w-12 h-12 bg-cyan-500/5 border border-cyan-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Video size={20} className="text-cyan-500" />
          </div>
        </Node>
        <Node x={350} y={-370} label="Visual Hooks" glowColor="#06b6d4"><div className="w-4 h-4 bg-cyan-500 border border-cyan-300 rounded-full" /></Node>
        <Node x={430} y={-300} label="Audio Transcripts" glowColor="#06b6d4"><div className="w-4 h-4 bg-cyan-500 border border-cyan-300 rounded-full" /></Node>
        <Node x={370} y={-430} glowColor="#06b6d4" label="Object Recognition"><div className="w-2 h-2 bg-cyan-500/50 border border-cyan-300/50 rounded-full" /></Node>
        <Node x={410} y={-400} glowColor="#06b6d4" label="Facial Expressions"><div className="w-2 h-2 bg-cyan-500/50 border border-cyan-300/50 rounded-full" /></Node>
        <Node x={480} y={-280} glowColor="#06b6d4" label="Speech-to-Text"><div className="w-2 h-2 bg-cyan-500/50 border border-cyan-300/50 rounded-full" /></Node>
        <Node x={500} y={-330} glowColor="#06b6d4" label="Sentiment NLP"><div className="w-2 h-2 bg-cyan-500/50 border border-cyan-300/50 rounded-full" /></Node>

        {/* ======================================= */}
        {/* PILLAR 3: COGNITION (BOTTOM RIGHT) */}
        <Node x={150} y={150} label="Cognition Core" glowColor="#f97316" subLabel="Execution & Output">
          <div className="w-20 h-20 bg-orange-500/5 border border-orange-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Cpu size={28} className="text-orange-500" />
          </div>
        </Node>

        {/* AI Engine (300, 150) */}
        <Node x={300} y={150} label="AI Models Engine" glowColor="#f97316">
          <div className="w-12 h-12 bg-orange-500/5 border border-orange-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Cpu size={20} className="text-orange-500" />
          </div>
        </Node>
        <Node x={370} y={80} label="Anthropic / OpenAI" glowColor="#f97316"><div className="w-4 h-4 bg-orange-500 border border-orange-300 rounded-full" /></Node>
        <Node x={370} y={220} label="Apify Actor" glowColor="#f97316"><div className="w-4 h-4 bg-orange-500 border border-orange-300 rounded-full" /></Node>
        <Node x={400} y={20} glowColor="#f97316" label="Claude 3.5 Sonnet"><div className="w-2 h-2 bg-orange-500/50 border border-orange-300/50 rounded-full" /></Node>
        <Node x={430} y={80} glowColor="#f97316" label="GPT-4o Mini"><div className="w-2 h-2 bg-orange-500/50 border border-orange-300/50 rounded-full" /></Node>
        <Node x={430} y={220} glowColor="#f97316" label="Meta Graph API"><div className="w-2 h-2 bg-orange-500/50 border border-orange-300/50 rounded-full" /></Node>
        <Node x={430} y={280} glowColor="#f97316" label="TikTok Scraper"><div className="w-2 h-2 bg-orange-500/50 border border-orange-300/50 rounded-full" /></Node>

        {/* Conversational Engine (250, 300) */}
        <Node x={250} y={300} label="Conversational Engine" glowColor="#f97316">
          <div className="w-12 h-12 bg-orange-500/5 border border-orange-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <MessageSquare size={20} className="text-orange-500" />
          </div>
        </Node>
        <Node x={200} y={380} label="WhatsApp Webview" glowColor="#f97316"><div className="w-4 h-4 bg-orange-500 border border-orange-300 rounded-full" /></Node>
        <Node x={300} y={380} label="Voice TTS" glowColor="#f97316"><div className="w-4 h-4 bg-orange-500 border border-orange-300 rounded-full" /></Node>

        {/* Admin Ops (100, 350) */}
        <Node x={100} y={350} label="Admin Operations" glowColor="#f97316">
          <div className="w-12 h-12 bg-orange-500/5 border border-orange-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Settings size={20} className="text-orange-500" />
          </div>
        </Node>
        <Node x={30} y={400} label="API Spending" glowColor="#f97316"><div className="w-4 h-4 bg-orange-500 border border-orange-300 rounded-full" /></Node>
        <Node x={150} y={430} label="Auth Context" glowColor="#f97316"><div className="w-4 h-4 bg-orange-500 border border-orange-300 rounded-full" /></Node>

"""

with open(r"c:\Users\yasso\.gemini\antigravity\scratch\tiktok-agent\components\NeuralGraph.tsx", "w", encoding="utf-8") as f:
    f.write(header + middle + footer)

