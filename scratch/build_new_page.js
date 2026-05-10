const fs = require('fs');

const pageContent = fs.readFileSync('app/chat/page.tsx', 'utf8');
const stitchJsx = fs.readFileSync('scratch/stitch_ui.jsx', 'utf8');
const stitchHtml = fs.readFileSync('scratch/stitch_ui_utf8.html', 'utf8');

// Extract the <style> block from the HTML to put in globals.css or inject into the JSX
const styleMatch = stitchHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/);
const customStyle = styleMatch ? styleMatch[1] : '';

// Let's create a new page component that integrates the Stitch UI.
// We'll replace the return statement of ChatPageInner.

const returnMatch = pageContent.match(/return\s*\(\s*<>\s*<div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0 overflow-hidden pb-4 pr-4 pl-4 md:pl-0 box-border">([\s\S]*?)<\/>\s*\);\s*}/);

if (!returnMatch) {
  console.log("Could not find the return statement to replace.");
}

// Build the new return statement
let newReturn = `return (
    <>
      <style dangerouslySetInnerHTML={{__html: \`${customStyle.replace(/`/g, '\\`')}\`}} />
      <div className="flex items-center justify-center min-h-screen w-full" style={{
         backgroundImage: "url(https://lh3.googleusercontent.com/aida/ADBb0uhCilLHmLfDhPMwiCs2nL08qwA6V4xXkJYQ4KtwbpzOH62ThNmDWsEtxzYscnGYjlnkSs9KqANozl3XsH_1co8MEq1TXxitKN8M_ZLcIfMUc-DYny0LMDOLM5Tt0mMigyTZCfAzzVB91vXKYlO7L7hsdofrt6vkvAAaiwsKoPmx8H-JHJyiR5sM-gNy-r6UYF4_Z61SW9RSycIBI7sRuqVXMtbvBMHknTg4V6fzeOS9J6BZeTdDTHgVCjdnfkDJv5uefwuLfcCg)",
         backgroundSize: "cover",
         backgroundPosition: "center",
         fontFamily: "'Inter', sans-serif"
      }}>
        ${stitchJsx}
      </div>
    </>
  );
}`;

// Now we need to weave the React logic into stitchJsx
// The input field:
let dynamicJsx = stitchJsx
  // Replace input with our controlled input
  .replace(/<input className="flex-1 border-none focus:ring-0 bg-transparent text-center text-sm text-gray-600 placeholder-gray-400 mx-4" placeholder="Type your prompt" type="text"\/>/g, 
  `<input 
    className="flex-1 border-none focus:ring-0 bg-transparent text-center text-sm text-gray-600 placeholder-gray-400 mx-4" 
    placeholder="Type your prompt" 
    type="text"
    value={input}
    onChange={(e) => setInput(e.target.value)}
    onKeyDown={(e) => { if(e.key === 'Enter') handleSend(); }}
  />`)
  // Replace the send button
  .replace(/<button className="bg-\[#333333\] text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black transition-colors">\s*<i className="fa-regular fa-paper-plane text-xs"><\/i>\s*<\/button>/g,
  `<button 
    className="bg-[#333333] text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black transition-colors"
    onClick={handleSend}
   >
    <i className="fa-regular fa-paper-plane text-xs"></i>
  </button>`)
  // Replace the chat history with our mapped messages
  .replace(/<!--  Chat History  -->[\s\S]*?<!--  Input Area  -->/g, 
  `<!--  Chat History  -->
  <div className="flex-1 overflow-y-auto px-10 pt-16 pb-32 flex flex-col gap-8" ref={bottomRef}>
    {messages.map((m, i) => {
      const isUser = m.role === "user";
      return (
        <div key={i} className={\`flex flex-col \${isUser ? 'items-end' : 'items-start'} gap-1\`}>
          {isUser ? (
            <div className="bg-[#333333] text-white px-5 py-3 rounded-t-2xl rounded-bl-2xl rounded-br-md max-w-xl shadow-sm">
              <MarkdownMessage content={m.content} />
            </div>
          ) : (
            <div className="bg-white px-5 py-3 rounded-t-2xl rounded-br-2xl rounded-bl-md max-w-xl shadow-sm border border-gray-100">
              <MarkdownMessage content={m.content} />
            </div>
          )}
          <span className={\`text-[10px] text-gray-400 \${isUser ? 'mr-2' : 'ml-2'}\`}>{m.ts || now()}</span>
        </div>
      );
    })}
    {streaming && (
       <div className="flex flex-col items-start gap-1">
          <div className="bg-white px-5 py-3 rounded-t-2xl rounded-br-2xl rounded-bl-md max-w-xl shadow-sm border border-gray-100">
            <Loader2 className="animate-spin text-gray-400" size={16} />
          </div>
       </div>
    )}
  </div>
  <!--  Input Area  -->`)
  // Make the Team Members list dynamic
  .replace(/<!--  Team Members List  -->[\s\S]*?<\/aside>/g,
  `<!--  Team Members List  -->
  <div className="space-y-4 mt-2">
    {computedConversations.filter(c => !c.isAI).map(c => (
      <div 
        key={c.id} 
        className={\`flex items-center gap-3 p-2 hover:bg-white rounded-xl cursor-pointer transition-colors \${activeId === c.id ? 'bg-white shadow-sm' : ''}\`}
        onClick={() => setActiveId(c.id)}
      >
        <div className="relative">
          <AvatarCircle name={c.name} size={32} online={c.online} />
          {c.online && <div className="status-indicator status-online"></div>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline">
            <h4 className="text-xs font-semibold text-gray-800 truncate">{c.name}</h4>
            <span className="text-[9px] text-gray-400">{c.time}</span>
          </div>
          <p className="text-[11px] text-gray-500 truncate">{c.lastMessage || '...'}</p>
        </div>
      </div>
    ))}
  </div>
</aside>`);

// Also map the AI conversation to the "New Chat" button so clicking it selects Sarie
dynamicJsx = dynamicJsx.replace(/<button className="w-full bg-\[#2b2b2b\] text-white rounded-full py-2.5 px-4 flex items-center justify-center gap-2 text-sm font-medium hover:bg-black transition-colors shrink-0">/g,
`<button 
   className="w-full bg-[#2b2b2b] text-white rounded-full py-2.5 px-4 flex items-center justify-center gap-2 text-sm font-medium hover:bg-black transition-colors shrink-0"
   onClick={() => setActiveId('sarie')}
>`);

// Top bar active name
dynamicJsx = dynamicJsx.replace(/<span className="text-\[#ef4444\] font-bold text-sm tracking-wider mr-1">MAS<\/span> AI Studio Workspace/g,
`<span className="text-[#ef4444] font-bold text-sm tracking-wider mr-1">MAS</span> {activeConvo.name} <span className="text-xs ml-2 text-gray-400">({activeConvo.role || 'Chat'})</span>`);

const newPageContent = pageContent.substring(0, returnMatch.index) + newReturn.replace('${stitchJsx}', dynamicJsx);

fs.writeFileSync('scratch/new_page.tsx', newPageContent);
console.log("Wrote scratch/new_page.tsx");
