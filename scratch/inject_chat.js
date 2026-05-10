const fs = require('fs');

let pageContent = fs.readFileSync('app/page.tsx', 'utf8');

const dynamicChatHistory = `
          {messages.map((m, i) => {
            const isUser = m.role === "user";
            return (
              <div key={i} className={\`flex flex-col \${isUser ? 'items-end' : 'items-start'} gap-1\`}
                onMouseEnter={() => setHoverMsg(i)}
                onMouseLeave={() => setHoverMsg(null)}
              >
                <div 
                  onContextMenu={(e) => {
                    if (!isUser && !activeConvo.isAI) {
                      e.preventDefault();
                      setContextMenu({ msgIdx: i });
                    }
                  }}
                  className="relative group flex items-end gap-2"
                  style={{ flexDirection: isUser ? "row-reverse" : "row", maxWidth: "100%" }}
                >
                  <div className={\`\${isUser ? 'bg-[#333333] text-white rounded-t-2xl rounded-bl-2xl rounded-br-md border-none' : 'bg-white text-gray-800 rounded-t-2xl rounded-br-2xl rounded-bl-md border border-gray-100'} px-5 py-3 max-w-xl shadow-sm relative\`}>
                    {/* Attachment */}
                    {m.attachment && m.attachment.type === "image" && (
                      <img src={m.attachment.url} alt={m.attachment.name}
                        className="w-full max-w-[240px] rounded-xl block mb-2" />
                    )}
                    {m.attachment && m.attachment.type === "video" && (
                      <video src={m.attachment.url} controls
                        className="w-full max-w-[240px] rounded-xl block mb-2" />
                    )}
                    {m.attachment && m.attachment.type === "file" && (
                      <div className="flex items-center gap-2 px-2 py-1.5 mb-2">
                        <FileText size={18} color={isUser ? "#fff" : "var(--text-muted)"} />
                        <span className="text-xs font-semibold">{m.attachment.name}</span>
                      </div>
                    )}
                    {m.isForwarded && (
                      <div className={\`text-[10px] \${isUser ? "text-white/70" : "text-gray-400"} mb-1 italic flex items-center gap-1\`}>
                        <Forward size={10} /> Forwarded
                      </div>
                    )}
                    
                    {m.content && <MarkdownMessage content={m.content} />}
                    
                    {m.streaming && (
                      <span className="inline-block w-1.5 h-3.5 ml-1 bg-white/60 rounded-sm align-middle animate-pulse" />
                    )}

                    {/* Action Menu */}
                    <div className={\`absolute top-1/2 -translate-y-1/2 \${isUser ? 'right-full mr-2' : 'left-full ml-2'} flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity\`}>
                       <button onClick={() => handleForward(m.content)} title="Forward" className="p-1.5 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-sm border border-gray-100"><Forward size={12} /></button>
                       <button onClick={() => handleCopy(m.content)} title="Copy" className="p-1.5 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-sm border border-gray-100"><Copy size={12} /></button>
                       {isUser && (
                         <div className="relative">
                           <button onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === i ? null : i); }} title="More" className="p-1.5 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-sm border border-gray-100"><MoreHorizontal size={12} /></button>
                           {activeMenu === i && (
                             <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 rounded-xl p-1 shadow-md z-20 min-w-[100px]">
                               <button onClick={() => handleEdit(i, m.content)} className="w-full flex items-center gap-2 text-gray-700 text-xs py-2 px-3 hover:bg-gray-50 rounded-lg"><Pencil size={12}/> Edit</button>
                               <button onClick={() => handleDelete(i)} className="w-full flex items-center gap-2 text-red-500 text-xs py-2 px-3 hover:bg-red-50 rounded-lg"><Trash2 size={12}/> Delete</button>
                             </div>
                           )}
                         </div>
                       )}
                    </div>
                  </div>
                </div>

                {/* Reactions display */}
                {m.reactions && m.reactions.length > 0 && (
                  <div className={\`flex gap-1 mt-1 \${isUser ? 'mr-4' : 'ml-4'} flex-wrap\`}>
                    {m.reactions.map((r, ri) => (
                      <span key={ri} onClick={() => addReaction(i, r)}
                        className="text-xs cursor-pointer bg-white rounded-full px-2 py-0.5 border border-gray-100 shadow-sm"
                      >{r}</span>
                    ))}
                  </div>
                )}

                <div className={\`flex items-center gap-1 text-[10px] text-gray-400 \${isUser ? 'mr-2' : 'ml-2'}\`}>
                  {m.ts || now()}
                  {isUser && (
                    (!m.status || m.status === "seen") ? (
                      <CheckCheck size={12} className="text-blue-500" />
                    ) : m.status === "delivered" ? (
                      <CheckCheck size={12} className="text-gray-400" />
                    ) : (
                      <Check size={12} className="text-gray-400" />
                    )
                  )}
                </div>
              </div>
            );
          })}
          {streaming && (
            <div className="flex flex-col items-start gap-1">
              <div className="bg-white px-5 py-3 rounded-t-2xl rounded-br-2xl rounded-bl-md max-w-xl shadow-sm border border-gray-100 flex items-center gap-2 text-gray-500 text-sm">
                <Loader2 size={14} className="animate-spin" /> Thinking...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
`;

