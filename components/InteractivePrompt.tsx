"use client";

import React, { useState } from 'react';

interface Block {
  type: string;
  label: string;
}

export default function InteractivePrompt() {
  const [prompt, setPrompt] = useState("Earn 2% Profit on Nifty");
  const [blocks, setBlocks] = useState<Block[]>([
    { type: "RSI", label: "> 70" },
    { type: "Volume", label: "Spike" },
    { type: "Trailing Stop", label: "Active" }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + '/api/generate-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (data.status === "success") {
        setBlocks(data.blocks);
      }
    } catch (err) {
      console.error("Failed to fetch from NLP Engine:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm bg-slate-50 border border-slate-200 rounded-2xl p-8 shadow-sm">
      <div className="text-xs font-mono text-slate-400 mb-2 uppercase tracking-wider text-left">Input Prompt</div>
      
      <div className="relative mb-6">
        <input 
          type="text" 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          className="w-full bg-white border border-slate-200 p-3 pr-24 rounded-lg text-sm font-medium text-slate-700 text-left focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all"
        />
        <button 
          onClick={handleGenerate}
          disabled={isLoading}
          className="absolute right-1 top-1 bottom-1 px-3 bg-brand-purple hover:bg-brand-purple/90 text-white rounded-md text-xs font-bold transition-colors disabled:opacity-70"
        >
          {isLoading ? '...' : 'GENERATE'}
        </button>
      </div>

      <div className="flex flex-col items-center">
        <div className="h-6 w-px bg-slate-300"></div>
        <div className="w-full border-t border-slate-300 flex justify-center px-2 pt-6 relative min-h-[60px]">
          {blocks.map((block, idx) => (
            <div key={idx} className="flex flex-col items-center mx-2 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="h-2 w-2 rounded-full bg-brand-purple absolute -top-1"></div>
              <span className="text-xs font-mono bg-brand-purple/30 text-brand-purple px-2 py-1 rounded whitespace-nowrap mt-2">
                {block.type} {block.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
