const fs = require('fs');

const dashboardPath = 'c:\\Users\\harsh\\NEO\\neoai\\src\\components\\dashboard.tsx';
let code = fs.readFileSync(dashboardPath, 'utf8');

// 1. Add import
code = code.replace(
  'import * as React from "react"',
  'import * as React from "react"\nimport { useNeo } from "./neo-core"'
);

// 2. Remove mock data
code = code.replace(/(\/\/ TYPES & MOCK DATA[\s\S]*?)export function NeoDashboard/m, 'export function NeoDashboard');

// 3. Replace state block
const stateAndLoadRegex = /\/\/ STATE[\s\S]*?if \(\!mounted\) return <div className="h-screen w-full bg-\[#050505\]" \/>/m;

const newStateCode = `    // STATE
    const [mounted, setMounted] = useState(false)
    const [isMeetingMode, setIsMeetingMode] = useState(false)
    const [isOpenCommand, setIsOpenCommand] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [activeTab, setActiveTab] = useState("home")

    // User Identity State
    const [userName, setUserName] = useState("Operator 01")
    const [userPfp, setUserPfp] = useState("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80")
    const [neoName, setNeoName] = useState("Terminal Neo")
    const [neoPfp, setNeoPfp] = useState("")

    // Layout Refs
    const leftPanelRef = useRef<any>(null)
    const [isLeftCollapsed, setIsLeftCollapsed] = useState(false)

    const {
        chats,
        currentChat,
        setCurrentChatId,
        createNewChat,
        sendMessage,
        message,
        setMessage,
        chatEndRef
    } = useNeo()

    // INITIAL LOAD
    useEffect(() => {
        setMounted(true)
        const savedIdentity = localStorage.getItem("neo_identity")
        if (savedIdentity) {
            const { userName, userPfp, neoName, neoPfp } = JSON.parse(savedIdentity)
            if (userName) setUserName(userName)
            if (userPfp) setUserPfp(userPfp)
            if (neoName) setNeoName(neoName)
            if (neoPfp !== undefined) setNeoPfp(neoPfp)
        }

        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setIsOpenCommand((open) => !open)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    useEffect(() => {
        if (mounted) {
            localStorage.setItem("neo_identity", JSON.stringify({ userName, userPfp, neoName, neoPfp }))
        }
    }, [userName, userPfp, neoName, neoPfp, mounted])

    if (!mounted) return <div className="h-screen w-full bg-[#050505]" />`;

code = code.replace(stateAndLoadRegex, newStateCode);

// 4. Command Palette update
code = code.replace(
  /sessions\.map\(s => \([\s\S]*?\}\)/m,
  `chats.map(s => (
                                <CommandItem key={s.id} onSelect={() => { setCurrentChatId(s.id); setIsOpenCommand(false) }}>
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    <span>{s.title}</span>
                                </CommandItem>
                            ))`
);

// 5. Build Middle Panel replacement
const middlePanelReplacement = `{/* 2. MIDDLE: ARCHIVES (CONTENT INDEX) */}
                <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-[#080808]">
                    <div className="flex flex-col h-full shadow-2xl p-4 space-y-3">
                        <button onClick={createNewChat} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-[0.2em] py-3 rounded-xl shadow-lg transition-all active:scale-95 text-[11px]">
                            + New Cycle
                        </button>
                        <ScrollArea className="flex-1 mt-4 text-slate-500 pr-2">
                            <div className="space-y-2">
                                {chats.map(chat => (
                                    <div
                                        key={chat.id}
                                        onClick={() => setCurrentChatId(chat.id)}
                                        className={\`p-3 rounded-xl cursor-pointer transition-all border border-transparent \${
                                            currentChat?.id === chat.id 
                                            ? 'bg-blue-600/10 text-white border-blue-600/30 shadow-[0_4px_20px_rgba(0,0,0,0.5)]' 
                                            : 'hover:bg-white/[0.03] text-slate-500 hover:text-slate-300'
                                        }\`}
                                    >
                                        <div className="text-[13px] font-bold truncate leading-tight">{chat.title || "New Session"}</div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </ResizablePanel>

                <ResizableHandle withHandle className="bg-white/5 w-[1px]" />`;

const middlePanelRegex = /\{\/\* 2\. MIDDLE: ARCHIVES \(CONTENT INDEX\) \*\}[\s\S]*?<\/ResizablePanel>\s*<ResizableHandle withHandle className="bg-white\/5 w-\[1px\]" \/>/;

code = code.replace(/\{\/\* 2\. MIDDLE: ARCHIVES \(CONTENT INDEX\) \*\/\}[\s\S]*?<\/ResizablePanel>\s*<ResizableHandle withHandle className="bg-white\/5 w-\[1px\]" \/>/m, middlePanelReplacement);


// 6. Fix Main Panel. Replace everything inside `<div className="flex-1 flex flex-col border-r border-white/5 relative">`
// up to the <ResizablePanel defaultSize={76}> end.
const mainPanelReplacement = `                        {/* 3.1 CHAT CORE */}
                        <div className="flex-1 flex flex-col relative w-full">
                            <Menubar className="h-16 border-b border-white/5 bg-[#050505]/80 backdrop-blur-3xl px-8 flex justify-between rounded-none border-t-0 border-x-0">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
                                        <span className="text-[12px] font-black uppercase text-white tracking-[0.3em]">{currentChat?.title || "New Chat"}</span>
                                    </div>
                                </div>
                            </Menubar>

                            <div className="flex-1 overflow-y-auto p-10 space-y-6 flex flex-col">
                                {currentChat?.messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={\`flex max-w-[80%] px-6 py-4 rounded-[2rem] \${
                                    msg.role === "user"
                                        ? "bg-white/[0.03] text-slate-300 ml-auto rounded-tr-none border-r border-white/5 shadow-2xl"
                                        : "bg-[#0A0A0A] text-slate-200 rounded-tl-none border-l-2 border-l-blue-600/50 shadow-2xl"
                                    }\`}
                                >
                                    <div className="prose prose-invert leading-[1.8] text-[15px] font-medium opacity-90 tracking-wide">
                                    {msg.text}
                                    </div>
                                </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Input Engine */}
                            <div className="p-10 bg-[#050505] border-t border-white/5 shadow-2xl">
                                <div className="max-w-4xl mx-auto flex gap-4">
                                <input
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                                    className="flex-1 bg-[#0A0A0A] border border-white/5 rounded-2xl px-6 py-4 text-[15px] font-medium text-slate-300 focus:bg-[#0D0D0D] transition-all focus:ring-1 focus:ring-blue-600/30 shadow-inner outline-none placeholder:text-slate-600"
                                    placeholder="Type message..."
                                />
                                <button 
                                    onClick={sendMessage} 
                                    disabled={!message.trim()}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all active:scale-95"
                                >
                                    Compute
                                </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </ResizablePanel>`;

code = code.replace(/\{\/\* 3\.1 CHAT CORE \*\/\}[\s\S]*?<\/ResizablePanel>/m, mainPanelReplacement);

fs.writeFileSync(dashboardPath, code, 'utf8');
console.log("Rewritten dashboard.tsx");