const dynamicInputArea = `<!--  Input Area  -->
<div className="absolute bottom-6 left-0 right-0 px-10">
  <div className="flex flex-col gap-2 relative">
    {/* Pending attachment preview */}
    {pendingAttachment && (
      <div className="bg-white rounded-2xl flex items-center gap-3 p-3 shadow-md border border-gray-100 max-w-sm self-end">
        {pendingAttachment.type === "image" && <img src={pendingAttachment.url} alt="" className="w-10 h-10 object-cover rounded-lg" />}
        {pendingAttachment.type === "video" && <Film size={18} className="text-gray-400" />}
        {pendingAttachment.type === "file" && <FileText size={18} className="text-gray-400" />}
        <span className="flex-1 text-xs text-gray-600 truncate">{pendingAttachment.name}</span>
        <button onClick={() => setPendingAttachment(null)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
      </div>
    )}

    {/* Emoji picker */}
    {showEmoji && (
      <div className="absolute bottom-full right-16 mb-2 bg-white border border-gray-100 rounded-2xl p-3 shadow-md flex flex-wrap gap-1 max-w-[200px] z-50">
        {EMOJIS.map(e => (
          <button key={e} onClick={() => { setInput(v => v + e); setShowEmoji(false); }}
            className="text-xl p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >{e}</button>
        ))}
      </div>
    )}

    {/* Forwarding Modal */}
    {forwardingMsg && (
      <div className="absolute bottom-full left-0 right-0 mb-4 bg-white rounded-2xl shadow-lg border border-gray-100 p-4 z-50 max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-gray-800 text-sm">Forward to...</h4>
          <button onClick={() => setForwardingMsg(null)} className="text-gray-400"><X size={16} /></button>
        </div>
        <div className="max-h-48 overflow-y-auto flex flex-col gap-2 mb-4">
          {conversations.filter(c => !c.isAI).map(c => (
            <label key={c.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl cursor-pointer">
              <input type="checkbox" className="rounded text-red-500 focus:ring-red-500"
                checked={selectedForwards.includes(c.id)}
                onChange={(e) => {
                  if (e.target.checked) setSelectedForwards(p => [...p, c.id]);
                  else setSelectedForwards(p => p.filter(id => id !== c.id));
                }}
              />
              <span className="text-sm font-medium text-gray-700">{c.name}</span>
            </label>
          ))}
        </div>
        <button 
          className="w-full bg-red-500 text-white rounded-xl py-2 text-sm font-bold disabled:opacity-50"
          disabled={selectedForwards.length === 0}
          onClick={() => confirmForward(selectedForwards)}
        >
          Send
        </button>
      </div>
    )}

    <div className="bg-white rounded-full flex items-center px-4 py-2 shadow-md border border-gray-100">
      <button onClick={() => fileInputRef.current?.click()} className="text-gray-400 hover:text-gray-600 p-2">
        <i className="fa-solid fa-plus"></i>
      </button>
      <input ref={fileInputRef} type="file" accept="image/*,video/*,.pdf,.doc,.docx,.txt" className="hidden" onChange={handleFile} />
      
      <button onClick={() => setShowEmoji(!showEmoji)} className={\`p-2 \${showEmoji ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}\`}>
        <Smile size={16} />
      </button>

      <input 
        className="flex-1 border-none focus:ring-0 bg-transparent text-center text-sm text-gray-600 placeholder-gray-400 mx-4" 
        placeholder={activeConvo.isAI ? "اسأل ساري..." : "Type your message"} 
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if(e.key === 'Enter') handleSend(); }}
      />
      <button 
        className="bg-[#333333] text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black transition-colors shrink-0"
        onClick={handleSend}
      >
        <i className="fa-regular fa-paper-plane text-xs"></i>
      </button>
    </div>
  </div>
</div>`;

pageContent = pageContent.replace(/<!--  Chat History  -->[\s\S]*?<!--  Input Area  -->/, `<!--  Chat History  -->
<div className="flex-1 overflow-y-auto px-10 pt-16 pb-32 flex flex-col gap-8">
${dynamicChatHistory}
</div>
<!--  Input Area  -->`);

pageContent = pageContent.replace(/<!--  Input Area  -->[\s\S]*?<\/main>/, dynamicInputArea + '\n</main>');

fs.writeFileSync('app/page.tsx', pageContent);
console.log("Injected chat history map and dynamic input into app/page.tsx");
