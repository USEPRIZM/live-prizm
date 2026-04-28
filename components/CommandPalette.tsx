"use client";

import React, { useEffect, useState } from "react";
import { Command } from "cmdk";
import { Search, Home, LineChart, Trophy, Zap, Compass, BrainCircuit } from "lucide-react";
import { useRouter } from "next/navigation";
import { playPop } from "@/lib/audio";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
        playPop();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={() => setOpen(false)} 
      />
      
      {/* Command Palette */}
      <div className="relative w-full max-w-lg bg-sandbox-panel/90 backdrop-blur-xl border border-brand-purple/30 rounded-2xl shadow-[0_0_50px_rgba(139,92,246,0.15)] overflow-hidden">
        <Command
          className="w-full flex flex-col"
          shouldFilter={true}
        >
          <div className="flex items-center px-4 py-3 border-b border-sandbox-border/50">
            <Search className="w-5 h-5 text-brand-purple mr-3" />
            <Command.Input 
              autoFocus 
              placeholder="What do you need?" 
              className="flex-1 bg-transparent border-none text-white text-lg outline-none placeholder:text-sandbox-muted"
            />
            <div className="text-[10px] font-bold tracking-widest uppercase text-sandbox-muted bg-white/5 px-2 py-1 rounded">
              ESC
            </div>
          </div>

          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-sandbox-muted">
              No results found.
            </Command.Empty>

            <Command.Group heading="Navigation" className="px-2 py-2 text-xs font-bold text-sandbox-muted tracking-wider uppercase">
              <Command.Item 
                onSelect={() => { router.push('/'); setOpen(false); playPop(); }}
                className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer text-sm text-white hover:bg-brand-purple/20 transition-colors"
              >
                <Home className="w-4 h-4 text-brand-purple" /> Home
              </Command.Item>
              <Command.Item 
                onSelect={() => { router.push('/sandbox'); setOpen(false); playPop(); }}
                className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer text-sm text-white hover:bg-brand-purple/20 transition-colors"
              >
                <LineChart className="w-4 h-4 text-brand-purple" /> Launch Sandbox
              </Command.Item>
              <Command.Item 
                onSelect={() => { router.push('/markets'); setOpen(false); playPop(); }}
                className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer text-sm text-white hover:bg-brand-purple/20 transition-colors"
              >
                <Compass className="w-4 h-4 text-brand-purple" /> Market Pulse
              </Command.Item>
              <Command.Item 
                onSelect={() => { router.push('/leaderboard'); setOpen(false); playPop(); }}
                className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer text-sm text-white hover:bg-brand-purple/20 transition-colors"
              >
                <Trophy className="w-4 h-4 text-brand-purple" /> Leaderboard
              </Command.Item>
              <Command.Item 
                onSelect={() => { router.push('/quant'); setOpen(false); playPop(); }}
                className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer text-sm text-white hover:bg-brand-purple/20 transition-colors"
              >
                <BrainCircuit className="w-4 h-4 text-brand-purple" /> Quant Edge
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Actions" className="px-2 py-2 text-xs font-bold text-sandbox-muted tracking-wider uppercase border-t border-sandbox-border/50 mt-2 pt-4">
              <Command.Item 
                onSelect={() => { 
                  if (window.location.pathname !== '/sandbox') router.push('/sandbox');
                  setTimeout(() => { document.getElementById("strategy-prompt-input")?.focus(); }, 100);
                  setOpen(false); 
                  playPop();
                }}
                className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer text-sm text-white hover:bg-brand-purple/20 transition-colors"
              >
                <Zap className="w-4 h-4 text-brand-purple" /> Generate Strategy from Prompt
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
