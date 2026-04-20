"use client"

import { useState, useEffect } from "react"
import { NeoDashboard } from "@/components/dashboard"
import { Button } from "@/components/ui/button"
import { Zap, Cpu, ArrowRight } from "lucide-react"

export default function Home() {
  const [showDashboard, setShowDashboard] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="h-screen w-full bg-[#050505]" />

  if (showDashboard) {
    return (
      <main className="h-screen overflow-hidden animate-in fade-in duration-1000">
        <NeoDashboard />
      </main>
    )
  }

  return (
    <main className="h-screen w-full bg-[#050505] overflow-hidden relative flex flex-col items-center justify-center text-center px-6">
      {/* Neural Background Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] animate-pulse rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] animate-pulse rounded-full [animation-delay:2s]" />
        
        {/* Animated Grid/Neural Pattern */}
        <div 
          className="absolute inset-0 opacity-20" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)`,
            backgroundSize: '40px 40px' 
          }} 
        />
        
        {/* Floating Particles (CSS Only) */}
        <div className="absolute inset-0 overflow-hidden">
             {[...Array(20)].map((_, i) => (
               <div 
                 key={i}
                 className="absolute bg-blue-500/20 rounded-full blur-[2px] animate-float"
                 style={{
                   width: Math.random() * 4 + 2 + 'px',
                   height: Math.random() * 4 + 2 + 'px',
                   left: Math.random() * 100 + '%',
                   top: Math.random() * 100 + '%',
                   animationDuration: Math.random() * 10 + 10 + 's',
                   animationDelay: Math.random() * -20 + 's'
                 }}
               />
             ))}
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl space-y-12">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-blue-400 text-xs font-black uppercase tracking-[0.4em] animate-in slide-in-from-top-10 duration-1000">
          <Cpu className="h-4 w-4" /> System v.4.0 Online
        </div>

        <h1 className="text-7xl md:text-9xl font-heading font-black text-white tracking-tighter leading-[0.9] animate-in fade-in slide-in-from-bottom-10 duration-1000 [animation-delay:200ms]">
          The <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-500 via-blue-400 to-indigo-600">Neural</span> Hub
        </h1>

        <p className="text-xl md:text-2xl font-serif text-slate-400 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-10 duration-1000 [animation-delay:400ms]">
          Synthesizing intelligence through <span className="special-word text-white">recursive neural loops</span> and high-contrast logic. Designed for the operators of tomorrow.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-10 animate-in fade-in slide-in-from-bottom-10 duration-1000 [animation-delay:600ms]">
          <Button 
            onClick={() => setShowDashboard(true)}
            size="lg"
            className="h-16 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-black uppercase tracking-[0.3em] shadow-[0_0_40px_rgba(37,99,235,0.3)] transition-all hover:scale-105 active:scale-95 group"
          >
            Connect Neural Link <ArrowRight className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-2" />
          </Button>
          
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-600">
            <span className="flex items-center gap-2"><Zap className="h-3 w-3 text-amber-500" /> Low Latency</span>
            <span className="h-1 w-1 rounded-full bg-slate-800" />
            <span className="flex items-center gap-2"><Cpu className="h-3 w-3 text-blue-500" /> Edge Compute</span>
          </div>
        </div>
      </div>

      {/* Landing Footer Info */}
      <div className="absolute bottom-10 left-0 w-full px-10 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-800 opacity-50">
        <div>Neo AI // Global Operations</div>
        <div className="flex gap-8">
          <span>Established 2026</span>
          <span className="text-blue-900">•</span>
          <span>Encrypted Protocol</span>
        </div>
      </div>
    </main>
  )
}
