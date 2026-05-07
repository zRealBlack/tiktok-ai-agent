import re

with open(r"c:\Users\yasso\.gemini\antigravity\scratch\tiktok-agent\components\NeuralGraph.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# We want to replace everything from "          {/* Main Branches */}"
# to "      {/* UI Overlay Controls (Non-draggable) */}"

start_marker = "          {/* Main Branches */}"
end_marker = "      {/* UI Overlay Controls (Non-draggable) */}"

parts = content.split(start_marker)
header = parts[0]
footer = end_marker + parts[1].split(end_marker)[1]

new_middle = """          {/* Main Branches */}
          <path d="M 0 0 C -150 0, -250 0, -350 0" stroke="url(#glowPurple)" strokeWidth="3" fill="none" className="animate-[pulse_4s_ease-in-out_infinite]" />
          <path d="M 0 0 C 150 -50, 200 -150, 300 -250" stroke="url(#glowCyan)" strokeWidth="3" fill="none" className="animate-[pulse_3s_ease-in-out_infinite]" />
          <path d="M 0 0 C 150 50, 200 150, 300 250" stroke="url(#glowOrange)" strokeWidth="3" fill="none" className="animate-[pulse_3.5s_ease-in-out_infinite]" />
          
          {/* --- 1. MEMORY SUB-ROOTS (-350, 0) --- */}
          {/* To Persona (-500, -150) */}
          <path d="M -350 0 C -400 -50, -450 -100, -500 -150" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M -500 -150 C -550 -160, -600 -180, -650 -200" stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />
          <path d="M -500 -150 C -550 -150, -600 -150, -650 -150" stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />
          <path d="M -500 -150 C -550 -140, -600 -120, -650 -100" stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />
          
          {/* To Entities (-550, 0) */}
          <path d="M -350 0 C -400 0, -500 0, -550 0" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M -550 0 C -600 -10, -650 -20, -700 -20" stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />
          <path d="M -550 0 C -600 10, -650 20, -700 20" stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />
          <path d="M -550 0 C -600 30, -650 50, -700 60" stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />
          
          {/* To Storage (-500, 150) */}
          <path d="M -350 0 C -400 50, -450 100, -500 150" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M -500 150 C -550 140, -600 120, -650 100" stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />
          <path d="M -500 150 C -550 150, -600 150, -650 150" stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />
          <path d="M -500 150 C -550 160, -600 180, -650 200" stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />

          {/* --- 2. ANALYSIS SUB-ROOTS (300, -250) --- */}
          {/* To Video Analytics (400, -350) */}
          <path d="M 300 -250 C 330 -280, 360 -310, 400 -350" stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 400 -350 C 430 -370, 460 -390, 500 -400" stroke="rgba(6,182,212,0.2)" strokeWidth="1" fill="none" />
          <path d="M 400 -350 C 450 -350, 500 -350, 550 -350" stroke="rgba(6,182,212,0.2)" strokeWidth="1" fill="none" />
          <path d="M 400 -350 C 430 -330, 460 -310, 500 -300" stroke="rgba(6,182,212,0.2)" strokeWidth="1" fill="none" />

          {/* To Audio Processing (450, -200) */}
          <path d="M 300 -250 C 350 -230, 400 -210, 450 -200" stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 450 -200 C 500 -220, 550 -240, 600 -250" stroke="rgba(6,182,212,0.2)" strokeWidth="1" fill="none" />
          <path d="M 450 -200 C 500 -200, 550 -200, 600 -200" stroke="rgba(6,182,212,0.2)" strokeWidth="1" fill="none" />
          <path d="M 450 -200 C 500 -180, 550 -160, 600 -150" stroke="rgba(6,182,212,0.2)" strokeWidth="1" fill="none" />

          {/* To Content Metrics (400, -100) */}
          <path d="M 300 -250 C 330 -200, 360 -150, 400 -100" stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 400 -100 C 430 -110, 460 -120, 500 -130" stroke="rgba(6,182,212,0.2)" strokeWidth="1" fill="none" />
          <path d="M 400 -100 C 450 -90, 500 -80, 550 -70" stroke="rgba(6,182,212,0.2)" strokeWidth="1" fill="none" />

          {/* --- 3. COGNITION SUB-ROOTS (300, 250) --- */}
          {/* To AI Orchestration (400, 100) */}
          <path d="M 300 250 C 330 200, 360 150, 400 100" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 400 100 C 430 80, 460 60, 500 50" stroke="rgba(249,115,22,0.2)" strokeWidth="1" fill="none" />
          <path d="M 400 100 C 450 100, 500 100, 550 100" stroke="rgba(249,115,22,0.2)" strokeWidth="1" fill="none" />
          <path d="M 400 100 C 430 120, 460 140, 500 150" stroke="rgba(249,115,22,0.2)" strokeWidth="1" fill="none" />

          {/* To I/O Engines (450, 250) */}
          <path d="M 300 250 C 350 250, 400 250, 450 250" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 450 250 C 500 230, 550 210, 600 200" stroke="rgba(249,115,22,0.2)" strokeWidth="1" fill="none" />
          <path d="M 450 250 C 500 250, 550 250, 600 250" stroke="rgba(249,115,22,0.2)" strokeWidth="1" fill="none" />
          <path d="M 450 250 C 500 270, 550 290, 600 300" stroke="rgba(249,115,22,0.2)" strokeWidth="1" fill="none" />

          {/* To System Constraints (400, 400) */}
          <path d="M 300 250 C 330 300, 360 350, 400 400" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 400 400 C 430 380, 460 360, 500 350" stroke="rgba(249,115,22,0.2)" strokeWidth="1" fill="none" />
          <path d="M 400 400 C 450 400, 500 400, 550 400" stroke="rgba(249,115,22,0.2)" strokeWidth="1" fill="none" />
          <path d="M 400 400 C 430 420, 460 440, 500 450" stroke="rgba(249,115,22,0.2)" strokeWidth="1" fill="none" />
        </svg>

        {/* --- NODES --- */}
        
        {/* Core Brain Node (mix-blend-mode: screen is critical here!) */}
        <Node x={0} y={0} label="Sarie Central Intelligence" glowColor="#ef4444" subLabel="Core Hub">
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
            {/* 3-Point Color Overlay */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                mixBlendMode: 'screen',
                background: `
                  radial-gradient(circle at 10% 50%, #a855f7 0%, transparent 70%),
                  radial-gradient(circle at 80% 10%, #06b6d4 0%, transparent 70%),
                  radial-gradient(circle at 80% 90%, #f97316 0%, transparent 70%)
                `
              }}
            />
          </div>
        </Node>

        {/* ======================================================= */}
        {/* 1. MEMORY VAULT (PURPLE) */}
        {/* ======================================================= */}
        <Node x={-350} y={0} label="Memory" glowColor="#a855f7" subLabel="Persona & History">
          <div className="w-16 h-16 bg-purple-500/5 border border-purple-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Database size={24} className="text-purple-500" />
          </div>
        </Node>

        {/* Persona */}
        <Node x={-500} y={-150} label="Persona Identity" glowColor="#a855f7">
           <div className="w-6 h-6 bg-purple-500/20 border border-purple-500/40 rounded-full shadow-[0_0_10px_#a855f7]" />
        </Node>
        <Node x={-650} y={-200} glowColor="#a855f7" label="Appearance: Male">
           <div className="w-2 h-2 bg-purple-500/50 border border-purple-300/50 rounded-full" />
        </Node>
        <Node x={-650} y={-150} glowColor="#a855f7" label="Character: Friendly & Direct">
           <div className="w-2 h-2 bg-purple-500/50 border border-purple-300/50 rounded-full" />
        </Node>
        <Node x={-650} y={-100} glowColor="#a855f7" label="Hopes: Scale Content">
           <div className="w-2 h-2 bg-purple-500/50 border border-purple-300/50 rounded-full" />
        </Node>

        {/* Entities */}
        <Node x={-550} y={0} label="Entities & Targets" glowColor="#a855f7">
           <div className="w-6 h-6 bg-purple-500/20 border border-purple-500/40 rounded-full shadow-[0_0_10px_#a855f7]" />
        </Node>
        <Node x={-700} y={-20} glowColor="#a855f7" label="Client: @rasayel_podcast">
           <div className="w-2 h-2 bg-purple-500/50 border border-purple-300/50 rounded-full" />
        </Node>
        {TEAM_MEMBERS.map((user, i) => (
           <Node key={`team-${user.id}`} x={-700} y={20 + (i * 40)} glowColor="#a855f7" label={`Team: ${user.name} (${user.role})`}>
             <div className="w-2 h-2 bg-purple-500/50 border border-purple-300/50 rounded-full" />
           </Node>
        ))}

        {/* Data Storage */}
        <Node x={-500} y={150} label="Storage Systems" glowColor="#a855f7">
           <div className="w-6 h-6 bg-purple-500/20 border border-purple-500/40 rounded-full shadow-[0_0_10px_#a855f7]" />
        </Node>
        <Node x={-650} y={100} glowColor="#a855f7" label="Upstash KV Vector Sync">
           <div className="w-2 h-2 bg-purple-500/50 border border-purple-300/50 rounded-full" />
        </Node>
        <Node x={-650} y={150} glowColor="#a855f7" label="Session IndexedDB">
           <div className="w-2 h-2 bg-purple-500/50 border border-purple-300/50 rounded-full" />
        </Node>
        <Node x={-650} y={200} glowColor="#a855f7" label="Cached Transcript Hooks">
           <div className="w-2 h-2 bg-purple-500/50 border border-purple-300/50 rounded-full" />
        </Node>

        {/* ======================================================= */}
        {/* 2. ANALYSIS ENGINE (CYAN) */}
        {/* ======================================================= */}
        <Node x={300} y={-250} label="Analysis" glowColor="#06b6d4" subLabel="Audits & Metrics">
          <div className="w-16 h-16 bg-cyan-500/5 border border-cyan-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <TrendingUp size={24} className="text-cyan-500" />
          </div>
        </Node>

        {/* Video Analytics */}
        <Node x={400} y={-350} label="Video Audits" glowColor="#06b6d4">
           <div className="w-6 h-6 bg-cyan-500/20 border border-cyan-500/40 rounded-full shadow-[0_0_10px_#06b6d4]" />
        </Node>
        <Node x={500} y={-400} glowColor="#06b6d4" label="Object Recognition">
           <div className="w-2 h-2 bg-cyan-500/50 border border-cyan-300/50 rounded-full" />
        </Node>
        <Node x={550} y={-350} glowColor="#06b6d4" label="Facial Expressions">
           <div className="w-2 h-2 bg-cyan-500/50 border border-cyan-300/50 rounded-full" />
        </Node>
        <Node x={500} y={-300} glowColor="#06b6d4" label="Scene Pacing Changes">
           <div className="w-2 h-2 bg-cyan-500/50 border border-cyan-300/50 rounded-full" />
        </Node>

        {/* Audio Processing */}
        <Node x={450} y={-200} label="Audio & NLP" glowColor="#06b6d4">
           <div className="w-6 h-6 bg-cyan-500/20 border border-cyan-500/40 rounded-full shadow-[0_0_10px_#06b6d4]" />
        </Node>
        <Node x={600} y={-250} glowColor="#06b6d4" label="Whisper Transcripts">
           <div className="w-2 h-2 bg-cyan-500/50 border border-cyan-300/50 rounded-full" />
        </Node>
        <Node x={600} y={-200} glowColor="#06b6d4" label="Sentiment Polarity">
           <div className="w-2 h-2 bg-cyan-500/50 border border-cyan-300/50 rounded-full" />
        </Node>
        <Node x={600} y={-150} glowColor="#06b6d4" label="Tone Audits">
           <div className="w-2 h-2 bg-cyan-500/50 border border-cyan-300/50 rounded-full" />
        </Node>

        {/* Content Metrics */}
        <Node x={400} y={-100} label="Content Metrics" glowColor="#06b6d4">
           <div className="w-6 h-6 bg-cyan-500/20 border border-cyan-500/40 rounded-full shadow-[0_0_10px_#06b6d4]" />
        </Node>
        <Node x={500} y={-130} glowColor="#06b6d4" label="1.2M Views Analyzed">
           <div className="w-2 h-2 bg-cyan-500/50 border border-cyan-300/50 rounded-full" />
        </Node>
        <Node x={550} y={-70} glowColor="#06b6d4" label="Engagement Velocity">
           <div className="w-2 h-2 bg-cyan-500/50 border border-cyan-300/50 rounded-full" />
        </Node>

        {/* ======================================================= */}
        {/* 3. COGNITION CORE (ORANGE) */}
        {/* ======================================================= */}
        <Node x={300} y={250} label="Cognition" glowColor="#f97316" subLabel="AI & Execution">
          <div className="w-16 h-16 bg-orange-500/5 border border-orange-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Cpu size={24} className="text-orange-500" />
          </div>
        </Node>

        {/* AI Orchestration */}
        <Node x={400} y={100} label="AI Orchestration" glowColor="#f97316">
           <div className="w-6 h-6 bg-orange-500/20 border border-orange-500/40 rounded-full shadow-[0_0_10px_#f97316]" />
        </Node>
        <Node x={500} y={50} glowColor="#f97316" label="Claude 3.5 Sonnet">
           <div className="w-2 h-2 bg-orange-500/50 border border-orange-300/50 rounded-full" />
        </Node>
        <Node x={550} y={100} glowColor="#f97316" label="GPT-4o Mini">
           <div className="w-2 h-2 bg-orange-500/50 border border-orange-300/50 rounded-full" />
        </Node>
        <Node x={500} y={150} glowColor="#f97316" label="Fallback Inference">
           <div className="w-2 h-2 bg-orange-500/50 border border-orange-300/50 rounded-full" />
        </Node>

        {/* I/O Engines */}
        <Node x={450} y={250} label="I/O Pipelines" glowColor="#f97316">
           <div className="w-6 h-6 bg-orange-500/20 border border-orange-500/40 rounded-full shadow-[0_0_10px_#f97316]" />
        </Node>
        <Node x={600} y={200} glowColor="#f97316" label="Apify Meta Scraper">
           <div className="w-2 h-2 bg-orange-500/50 border border-orange-300/50 rounded-full" />
        </Node>
        <Node x={600} y={250} glowColor="#f97316" label="Voice TTS Engine">
           <div className="w-2 h-2 bg-orange-500/50 border border-orange-300/50 rounded-full" />
        </Node>
        <Node x={600} y={300} glowColor="#f97316" label="WhatsApp Webview">
           <div className="w-2 h-2 bg-orange-500/50 border border-orange-300/50 rounded-full" />
        </Node>

        {/* System Constraints */}
        <Node x={400} y={400} label="System Op-Params" glowColor="#f97316">
           <div className="w-6 h-6 bg-orange-500/20 border border-orange-500/40 rounded-full shadow-[0_0_10px_#f97316]" />
        </Node>
        <Node x={500} y={350} glowColor="#f97316" label="Global Auth Context">
           <div className="w-2 h-2 bg-orange-500/50 border border-orange-300/50 rounded-full" />
        </Node>
        <Node x={550} y={400} glowColor="#f97316" label="API Rate Limits">
           <div className="w-2 h-2 bg-orange-500/50 border border-orange-300/50 rounded-full" />
        </Node>
        <Node x={500} y={450} glowColor="#f97316" label="Security Context">
           <div className="w-2 h-2 bg-orange-500/50 border border-orange-300/50 rounded-full" />
        </Node>

      </div>
"""

with open(r"c:\Users\yasso\.gemini\antigravity\scratch\tiktok-agent\components\NeuralGraph.tsx", "w", encoding="utf-8") as f:
    f.write(header + new_middle + "\n" + footer)

