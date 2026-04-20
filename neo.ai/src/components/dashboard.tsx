"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup
} from "@/components/ui/resizable"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider
} from "@/components/ui/sidebar"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Empty,
    EmptyHeader,
    EmptyTitle,
    EmptyDescription
} from "@/components/ui/empty"
import {
    Field,
    FieldLabel,
    FieldDescription,
    FieldGroup
} from "@/components/ui/field"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput
} from "@/components/ui/input-group"
import {
    Item,
    ItemTitle,
    ItemDescription,
    ItemContent
} from "@/components/ui/item"
import { Label } from "@/components/ui/label"
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarTrigger,
} from "@/components/ui/menubar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Toggle } from "@/components/ui/toggle"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ButtonGroup } from "@/components/ui/button-group"

import {
    MessageSquare,
    Plus,
    Video,
    Calendar,
    Trophy,
    Bookmark,
    Share2,
    ChevronRight,
    Search,
    Clock,
    User,
    Smile,
    Table as TableIcon,
    BarChart3,
    Image as ImageIcon,
    Settings,
    LayoutDashboard,
    Bell,
    CheckCircle2,
    Trash2,
    MoreVertical,
    Mic,
    Paperclip,
    Terminal,
    AlertCircle,
    HelpCircle,
    ChevronDown,
    Globe,
    Zap,
    Cpu,
    Activity,
    Lock,
    Info,
    Menu
} from "lucide-react"

// TYPES & MOCK DATA
interface Message {
    role: "neo" | "user"
    content: string
    type?: "text" | "table" | "chart" | "image" | "skeleton"
    data?: any
    bookmarked?: boolean
    timestamp?: string
}

interface ChatSession {
    id: string
    title: string
    date: string
    messages: Message[]
    summary: string
    isMeeting: boolean
    attendees?: string[]
}

const DUMMY_SESSIONS: ChatSession[] = [
    {
        id: "1",
        title: "Quantum Strategy Sync",
        date: "2026-03-28",
        isMeeting: true,
        summary: "Finalizing the 2026 neural roadmap with focus on AI scalability and dark-matter logic.",
        messages: [
            { role: "neo", content: "Neutral networks initialized, kiri. I'm ready to capture the strategy discussion. Who's leading the core sync today? 🚀", timestamp: "10:00 AM" }
        ],
        attendees: ["kiri", "Alex", "Neo AI"]
    },
    {
        id: "2",
        title: "Interface Refinement",
        date: "2026-03-27",
        isMeeting: false,
        summary: "Applying deep dark aesthetics across all 34 core modules.",
        messages: [
            { role: "neo", content: "The dark evolution is complete. All 34 components are now harmonized for your terminal. Ready for field testing? 💡", timestamp: "02:15 PM" }
        ]
    }
]

export function NeoDashboard() {
    // STATE
    const [mounted, setMounted] = useState(false)
    const [sessions, setSessions] = useState<ChatSession[]>([])
    const [currentSessionId, setCurrentSessionId] = useState<string>("")
    const [input, setInput] = useState("")
    const [isMeetingMode, setIsMeetingMode] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const [summaryView, setSummaryView] = useState<"general" | "team">("general")
    const [isOpenCommand, setIsOpenCommand] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [activeTab, setActiveTab] = useState("home")

    // User Identity State
    const [userName, setUserName] = useState("kiri")
    const [userPfp, setUserPfp] = useState("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80")
    const [neoName, setNeoName] = useState("Terminal Neo")
    const [neoPfp, setNeoPfp] = useState("")

    // Attachments State
    const [attachments, setAttachments] = useState<{ name: string; type: "image" | "doc" | "video"; url?: string }[]>([])

    // Layout Refs
    const leftPanelRef = useRef<any>(null)
    const archivePanelRef = useRef<any>(null)
    const chatPanelRef = useRef<any>(null)
    const rightPanelRef = useRef<any>(null)
    const [isLeftCollapsed, setIsLeftCollapsed] = useState(true)
    const [isArchiveCollapsed, setIsArchiveCollapsed] = useState(true)
    const [isRightCollapsed, setIsRightCollapsed] = useState(true)
    const [selectedDay, setSelectedDay] = useState(6) // Default to today (last index)

    const days = [
        { day: "TUE", date: "24" },
        { day: "WED", date: "25" },
        { day: "THU", date: "26" },
        { day: "FRI", date: "27" },
        { day: "SAT", date: "28" },
        { day: "SUN", date: "29" },
        { day: "MON", date: "30" }
    ]

    const scrollRef = useRef<HTMLDivElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
        }, 150)
    }

    useEffect(() => {
        scrollToBottom()
    }, [sessions, currentSessionId, isTyping])

    // 1. INITIAL MOUNT & INTELLIGENCE RECOVERY
    useEffect(() => {
        setMounted(true)
        const saved = localStorage.getItem("neo_sessions_v5")
        let baseSessions = DUMMY_SESSIONS
        
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                if (Array.isArray(parsed) && parsed.length > 0) {
                    baseSessions = parsed
                }
            } catch (e) {
                console.error("Neural recovery failed", e)
            }
        }

        // AUTO-FRESH: Always start with a new cycle on launch
        const freshCycle: ChatSession = {
            id: Date.now().toString(),
            title: `Fresh Cycle ${baseSessions.length + 1}`,
            date: new Date().toISOString().split('T')[0],
            isMeeting: false,
            summary: "Neural start-up: sequence optimized and memory trace active.",
            messages: [{ 
                role: "neo", 
                content: "Neural uplink established. Ready for input, kiri.", 
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            }]
        }

        const finalSessions = [freshCycle, ...baseSessions]
        setSessions(finalSessions)
        setCurrentSessionId(freshCycle.id)

        // Recovery Identity
        const savedIdentity = localStorage.getItem("neo_identity")
        if (savedIdentity) {
            const parsedIdentity = JSON.parse(savedIdentity)
            if (parsedIdentity.userName) setUserName(parsedIdentity.userName)
            if (parsedIdentity.userPfp) setUserPfp(parsedIdentity.userPfp)
            if (parsedIdentity.neoName) setNeoName(parsedIdentity.neoName)
            if (parsedIdentity.neoPfp !== undefined) setNeoPfp(parsedIdentity.neoPfp)
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

    // 2. REAL-TIME INTELLIGENCE SYNC (PERSISTENCE)
    useEffect(() => {
        if (mounted && sessions.length > 0) {
            localStorage.setItem("neo_sessions_v5", JSON.stringify(sessions))
        }
    }, [sessions, mounted])

    useEffect(() => {
        if (mounted) {
            localStorage.setItem("neo_identity", JSON.stringify({ userName, userPfp, neoName, neoPfp }))
        }
    }, [userName, userPfp, neoName, neoPfp, mounted])

    const currentSession = sessions.find(s => s.id === currentSessionId)

    // UTILITIES
    const parseNeoResponse = (content: string): Partial<Message> => {
        // Look for JSON chart blocks: ```json { "type": "chart", "data": [...] } ```
        const chartRegex = /```json\s*([\s\S]*?)\s*```/g
        let match
        let lastMatch = null

        while ((match = chartRegex.exec(content)) !== null) {
            try {
                const parsed = JSON.parse(match[1])
                if (parsed.type === "chart" || parsed.type === "table") {
                    lastMatch = parsed
                }
            } catch (e) {
                // Not the JSON we're looking for or malformed
            }
        }

        if (lastMatch) {
            // Clean up the content to remove the extracted JSON block if desired, 
            // but for now we'll just keep it and let the UI render the specialized component.
            return {
                type: lastMatch.type as Message["type"],
                data: lastMatch.data,
                content: content.replace(chartRegex, "").trim() || content
            }
        }

        return { content }
    }

    // LOGIC
    const handleSend = async () => {
        if ((!input.trim() && attachments.length === 0) || !currentSessionId || isTyping) return

        const userMsg: Message = {
            role: "user",
            content: input.trim() || (attachments.length > 0 ? `Sent ${attachments.length} attachment(s)` : ""),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            data: attachments.length > 0 ? { attachments: [...attachments] } : undefined
        }

        setInput("")
        setAttachments([])
        
        const updatedHistory = currentSession?.messages.concat(userMsg) || [userMsg]
        setSessions(prev => prev.map(s => {
            if (s.id === currentSessionId) {
                return { ...s, messages: updatedHistory }
            }
            return s
        }))

        setIsTyping(true)

        try {
            // Mapping 'neo' to 'assistant' and purifying for the API
            const messages = updatedHistory.map(m => ({
                role: m.role === "neo" ? "assistant" : m.role,
                content: m.content
            }))

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages }),
            })

            if (!response.ok) throw new Error("Neural link failed.")

            const rawData = await response.json()
            const parsedData = { 
                ...rawData, 
                ...parseNeoResponse(rawData.content),
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }

            setSessions(prev => prev.map(s => {
                if (s.id === currentSessionId) {
                    const newMessages = [...s.messages, parsedData as Message]
                    return {
                        ...s,
                        messages: newMessages,
                        summary: updateSummary(newMessages)
                    }
                }
                return s
            }))
            toast.success("Intelligence updated.")
        } catch (error) {
            toast.error("Network synchronization failed.")
            console.error(error)
        } finally {
            setIsTyping(false)
        }
    }

    const generateNeoResponse = (userInput: string): Message => {
        const lower = userInput.toLowerCase()
        let content = "Processing at the edge. Intelligence applied. 🛸"
        let type: Message["type"] = "text"
        let data: any = null

        if (lower.includes("table")) {
            content = "Extracted data matrix for the current cycle. 📊"
            type = "table"
            data = [
                { Module: "Core-01", Status: "Stable", Latency: "12ms" },
                { Module: "Neural-04", Status: "Active", Latency: "45ms" },
                { Module: "Sync-09", Status: "Optimizing", Latency: "28ms" }
            ]
        } else if (lower.includes("chart")) {
            content = "Current engagement velocity visualized. 📈"
            type = "chart"
        } else if (lower.includes("joke")) {
            content = "I told my computer I needed a break, and it gave me a 404. I guess it couldn't find my patience! 😂"
        }

        return { role: "neo", content, type, data, timestamp: "Just now" }
    }

    const updateSummary = (messages: Message[]) => {
        const lastMsg = messages[messages.length - 1].content
        return `Systemic evolution of ${lastMsg.slice(0, 30)}... with 100% dark theme coverage achieved.`
    }

    const deleteSession = (id: string) => {
        const filtered = sessions.filter(s => s.id !== id)
        setSessions(filtered)
        if (currentSessionId === id && filtered.length > 0) {
            setCurrentSessionId(filtered[0].id)
        }
    }

    const [isZenMode, setIsZenMode] = useState(true)

    const toggleSidebars = () => {
        if (isZenMode) {
            // Rebalanced Hyper-Scale Dimensions for unified expansion
            leftPanelRef.current?.expand(15)
            archivePanelRef.current?.expand(40)
            rightPanelRef.current?.expand(40)
            setIsZenMode(false)
            setIsLeftCollapsed(false)
            setIsArchiveCollapsed(false)
            setIsRightCollapsed(false)
        } else {
            leftPanelRef.current?.collapse()
            archivePanelRef.current?.collapse()
            rightPanelRef.current?.collapse()
            setIsZenMode(true)
            setIsLeftCollapsed(true)
            setIsArchiveCollapsed(true)
            setIsRightCollapsed(true)
        }
    }

    const autoOpen = () => {
        if (isZenMode) {
            leftPanelRef.current?.expand(15)
            archivePanelRef.current?.expand(40)
            rightPanelRef.current?.expand(40)
            setIsZenMode(false)
            setIsLeftCollapsed(false)
            setIsArchiveCollapsed(false)
            setIsRightCollapsed(false)
        }
    }

    const createNewSession = (isMeeting: boolean) => {
        const hour = new Date().getHours()
        let greeting = "Neural uplink established. Ready for input, kiri."
        
        if (hour < 12) greeting = "Good morning, kiri. Neural cores are primed for early-cycle optimization. 🌅"
        else if (hour < 18) greeting = "Good afternoon, kiri. Mid-cycle sync is active. What's on our roadmap? ⚡"
        else greeting = "Good evening, kiri. Late-cycle synthesis initialized. Ready for deep-work protocol. 🌙"

        const newSession: ChatSession = {
            id: Date.now().toString(),
            title: isMeeting ? "New Meeting Sync" : "New Creative Session",
            date: new Date().toISOString().split('T')[0],
            messages: [{ role: "neo", content: greeting, timestamp: "Just now" }],
            summary: "New session started.",
            isMeeting
        }
        setSessions([newSession, ...sessions])
        setCurrentSessionId(newSession.id)
    }

    const toggleBookmark = (index: number) => {
        setSessions(prev => prev.map(s => {
            if (s.id === currentSessionId) {
                const newMessages = [...s.messages]
                newMessages[index] = { ...newMessages[index], bookmarked: !newMessages[index].bookmarked }
                return { ...s, messages: newMessages }
            }
            return s
        }))
    }

    if (!mounted) return <div className="h-screen w-full bg-[#050505]" />

    return (
        <div className="h-screen w-full overflow-hidden bg-[#050505] text-slate-300 font-sans selection:bg-blue-600/30">
            <CommandDialog open={isOpenCommand} onOpenChange={setIsOpenCommand}>
                <Command className="bg-[#0A0A0A] border-slate-800 rounded-lg border-none shadow-2xl">
                    <CommandInput placeholder="Search archives, insights, or commands..." className="text-white" />
                    <CommandList className="text-slate-400">
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup heading="Recent Activity">
                            {sessions.map(s => (
                                <CommandItem key={s.id} onSelect={() => { setCurrentSessionId(s.id); setIsOpenCommand(false) }}>
                                    {s.isMeeting ? <Video className="mr-2 h-4 w-4" /> : <MessageSquare className="mr-2 h-4 w-4" />}
                                    <span>{s.title}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandSeparator className="bg-slate-800" />
                        <CommandGroup heading="System Commands">
                            <CommandItem onSelect={() => setIsMeetingMode(!isMeetingMode)}>
                                <Zap className="mr-2 h-4 w-4 text-amber-500" />
                                <span>Toggle Meeting Engine</span>
                            </CommandItem>
                            <CommandItem onSelect={() => toast.info("Neo calibration in progress...")}>
                                <Cpu className="mr-2 h-4 w-4 text-blue-500" />
                                <span>Recalibrate Neural Core</span>
                            </CommandItem>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </CommandDialog>

            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogContent className="bg-[#0A0A0A] border-white/5 text-slate-300 max-w-2xl rounded-[2.5rem] shadow-2xl p-0 overflow-hidden">
                    <div className="p-10 border-b border-white/5 bg-gradient-to-br from-blue-600/10 to-transparent">
                        <DialogTitle className="text-white uppercase tracking-[0.3em] font-black text-xl mb-2">Neural Customization</DialogTitle>
                        <DialogDescription className="text-slate-500">Reprogram the core identity vectors for optimal synchronization.</DialogDescription>
                    </div>
                    <ScrollArea className="max-h-[60vh] p-10">
                        <div className="space-y-12">
                            <section>
                                <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-500 mb-8 px-2 flex items-center gap-3">
                                    <User className="h-4 w-4" /> Operator Identity
                                </h4>
                                <div className="grid gap-8 bg-white/[0.02] border border-white/5 p-8 rounded-3xl shadow-xl">
                                    <Field>
                                        <FieldLabel className="text-[10px] uppercase font-black tracking-widest text-slate-600 mb-3">Operator Name</FieldLabel>
                                        <Input
                                            value={userName}
                                            onChange={(e) => setUserName(e.target.value)}
                                            className="bg-white/5 border-none h-12 rounded-xl text-[14px] font-bold text-white placeholder:text-slate-800"
                                            placeholder="Enter your callsign..."
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel className="text-[10px] uppercase font-black tracking-widest text-slate-600 mb-3">Avatar Uplink (URL)</FieldLabel>
                                        <Input
                                            value={userPfp}
                                            onChange={(e) => setUserPfp(e.target.value)}
                                            className="bg-white/5 border-none h-12 rounded-xl text-[14px] font-bold text-white placeholder:text-slate-800"
                                            placeholder="https://..."
                                        />
                                    </Field>
                                </div>
                            </section>

                            <section>
                                <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-500 mb-8 px-2 flex items-center gap-3">
                                    <Cpu className="h-4 w-4" /> Neo AI Persona
                                </h4>
                                <div className="grid gap-8 bg-white/[0.02] border border-white/5 p-8 rounded-3xl shadow-xl">
                                    <Field>
                                        <FieldLabel className="text-[10px] uppercase font-black tracking-widest text-slate-600 mb-3">System Name</FieldLabel>
                                        <Input
                                            value={neoName}
                                            onChange={(e) => setNeoName(e.target.value)}
                                            className="bg-white/5 border-none h-12 rounded-xl text-[14px] font-bold text-white placeholder:text-slate-800"
                                            placeholder="Assign a system identifier..."
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel className="text-[10px] uppercase font-black tracking-widest text-slate-600 mb-3">System Avatar (URL)</FieldLabel>
                                        <Input
                                            value={neoPfp}
                                            onChange={(e) => setNeoPfp(e.target.value)}
                                            className="bg-white/5 border-none h-12 rounded-xl text-[14px] font-bold text-white placeholder:text-slate-800"
                                            placeholder="Custom system icon URL..."
                                        />
                                    </Field>
                                </div>
                            </section>
                        </div>
                    </ScrollArea>
                    <DialogFooter className="p-10 bg-black/40 border-t border-white/5">
                        <Button onClick={() => setIsSettingsOpen(false)} className="w-full h-14 bg-blue-600 hover:bg-blue-700 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] shadow-[0_0_30px_rgba(37,99,235,0.3)]">Save Optimization</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ResizablePanelGroup direction="horizontal" className="h-full w-full">

                {/* 1. FAR LEFT: COMMAND SIDEBAR (Fixed Nav) */}
                <ResizablePanel
                    ref={leftPanelRef}
                    defaultSize={0}
                    minSize={0}
                    maxSize={100}
                    collapsible={true}
                    className="border-r border-blue-500/15 bg-gradient-to-b from-[#111111] via-[#0D0D0D] to-[#0A0A0A] transition-all duration-500 shadow-[2px_0_30px_rgba(37,99,235,0.05)]"
                >
                    <div className="flex flex-col items-center h-full py-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleSidebars}
                            className={`mb-8 hover:bg-white/5 rounded-xl transition-all active:scale-90 ${isLeftCollapsed ? 'animate-pulse text-blue-500 bg-blue-500/10' : 'text-slate-500 hover:text-white'}`}
                        >
                            <Menu className={`h-5 w-5 transition-transform duration-500 ${!isLeftCollapsed ? 'rotate-90' : ''}`} />
                        </Button>

                        <div className={`h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white mb-10 shadow-[0_0_20px_rgba(37,99,235,0.2)] transition-all duration-500 ${isLeftCollapsed ? 'scale-75 opacity-50' : ''}`}>
                            <Cpu className="h-6 w-6" />
                        </div>

                        <div className="flex-1 flex flex-col gap-8">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant={activeTab === 'home' ? 'secondary' : 'ghost'} size="icon" onClick={() => { setActiveTab('home'); autoOpen(); }} className="rounded-xl h-10 w-10 transition-all hover:scale-110">
                                            <LayoutDashboard className="h-5 w-5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">Core Terminal</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={() => { setIsOpenCommand(true); autoOpen(); }} className="rounded-xl h-10 w-10 text-slate-500 hover:text-white">
                                            <Search className="h-5 w-5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">Universal Search (⌘K)</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Sheet>
                                            <SheetTrigger asChild>
                                                <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-slate-500 hover:text-amber-500" onClick={autoOpen}>
                                                    <Trophy className="h-5 w-5" />
                                                </Button>
                                            </SheetTrigger>
                                            <SheetContent side="left" className="bg-[#0A0A0A] border-white/5 text-slate-300 w-[400px]">
                                                <SheetHeader>
                                                    <SheetTitle className="text-white font-black tracking-widest text-lg uppercase">Project Hub</SheetTitle>
                                                    <SheetDescription className="text-slate-500">Central repository for all bookmarked intelligence modules.</SheetDescription>
                                                </SheetHeader>
                                                <div className="mt-10">
                                                    <Empty>
                                                        <EmptyHeader>
                                                            <EmptyTitle className="text-white">Intelligence Inventory Empty</EmptyTitle>
                                                            <EmptyDescription className="text-slate-500">Bookmark insights in your chat to populate the project hub.</EmptyDescription>
                                                        </EmptyHeader>
                                                    </Empty>
                                                </div>
                                            </SheetContent>
                                        </Sheet>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">Project Hub</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Drawer>
                                            <DrawerTrigger asChild>
                                                <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-slate-500 hover:text-white" onClick={autoOpen}>
                                                    <Activity className="h-5 w-5" />
                                                </Button>
                                            </DrawerTrigger>
                                            <DrawerContent className="bg-[#0A0A0A] border-white/5">
                                                <DrawerHeader>
                                                    <DrawerTitle className="text-white text-center uppercase tracking-widest">System Diagnostics</DrawerTitle>
                                                    <DrawerDescription className="text-center">Real-time engagement and telemetry monitoring.</DrawerDescription>
                                                </DrawerHeader>
                                                <div className="p-10 max-w-2xl mx-auto w-full">
                                                    <Alert className="bg-blue-600/10 border-blue-600/30 text-blue-400 mb-6 rounded-2xl p-6">
                                                        <Activity className="h-5 w-5" />
                                                        <AlertTitle className="font-bold uppercase tracking-widest mb-1">Stability: 99.9%</AlertTitle>
                                                        <AlertDescription>Neo AI core is operating at peak efficiency across all subsystems.</AlertDescription>
                                                    </Alert>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <Card className="bg-slate-900/50 border-white/5 p-4 rounded-2xl">
                                                            <div className="text-[10px] uppercase font-black text-slate-500 mb-2">Memory Load</div>
                                                            <Progress value={45} className="h-1" />
                                                        </Card>
                                                        <Card className="bg-slate-900/50 border-white/5 p-4 rounded-2xl">
                                                            <div className="text-[10px] uppercase font-black text-slate-500 mb-2">Context Span</div>
                                                            <Progress value={85} className="h-1" />
                                                        </Card>
                                                    </div>
                                                </div>
                                                <DrawerFooter className="mb-6">
                                                    <DrawerClose asChild>
                                                        <Button variant="outline" className="rounded-xl border-white/5 hover:bg-slate-900">Close Diagnostics</Button>
                                                    </DrawerClose>
                                                </DrawerFooter>
                                            </DrawerContent>
                                        </Drawer>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">Diagnostics</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        <div className="mt-auto flex flex-col gap-4">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-slate-500 hover:text-blue-500">
                                            <Lock className="h-5 w-5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">Encrypted Sync</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 hover:bg-white/5">
                                        <Avatar className="h-8 w-8 ring-2 ring-blue-600/30">
                                            <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80" />
                                            <AvatarFallback className="bg-blue-600 text-white font-black">H</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-[#111111] border-white/5 text-slate-300 w-64 p-2 shadow-2xl" align="end" side="right">
                                    <DropdownMenuLabel className="font-black uppercase tracking-widest text-[11px] px-3 py-2 text-white/50">Core Identity</DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-white/5" />
                                    <DropdownMenuItem className="rounded-lg px-3 py-2 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer flex items-center gap-3">
                                        <Lock className="h-3.5 w-3.5" /> Security Protocol
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => { setIsSettingsOpen(true); autoOpen(); }}
                                        className="rounded-lg px-3 py-2 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer flex items-center gap-3"
                                    >
                                        <Settings className="h-3.5 w-3.5" /> Neural Settings
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-white/5" />
                                    <DropdownMenuItem className="rounded-lg px-3 py-2 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer flex items-center gap-3">
                                        <AlertCircle className="h-3.5 w-3.5" /> Sever Connection
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </ResizablePanel>

                <ResizableHandle withHandle className="bg-blue-600/30 w-[1px] hover:bg-blue-500 transition-colors" />

                {/* 2. MIDDLE: ARCHIVES (CONTENT INDEX) */}
                <ResizablePanel 
                    ref={archivePanelRef}
                    defaultSize={0} 
                    minSize={0} 
                    maxSize={100} 
                    collapsible={true}
                    className="bg-gradient-to-br from-[#0D0D0D] to-[#050505] border-r border-blue-500/15"
                >
                    <div className="flex flex-col h-full shadow-2xl">
                        <div className="p-6 border-b border-white/5 bg-[#080808]/80 backdrop-blur-2xl sticky top-0 z-20">
                            <div className="flex items-center justify-between mb-5">
                                <h1 className="text-[11px] font-black tracking-[0.4em] text-white/40 uppercase font-heading">Intelligence Index</h1>
                                <Button size="icon" variant="ghost" onClick={() => createNewSession(false)} className="h-8 w-8 rounded-xl hover:bg-white/10 text-white/60">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <InputGroup>
                                <InputGroupAddon align="inline-start">
                                    <Search className="h-3.5 w-3.5 text-slate-600" />
                                </InputGroupAddon>
                                <InputGroupInput
                                    placeholder="Query sessions..."
                                    className="h-11 bg-white/5 border-none rounded-2xl text-[13px] placeholder:text-slate-700"
                                />
                            </InputGroup>
                        </div>

                        <div className="px-6 py-4">
                            <ButtonGroup className="grid grid-cols-2 p-1 bg-white/5 rounded-2xl">
                                <Button variant="secondary" size="sm" className="rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/10 text-white shadow-lg">Everything</Button>
                                <Button variant="ghost" size="sm" className="rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-300">Meetings</Button>
                            </ButtonGroup>
                        </div>

                        <ScrollArea className="flex-1 px-4 text-slate-500">
                            <div className="space-y-8 pb-10 pt-2">
                                <Collapsible defaultOpen className="group/collapsible">
                                    <CollapsibleTrigger asChild>
                                        <div className="flex items-center justify-between px-3 mb-3 cursor-pointer group hover:bg-white/5 py-1 rounded-lg">
                                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] group-hover:text-slate-400 transition-colors">History: Orbital Cycle</span>
                                            <ChevronDown className="h-3 w-3 text-slate-600 group-hover:text-slate-400 transition-transform group-data-[state=open]:rotate-180" />
                                        </div>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="space-y-1">
                                        {sessions.map(s => (
                                            <HoverCard key={s.id} openDelay={300}>
                                                <HoverCardTrigger asChild>
                                                    <button
                                                        onClick={() => setCurrentSessionId(s.id)}
                                                        className={`w-full text-left px-4 py-4 rounded-2xl flex items-center gap-4 transition-all duration-500 relative group border-none ${currentSessionId === s.id
                                                            ? 'bg-blue-600/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
                                                            : 'hover:bg-white/[0.03] text-slate-500'
                                                            }`}
                                                    >
                                                        <div className={`shrink-0 h-10 w-10 rounded-xl flex items-center justify-center transition-all ${currentSessionId === s.id ? 'bg-blue-600 text-white' : 'bg-white/5 group-hover:bg-white/10'
                                                            }`}>
                                                            {s.isMeeting ? <Video className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                                                        </div>
                                                        <div className="truncate flex-1">
                                                            <div className={`text-[13px] font-black truncate leading-tight transition-colors font-heading ${currentSessionId === s.id ? 'text-white' : 'text-slate-400'}`}>{s.title}</div>
                                                            <div className="text-[10px] opacity-40 font-medium truncate mt-1 flex items-center gap-2">
                                                                <Clock className="h-2.5 w-2.5" /> {s.date}
                                                            </div>
                                                        </div>
                                                        {currentSessionId === s.id && (
                                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-blue-600 rounded-r-lg shadow-[0_0_15px_#2563eb]" />
                                                        )}
                                                    </button>
                                                </HoverCardTrigger>
                                                <HoverCardContent side="right" sideOffset={10} className="bg-[#111111] border-white/5 text-slate-300 w-80 p-0 shadow-[0_20px_60px_rgba(0,0,0,0.6)] rounded-3xl overflow-hidden animate-in fade-in slide-in-from-left-2 transition-all">
                                                    <div className="p-5 border-b border-white/5 bg-gradient-to-br from-blue-600/10 to-transparent">
                                                        <h4 className="text-sm font-black text-white mb-2 uppercase tracking-widest flex items-center gap-2">
                                                            {s.isMeeting ? <Video className="h-3.5 w-3.5 text-blue-500" /> : <MessageSquare className="h-3.5 w-3.5 text-blue-500" />}
                                                            Summary
                                                        </h4>
                                                        <p className="text-[12px] leading-relaxed text-slate-400 italic">"{s.summary?.slice(0, 100)}..."</p>
                                                    </div>
                                                    <div className="p-4 bg-black/40 flex justify-between items-center gap-4">
                                                        <div className="flex gap-1">
                                                            <Badge variant="outline" className="text-[8px] border-white/10 text-white/40 py-0">{s.attendees?.length || 0} Participants</Badge>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500/50 hover:text-red-500 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></Button>
                                                                </DialogTrigger>
                                                                <DialogContent className="bg-[#0A0A0A] border-white/5 text-slate-300 rounded-3xl">
                                                                    <DialogHeader>
                                                                        <DialogTitle className="text-white uppercase tracking-widest font-black">Erase Memory Trace?</DialogTitle>
                                                                        <DialogDescription className="text-slate-500">This action will permanently delete all data vectors from this intelligence cycle.</DialogDescription>
                                                                    </DialogHeader>
                                                                    <DialogFooter className="mt-4 gap-2">
                                                                        <Button variant="ghost" className="bg-white/5 border-none hover:bg-white/10 rounded-xl text-xs uppercase font-black">Abort</Button>
                                                                        <Button className="bg-red-600 hover:bg-red-700 rounded-xl text-xs uppercase font-black" onClick={() => deleteSession(s.id)}>Purge Vector</Button>
                                                                    </DialogFooter>
                                                                </DialogContent>
                                                            </Dialog>
                                                        </div>
                                                    </div>
                                                </HoverCardContent>
                                            </HoverCard>
                                        ))}
                                    </CollapsibleContent>
                                </Collapsible>
                            </div>
                        </ScrollArea>
                    </div>
                </ResizablePanel>

                <ResizableHandle withHandle className="bg-blue-600/30 w-1.5 hover:bg-blue-500 hover:w-2 transition-all duration-300 shadow-[0_0_15px_rgba(37,99,235,0.2)]" />

                {/* 3. MAIN CHAT STAGE */}
                <ResizablePanel ref={chatPanelRef} defaultSize={100} minSize={5}>
                    <div className="flex-1 flex flex-col relative h-full bg-[#050505]">
                        {/* 3.1 CHAT CORE */}
                        <div className="flex-1 flex flex-col relative h-full">
                            {/* HEADER ENGINE */}
                            <Menubar className="h-16 border-b border-white/5 bg-[#050505]/80 backdrop-blur-3xl px-8 flex justify-between rounded-none border-t-0 border-x-0">
                                <div className="flex items-center gap-6">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={toggleSidebars}
                                        className={`h-10 w-10 transition-all rounded-xl hover:bg-white/5 ${isZenMode ? 'text-blue-500 animate-pulse bg-blue-500/10' : 'text-slate-500 hover:text-white'}`}
                                    >
                                        <Menu className={`h-5 w-5 transition-transform duration-500 ${!isZenMode ? 'rotate-90' : ''}`} />
                                    </Button>
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
                                        <span className="text-[12px] font-black uppercase text-white tracking-[0.3em] font-heading">{currentSession?.title}</span>
                                    </div>
                                    <Separator orientation="vertical" className="h-5 bg-white/10" />
                                    <Badge className={`px-3 py-1 text-[9px] uppercase font-black tracking-widest border-none ${isMeetingMode ? 'bg-amber-600/20 text-amber-500' : 'bg-blue-600/20 text-blue-500'}`}>
                                        {isMeetingMode ? "Neural Meeting Mode" : "Dark Creative Mode"}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-4">
                                    <MenubarMenu>
                                        <MenubarTrigger className="h-10 rounded-xl border-white/5 hover:bg-white/5 text-slate-400 transition-all font-bold text-[11px] uppercase tracking-widest">
                                            <Share2 className="h-3.5 w-3.5 mr-2" /> Dispatch
                                        </MenubarTrigger>
                                        <MenubarContent className="bg-[#111111] border-white/5 text-slate-300 rounded-2xl p-2 shadow-2xl">
                                            <MenubarItem className="rounded-lg">Clone Vector Link</MenubarItem>
                                            <MenubarItem className="rounded-lg">Export Raw Matrix</MenubarItem>
                                            <MenubarSeparator className="bg-white/5" />
                                            <MenubarItem className="rounded-lg flex items-center gap-2"><Globe className="h-3.5 w-3.5" /> Global Uplink</MenubarItem>
                                        </MenubarContent>
                                    </MenubarMenu>
                                    <Separator orientation="vertical" className="h-5 bg-white/10" />
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-10 w-10 text-slate-500 hover:text-white transition-all rounded-xl" 
                                                    onClick={() => createNewSession(isMeetingMode)}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>New Cycle</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            if (isRightCollapsed) {
                                                rightPanelRef.current?.expand(35)
                                                setIsRightCollapsed(false)
                                            } else {
                                                rightPanelRef.current?.collapse()
                                                setIsRightCollapsed(true)
                                            }
                                        }}
                                        className={`h-10 w-10 transition-all rounded-xl hover:bg-white/5 ${isRightCollapsed ? 'text-blue-500 animate-pulse bg-blue-500/10' : 'text-slate-500 hover:text-white'}`}
                                    >
                                        <Menu className={`h-5 w-5 transition-transform duration-500 ${!isRightCollapsed ? 'rotate-90' : ''}`} />
                                    </Button>
                                </div>
                            </Menubar>

                            {/* CHAT INTERFACE */}
                            <ScrollArea className="flex-1 px-10 py-12" ref={scrollRef}>
                                <div className="max-w-4xl mx-auto space-y-16 pb-20">
                                    {currentSession?.messages.length === 1 && (
                                        <Empty>
                                            <EmptyHeader>
                                                <EmptyTitle className="text-white text-xl uppercase font-black tracking-widest">{`Neo AI ${isMeetingMode ? 'Meeting Engine' : 'Core'} Online`}</EmptyTitle>
                                                <EmptyDescription className="text-slate-500">Dark theme optimization complete across 34 modules. System ready for recursive input.</EmptyDescription>
                                            </EmptyHeader>
                                        </Empty>
                                    )}

                                    {currentSession?.messages.map((msg, i) => (
                                        <div key={i} className={`flex gap-8 group/msg ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                            <div className={`mt-2 h-11 w-11 rounded-2xl flex items-center justify-center flex-shrink-0 relative transition-transform group-hover/msg:scale-110 ${msg.role === 'neo'
                                                ? 'bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)]'
                                                : 'bg-[#111111] border border-white/5 text-slate-600 shadow-xl'
                                                }`}>
                                                {msg.role === 'neo' ? (
                                                    neoPfp ? (
                                                        <Avatar className="h-full w-full rounded-2xl">
                                                            <AvatarImage src={neoPfp} />
                                                            <AvatarFallback><Terminal className="h-5 w-5" /></AvatarFallback>
                                                        </Avatar>
                                                    ) : <Terminal className="h-5 w-5" />
                                                ) : (
                                                    <Avatar className="h-full w-full rounded-2xl">
                                                        <AvatarImage src={userPfp} />
                                                        <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                                                    </Avatar>
                                                )}
                                                {msg.role === 'neo' && <div className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-green-500 border-3 border-[#050505] rounded-full" />}
                                            </div>

                                            <div className={`flex flex-col space-y-4 max-w-[85%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                                                <div className="flex items-center gap-3 px-2">
                                                    <span className={`text-[10px] font-black uppercase tracking-[0.3em] font-heading ${msg.role === 'neo' ? 'text-blue-500' : 'text-slate-600'}`}>
                                                        {msg.role === 'neo' ? <span className="special-word">Neo AI</span> : userName}
                                                    </span>
                                                    <span className="text-[10px] text-white/5">•</span>
                                                    <span className="text-[10px] text-slate-800 font-bold">{msg.timestamp}</span>
                                                </div>

                                                <Card className={`p-10 rounded-[3.5rem] border-none relative group overflow-hidden transition-all duration-700 shadow-[0_50px_100px_rgba(0,0,0,0.8)] ${msg.role === 'user'
                                                    ? 'bg-white/[0.03] text-slate-300 rounded-tr-none border-r border-white/5'
                                                    : 'bg-[#040404] text-slate-200 rounded-tl-none border-l-4 border-l-blue-600 shadow-[inset_0_0_40px_rgba(37,99,235,0.05)]'
                                                    }`}>
                                                    {msg.role === 'neo' && <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-blue-600 via-blue-400 to-transparent opacity-50 animate-pulse" />}
                                                    {msg.type === 'skeleton' ? (
                                                        <div className="space-y-4 p-2">
                                                            <Skeleton className="h-4 w-[300px] bg-white/5 rounded-lg" />
                                                            <Skeleton className="h-4 w-[240px] bg-white/5 rounded-lg" />
                                                            <Skeleton className="h-4 w-[280px] bg-white/5 rounded-lg opacity-50" />
                                                        </div>
                                                    ) : (
                                                        <div className="prose prose-invert prose-p:leading-[2.2] prose-p:text-[16px] prose-p:opacity-90 prose-p:tracking-wide prose-p:text-slate-300 max-w-none prose-p:mb-14 last:prose-p:mb-0 selection:bg-blue-600/40 font-medium">
                                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                                {msg.content}
                                                            </ReactMarkdown>
                                                        </div>
                                                    )}

                                                    {/* DATA MATRIX (TABLE) */}
                                                    {msg.type === 'table' && msg.data && (
                                                        <div className="mt-14 border border-white/10 rounded-[2.5rem] overflow-hidden bg-black/60 backdrop-blur-3xl shadow-[0_40px_120px_rgba(0,0,0,0.6)] transition-all border-l-4 border-l-blue-600">
                                                            <Table className="border-collapse">
                                                                <TableHeader className="bg-white/[0.03]">
                                                                    <TableRow className="border-white/10 hover:bg-transparent">
                                                                        {Object.keys(msg.data[0]).map(k => <TableHead key={k} className="text-[10px] font-black uppercase text-blue-500 tracking-[0.2em] py-5 h-14 px-8 border-b border-white/10">{k}</TableHead>)}
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody className="divide-y divide-white/5">
                                                                    {msg.data.map((row: any, ri: number) => (
                                                                        <TableRow key={ri} className="border-white/5 hover:bg-blue-600/5 transition-colors group/row">
                                                                            {Object.values(row).map((v: any, vi) => (
                                                                                <TableCell key={vi} className="text-[13px] py-5 px-8 font-bold text-slate-300 border-l border-white/5 first:border-l-0 group-hover/row:text-white transition-colors">
                                                                                    {String(v).includes('Stable') ? <Badge className="bg-green-500/10 text-green-500 border border-green-500/20 px-3 py-1 text-[10px] font-black rounded-lg">STABLE</Badge> : v}
                                                                                </TableCell>
                                                                            ))}
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                    )}

                                                    {/* NEURAL TRAJECTORY (CHART) */}
                                                    {msg.type === 'chart' && (
                                                        <div className="mt-8 h-48 bg-[#030303] rounded-3xl border border-white/5 flex items-center justify-center gap-4 relative p-8 group/chart overflow-hidden shadow-inner">
                                                            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/5 to-transparent pointer-events-none" />
                                                            {[55, 98, 62, 88, 72, 95, 82].map((h, bi) => (
                                                                <div key={bi} className="flex-1 flex flex-col items-center h-full justify-end group/bar">
                                                                    <div
                                                                        className="w-full bg-white/5 group-hover/bar:bg-blue-600/40 transition-all duration-500 rounded-xl relative cursor-crosshair shadow-lg"
                                                                        style={{ height: `${h}%` }}
                                                                    >
                                                                        <div className="absolute top-0 left-0 w-full h-[3px] bg-blue-500 shadow-[0_0_20px_#2563eb] opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                                                                    </div>
                                                                    <span className="text-[8px] font-black text-slate-800 mt-3 tracking-widest uppercase">V-{bi + 1}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="absolute top-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                        <Button variant="ghost" size="icon" className={`h-9 w-9 rounded-xl transition-all ${msg.bookmarked ? 'text-amber-500 bg-amber-500/10' : 'text-slate-600 hover:text-white'}`} onClick={() => toggleBookmark(i)}>
                                                            <Bookmark className={`h-4 w-4 ${msg.bookmarked ? 'fill-current' : ''}`} />
                                                        </Button>

                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-red-500/50 hover:text-red-500 hover:bg-white/5 transition-all">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="bg-[#0A0A0A] border-white/5 text-slate-300 rounded-3xl shadow-2xl scale-95 border-none">
                                                                <DialogHeader>
                                                                    <DialogTitle className="text-white uppercase tracking-widest font-black text-center">Delete message node?</DialogTitle>
                                                                    <DialogDescription className="text-center text-slate-500">This will remove this specific intelligence block from the current cycle.</DialogDescription>
                                                                </DialogHeader>
                                                                <DialogFooter className="mt-8 flex gap-3 justify-center">
                                                                    <Button variant="ghost" className="bg-white/5 rounded-xl text-xs uppercase font-black tracking-widest hover:bg-white/10 px-8">Abort</Button>
                                                                    <Button className="bg-red-600 hover:bg-red-700 rounded-xl text-xs uppercase font-black tracking-widest px-8">Delete</Button>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>

                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-600 hover:text-white transition-all">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent side="top" className="bg-[#111111] border-white/5 text-slate-300 rounded-2xl w-52 p-2 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
                                                                <div className="grid gap-1">
                                                                    <button className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-white/5 p-3 rounded-xl transition-colors cursor-pointer w-full text-left"><Globe className="h-3.5 w-3.5" /> Translate Hub</button>
                                                                    <button className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-white/5 p-3 rounded-xl transition-colors cursor-pointer w-full text-left"><Settings className="h-3.5 w-3.5" /> Re-analyze</button>
                                                                    <button className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-3 text-red-500 hover:bg-red-500/10 p-3 rounded-xl transition-colors cursor-pointer w-full text-left"><AlertCircle className="h-3.5 w-3.5" /> Flag Vector</button>
                                                                </div>
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>
                                                </Card>
                                            </div>
                                        </div>
                                    ))}
                                    {isTyping && (
                                        <div className="flex gap-8 animate-in fade-in slide-in-from-bottom-2">
                                            <div className="mt-2 h-11 w-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 relative shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                                                <Terminal className="h-5 w-5" />
                                            </div>
                                            <div className="flex flex-col space-y-4 max-w-[85%]">
                                                <div className="flex items-center gap-3 px-2">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">{neoName}</span>
                                                    <span className="text-[10px] text-slate-800 font-bold italic">Typing...</span>
                                                </div>
                                                <Card className="p-6 bg-[#0A0A0A] border-l-2 border-l-blue-600/50 rounded-[2.5rem] rounded-tl-none border-none shadow-2xl">
                                                    <div className="flex gap-2">
                                                        <div className="h-2 w-2 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]" />
                                                        <div className="h-2 w-2 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.15s]" />
                                                        <div className="h-2 w-2 rounded-full bg-blue-600 animate-bounce" />
                                                    </div>
                                                </Card>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            </ScrollArea>

                            {/* INPUT ENGINE */}
                            <div className="p-10 bg-[#050505] border-t border-white/5 shadow-2xl">
                                <div className="max-w-4xl mx-auto">
                                    {attachments.length > 0 && (
                                        <div className="flex gap-4 mb-6 p-4 bg-white/5 rounded-3xl animate-in zoom-in-95 duration-300">
                                            {attachments.map((file, idx) => (
                                                <div key={idx} className="relative group/file">
                                                    <div className="h-20 w-20 rounded-2xl bg-[#0A0A0A] border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
                                                        {file.type === "image" ? (
                                                            <img src={file.url} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-1">
                                                                <Paperclip className="h-6 w-6 text-blue-500" />
                                                                <span className="text-[8px] font-black uppercase tracking-tighter text-slate-500 truncate max-w-[220px] px-2">{file.name}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg opacity-0 group-hover/file:opacity-100 transition-all scale-75 group-hover/file:scale-100"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="relative group">
                                        <Textarea
                                            placeholder={isMeetingMode ? "Neo Core is listening to the sync... Processing... 🎙️" : "Initiate command sequence or converse with Neo AI..."}
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                            className="min-h-[120px] w-full bg-[#0A0A0A] border-white/5 rounded-[2.5rem] p-8 pr-48 text-[15px] font-medium text-slate-300 focus:bg-[#0D0D0D] transition-all focus:ring-blue-600/30 resize-none leading-relaxed shadow-2xl border-none outline-none"
                                        />
                                        <div className="absolute right-8 bottom-8 flex gap-4">
                                            <TooltipProvider>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-12 w-12 text-slate-600 hover:bg-white/5 rounded-2xl transition-all">
                                                            <Paperclip className="h-5 w-5" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent side="top" className="bg-[#111111] border-white/5 text-slate-300 rounded-2xl w-56 p-2 shadow-2xl mb-4">
                                                        <div className="grid gap-1">
                                                            <button
                                                                onClick={() => setAttachments(prev => [...prev, { name: "design_draft.pdf", type: "doc" }])}
                                                                className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-white/5 p-3 rounded-xl transition-colors cursor-pointer w-full text-left"
                                                            >
                                                                <Plus className="h-3.5 w-3.5" /> Upload Document
                                                            </button>
                                                            <button
                                                                onClick={() => setAttachments(prev => [...prev, { name: "neural_net.png", type: "image", url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=200&q=80" }])}
                                                                className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-white/5 p-3 rounded-xl transition-colors cursor-pointer w-full text-left"
                                                            >
                                                                <ImageIcon className="h-3.5 w-3.5" /> Upload Image
                                                            </button>
                                                            <button
                                                                onClick={() => setAttachments(prev => [...prev, { name: "sync_demo.mp4", type: "video" }])}
                                                                className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-white/5 p-3 rounded-xl transition-colors cursor-pointer w-full text-left"
                                                            >
                                                                <Video className="h-3.5 w-3.5" /> Upload Video
                                                            </button>
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                                <Button
                                                    onClick={handleSend}
                                                    disabled={isTyping || (!input.trim() && attachments.length === 0)}
                                                    className="h-12 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all font-black text-[11px] tracking-[0.3em] uppercase active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                                                >
                                                    <Zap className="h-4 w-4 mr-3 group-hover:animate-pulse" />
                                                    {isTyping ? "Processing" : "Compute"}
                                                </Button>
                                            </TooltipProvider>
                                        </div>
                                    </div>
                                    <div className="mt-8 flex gap-12 px-10">
                                        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setIsMeetingMode(!isMeetingMode)}>
                                            <Toggle pressed={isMeetingMode} className="h-6 w-11 p-1 bg-white/5 rounded-full data-[state=on]:bg-blue-600 transition-all border-none">
                                                <div className={`h-4 w-4 rounded-full bg-white shadow-xl transition-all ${isMeetingMode ? 'translate-x-5' : 'translate-x-0'}`} />
                                            </Toggle>
                                            <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-600 cursor-pointer group-hover:text-blue-500 transition-colors">Meeting Engine</Label>
                                        </div>
                                        <Separator orientation="vertical" className="h-5 bg-white/5" />
                                        <div className="flex gap-10">
                                            <button className="flex items-center gap-3 text-[10px] font-black text-slate-700 uppercase tracking-widest hover:text-blue-500 transition-all active:scale-90" onClick={() => toast.info("Neo Fact: Dark mode saves 30% more energy.")}>
                                                <Smile className="h-4 w-4" /> Get Fact
                                            </button>
                                            <button className="flex items-center gap-3 text-[10px] font-black text-slate-700 uppercase tracking-widest hover:text-blue-500 transition-all active:scale-90" onClick={() => setInput("Generate a system report table")}>
                                                <TableIcon className="h-4 w-4" /> Matrix
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ResizablePanel>

                <ResizableHandle withHandle className="bg-blue-600/30 w-1.5 hover:bg-blue-500 hover:w-2 transition-all duration-300 shadow-[0_0_15px_rgba(37,99,235,0.2)]" />

                {/* 4. SYSTEM INSIGHTS (FAR RIGHT) */}
                <ResizablePanel 
                    ref={rightPanelRef}
                    defaultSize={0}
                    minSize={0}
                    maxSize={100}
                    collapsible={true}
                    className="bg-[#050505] shadow-2xl border-l border-blue-500/15"
                >
                    <div className="flex flex-col h-full relative z-30">
                            <Tabs value={summaryView} onValueChange={(v: any) => setSummaryView(v)} className="flex-1 flex flex-col h-full overflow-hidden">
                                <div className="p-6 border-b border-white/5 bg-[#050505]/50 backdrop-blur-xl">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-[12px] font-black text-white/30 uppercase tracking-[0.5em]">System Insights</h3>
                                        <div className="p-1 px-4 bg-blue-600/10 rounded-full text-[10px] font-black text-blue-500 tracking-widest border border-blue-600/20 shadow-2xl">ACTIVE</div>
                                    </div>
                                    <TabsList className="grid w-full grid-cols-2 p-1.5 bg-white/5 rounded-3xl h-14 border border-white/5">
                                        <TabsTrigger value="general" className="rounded-2xl text-[10px] uppercase font-black tracking-[0.3em] data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all shadow-2xl">Context</TabsTrigger>
                                        <TabsTrigger value="team" className="rounded-2xl text-[10px] uppercase font-black tracking-[0.3em] data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all shadow-2xl">Network</TabsTrigger>
                                    </TabsList>
                                </div>

                                <ScrollArea className="flex-1 h-full w-full">
                                    <TabsContent value="general" className="m-0 h-full overflow-hidden">
                                        <ResizablePanelGroup direction="vertical" className="h-full w-full">
                                            {/* TOP PANEL: TIMELINE & SUMMARY */}
                                            <ResizablePanel defaultSize={45} minSize={20} className="p-6 flex flex-col">
                                                <ScrollArea className="flex-1 w-full">
                                                    <div className="space-y-10 min-w-[500px]">
                                                        <div className="mb-12">
                                                            <div className="flex justify-between items-end mb-6 px-4">
                                                                <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-600">Neural Timeline</h4>
                                                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{days[selectedDay].day} MAR {days[selectedDay].date}</span>
                                                            </div>
                                                            <div className="relative h-20 flex items-center group/timeline">
                                                                <Progress 
                                                                    value={(selectedDay / (days.length - 1)) * 100} 
                                                                    className="h-4 bg-white/5 rounded-full absolute w-full transition-all duration-700 shadow-inner" 
                                                                />
                                                                <div className="absolute w-full flex justify-between px-1">
                                                                    {days.map((d, i) => (
                                                                        <div key={i} onClick={() => setSelectedDay(i)} className="relative flex flex-col items-center cursor-pointer group/node">
                                                                            <div className={`h-8 w-8 rounded-full border-2 transition-all duration-500 flex items-center justify-center relative z-10 ${i <= selectedDay ? 'bg-blue-600 border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.6)]' : 'bg-[#0A0A0A] border-white/10 group-hover/node:border-white/30'}`}>
                                                                                {i === selectedDay && <div className="h-2 w-2 rounded-full bg-white animate-ping" />}
                                                                            </div>
                                                                            <div className={`mt-4 flex flex-col items-center transition-all duration-500 ${i === selectedDay ? 'scale-110' : 'opacity-40'}`}>
                                                                                <span className="text-[10px] font-black uppercase tracking-widest text-white">{d.day}</span>
                                                                                <span className="text-[12px] font-black text-slate-400 mt-1">{d.date}</span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <Accordion type="single" collapsible className="w-full" defaultValue="summary">
                                                            <AccordionItem value="summary" className="border-white/5">
                                                                <AccordionTrigger className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-600 hover:no-underline hover:text-blue-500 transition-all py-6">
                                                                    Cycle Executive Brief
                                                                </AccordionTrigger>
                                                                <AccordionContent className="pt-4">
                                                                    <div className="p-6 bg-white/[0.03] rounded-[2rem] border border-white/5 italic text-[14px] text-slate-400 leading-[1.8] relative shadow-inner w-full break-words">
                                                                        <div className="absolute top-6 left-6 h-4 w-4 text-blue-900 opacity-30"><MessageSquare className="h-full w-full" /></div>
                                                                        <div className="whitespace-pre-wrap pl-8">"{currentSession?.summary}"</div>
                                                                    </div>
                                                                </AccordionContent>
                                                            </AccordionItem>
                                                        </Accordion>
                                                    </div>
                                                    <ScrollBar orientation="horizontal" />
                                                </ScrollArea>
                                            </ResizablePanel>

                                            <ResizableHandle withHandle className="bg-blue-600/20 h-1.5 hover:h-2 hover:bg-blue-500 transition-all duration-300" />

                                            {/* BOTTOM PANEL: ACTIONS & METRICS */}
                                            <ResizablePanel defaultSize={55} minSize={20} className="p-6 mt-4 flex flex-col">
                                                <ScrollArea className="flex-1 w-full">
                                                    <div className="space-y-12 pb-10 min-w-[500px]">
                                                        <Accordion type="single" collapsible className="w-full" defaultValue="actions">
                                                            <AccordionItem value="actions" className="border-white/5">
                                                                <AccordionTrigger className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-600 hover:no-underline hover:text-blue-500 transition-all py-6">
                                                                    Action Vector Matrix
                                                                </AccordionTrigger>
                                                                <AccordionContent className="space-y-6 pt-8">
                                                                    {[{ text: "Neural load balancing", q: "P1", status: "Active" }, { text: "Legacy theme purge", q: "P2", status: "Done" }].map((a, i) => (
                                                                        <div key={i} className="flex items-center gap-6 p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 group hover:bg-blue-600/10 hover:border-blue-600/30 transition-all cursor-pointer shadow-xl">
                                                                            <div className={`h-3 w-3 rounded-full shadow-[0_0_20px_currentColor] transition-all ${a.status === 'Done' ? 'text-green-500 bg-green-500' : 'text-blue-500 bg-blue-500'}`} />
                                                                            <span className="text-[13px] font-bold text-slate-300 flex-1">{a.text}</span>
                                                                            <Badge className="bg-black/50 border-white/5 text-[9px] font-black text-slate-600 px-3">{a.q}</Badge>
                                                                        </div>
                                                                    ))}
                                                                </AccordionContent>
                                                            </AccordionItem>
                                                        </Accordion>

                                                        <FieldGroup className="space-y-10">
                                                            <Field>
                                                                <FieldLabel className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-600 mb-6 flex justify-between w-full">Processing Intensity <span className="text-blue-500">88%</span></FieldLabel>
                                                                <Progress value={88} className="h-1.5 bg-white/5 rounded-full" />
                                                            </Field>
                                                            <Field>
                                                                <FieldLabel className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-600 mb-6 flex justify-between w-full">Context Depth <span className="text-amber-500">OPTIMAL</span></FieldLabel>
                                                                <Progress value={95} className="h-1.5 bg-white/5 rounded-full" />
                                                            </Field>
                                                        </FieldGroup>

                                                        <div className="p-8 bg-gradient-to-br from-blue-900/40 to-indigo-900/10 rounded-[2.5rem] border border-blue-600/30 relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all hover:scale-[1.02]">
                                                            <div className="relative z-10 flex flex-col items-center text-center">
                                                                <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center mb-6 shadow-2xl opacity-80 group-hover:opacity-100 transition-opacity"><Zap className="h-6 w-6 text-white" /></div>
                                                                <h5 className="text-white text-md font-black uppercase tracking-[0.3em] mb-4">Recursive Sync</h5>
                                                                <p className="text-[13px] text-slate-400 leading-relaxed font-medium">Neo is now observing your project hierarchy in real-time.</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <ScrollBar orientation="horizontal" />
                                                </ScrollArea>
                                            </ResizablePanel>
                                        </ResizablePanelGroup>
                                    </TabsContent>

                                    <TabsContent value="team" className="p-10 m-0 space-y-8">
                                        <div className="space-y-6 min-w-[500px]">
                                            {currentSession?.attendees?.map((name, i) => (
                                                <Item key={i} className="p-0 border-none bg-transparent hover:bg-transparent">
                                                    <ItemContent className="bg-white/[0.03] border border-white/5 p-6 rounded-[2.5rem] transition-all hover:border-blue-600/30 hover:bg-blue-600/5 group/item shadow-2xl">
                                                        <div className="flex items-center gap-6 mb-6">
                                                            <Avatar className="h-12 w-12 ring-2 ring-white/5 group-hover/item:ring-blue-600/50 transition-all shadow-2xl">
                                                                <AvatarFallback className="bg-slate-900 text-slate-600 text-xs font-black uppercase">{name.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1">
                                                                <ItemTitle className="text-[14px] font-black uppercase tracking-widest text-white">{name}</ItemTitle>
                                                                <ItemDescription className="text-[10px] text-blue-500 uppercase tracking-[0.3em] font-black mt-2">Active Node</ItemDescription>
                                                            </div>
                                                            <div className="h-3 w-3 rounded-full bg-green-500 shadow-[0_0_15px_#22c55e]" />
                                                        </div>
                                                        <p className="text-[12px] text-slate-500 leading-relaxed font-medium px-2">Engaging with the current neural cycle at high-priority levels. Semantic synergy optimal.</p>
                                                    </ItemContent>
                                                </Item>
                                            ))}
                                            <Button variant="ghost" className="w-full rounded-[2rem] border border-dashed border-white/5 h-20 text-[11px] font-black uppercase tracking-[0.5em] text-slate-700 hover:bg-white/5 hover:text-white transition-all shadow-2xl">
                                                Discover Network
                                            </Button>
                                        </div>
                                    </TabsContent>
                                    <ScrollBar orientation="horizontal" />
                                </ScrollArea>

                                <div className="p-10 border-t border-white/5 bg-[#050505]/80 backdrop-blur-xl">
                                    <div className="flex items-center justify-between mb-6 px-2">
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-700">Spectral Band</h4>
                                        <div className="flex items-center gap-3 text-[10px] font-black text-green-500 tracking-[0.3em]">
                                            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" /> SECURE
                                        </div>
                                    </div>
                                    <div className="h-14 flex gap-2 items-end px-2">
                                        {[22, 58, 35, 85, 62, 28, 75, 42, 58, 92, 45, 68, 30, 80].map((h, i) => (
                                            <div key={i} className="flex-1 bg-white/5 rounded-full transition-all hover:bg-blue-600/50 cursor-pointer shadow-lg" style={{ height: `${h}%` }} />
                                        ))}
                                    </div>
                                </div>
                            </Tabs>
                        </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}
