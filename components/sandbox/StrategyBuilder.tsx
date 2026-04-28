"use client";

import React, { useState } from "react";
import { Zap, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { playTick, playSuccess } from "@/lib/audio";

interface Block {
  type: string;
  label: string;
}

interface StrategyBuilderProps {
  onBlocksGenerated?: (blocks: Block[]) => void;
  onRunBacktest?: (blocks: Block[]) => void;
  onSaveStrategy?: (prompt: string, blocks: Block[]) => void;
  isBacktesting?: boolean;
  currentSymbol?: string;
  initialPrompt?: string;
  initialBlocks?: Block[];
}

const STARTER_PACKS = [
  {
    title: "The Trend Follower",
    prompt: "Moving Average cross above 50 with trailing stop",
    desc: "Captures upward trends by buying when short-term momentum overtakes long-term."
  },
  {
    title: "The Reversal Hunter",
    prompt: "Buy when RSI drops below 30",
    desc: "Looks for moments when a stock is 'oversold' and likely to bounce back up."
  },
  {
    title: "The Breakout",
    prompt: "Volume spike with Resistance break",
    desc: "Buys when a stock breaks a price ceiling with high trading activity."
  },
  {
    title: "The Quant Edge",
    prompt: "Buy when Google Trends spikes and Foot Traffic is high",
    desc: "Uses alternative data (search interest & geolocation) to predict earnings surprises."
  },
  {
    title: "The Risk Manager",
    prompt: "Buy on Bollinger squeeze, risking 2% of capital with a 2 ATR stop",
    desc: "Demonstrates institutional risk parity sizing and volatility-adjusted stops."
  }
];

export default function StrategyBuilder({
  onBlocksGenerated,
  onRunBacktest,
  isBacktesting = false,
  currentSymbol,
  initialPrompt = "",
  initialBlocks = [],
  onSaveStrategy,
}: StrategyBuilderProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [isGenerating, setIsGenerating] = useState(false);
  const [strategyId, setStrategyId] = useState<string | null>(null);

  // Sync initial props
  React.useEffect(() => {
    if (initialPrompt) setPrompt(initialPrompt);
    if (initialBlocks.length > 0) setBlocks(initialBlocks);
  }, [initialPrompt, initialBlocks]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api/generate-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setBlocks(data.blocks);
        setStrategyId(data.strategy_id);
        playTick();
        onBlocksGenerated?.(data.blocks);
      }
    } catch (err) {
      console.error("Strategy generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const removeBlock = (index: number) => {
    const newBlocks = blocks.filter((_, i) => i !== index);
    setBlocks(newBlocks);
    playTick();
    onBlocksGenerated?.(newBlocks);
  };

  const handleRunBacktest = () => {
    if (blocks.length === 0) return;
    playTick();
    onRunBacktest?.(blocks);
  };

  const fillExample = (example: string) => {
    setPrompt(example);
    playTick();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-prizm-deep" />
        <h4 className="text-sm font-bold text-white tracking-wide uppercase">Strategy Builder</h4>
        {strategyId && (
          <span className="text-[10px] font-mono text-sandbox-muted ml-auto">
            {strategyId}
          </span>
        )}
      </div>

      {/* Prompt input */}
      <div className="relative mb-3">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleGenerate();
            }
          }}
          placeholder="Describe your trading strategy in plain English..."
          rows={3}
          className="w-full bg-black/40 border border-sandbox-border rounded-xl px-4 py-3 text-sm text-sandbox-text placeholder-sandbox-muted focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/30 transition-all resize-none font-mono shadow-inner"
          id="strategy-prompt-input"
        />
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="absolute right-3 bottom-3 px-4 py-2 bg-brand-purple hover:bg-brand-purple/90 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-lg shadow-brand-purple/20"
        >
          {isGenerating ? (
            <><Loader2 className="w-3 h-3 animate-spin" /> PARSING...</>
          ) : (
            <>⚡ GENERATE</>
          )}
        </button>
      </div>

      {/* Strategy Starter Packs */}
      {blocks.length === 0 && (
        <div className="mb-4 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <div className="text-[10px] uppercase tracking-wider text-sandbox-muted mb-3 font-bold">
            Starter Strategies (Click to Apply)
          </div>
          <div className="flex flex-col gap-2">
            {STARTER_PACKS.map((pack, idx) => (
              <button
                key={idx}
                onClick={() => fillExample(pack.prompt)}
                className="text-left bg-white/5 hover:bg-white/10 border border-sandbox-border hover:border-brand-purple/30 rounded-xl p-3 transition-all hover:-translate-y-0.5 group"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-white group-hover:text-brand-purple transition-colors">{pack.title}</span>
                  <span className="text-[10px] text-sandbox-muted group-hover:text-brand-purple transition-colors font-mono">Apply ⚡</span>
                </div>
                <div className="text-[11px] text-sandbox-muted leading-snug">{pack.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Generated blocks */}
      {blocks.length > 0 && (
        <div className="mb-4 animate-fade-in-up">
          <div className="text-[10px] uppercase tracking-wider text-sandbox-muted mb-2 font-bold">
            Strategy Conditions
          </div>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {blocks.map((block, idx) => (
                <motion.div
                  key={`${block.type}-${idx}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-1.5 bg-brand-purple/10 border border-brand-purple/30 rounded-lg px-3 py-1.5 group"
                >
                  <span className="text-xs font-mono font-bold text-brand-purple">
                    {block.type}
                  </span>
                  <span className="text-xs font-mono text-white">
                    {block.label}
                  </span>
                  <button
                    onClick={() => removeBlock(idx)}
                    className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-candle-red/20 rounded"
                  >
                    <X className="w-3 h-3 text-candle-red" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Run Backtest button */}
      {blocks.length > 0 && (
        <div className="mt-auto pt-4 flex gap-2">
          <button 
            onClick={handleRunBacktest}
            disabled={isBacktesting || !currentSymbol}
            className="flex-1 py-4 bg-gradient-to-r from-brand-purple to-[#a21caf] hover:from-[#a21caf] hover:to-brand-purple text-white rounded-xl text-sm font-extrabold tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-brand-purple/25 hover:shadow-xl hover:shadow-brand-purple/40 hover:-translate-y-0.5"
          >
            {isBacktesting ? <><Loader2 className="w-5 h-5 animate-spin" /> Running Simulation...</> : `RUN BACKTEST ${currentSymbol ? `on ${currentSymbol.replace('.NS', '').replace('.BO', '')}` : ''}`}
          </button>
          {onSaveStrategy && (
            <button 
              onClick={() => onSaveStrategy(prompt, blocks)}
              className="px-4 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-sm transition-colors border border-white/10 flex items-center justify-center"
            >
              Save
            </button>
          )}
        </div>
      )}

      {!currentSymbol && blocks.length > 0 && (
        <div className="text-[10px] text-center text-sandbox-muted mt-2">
          Select a stock first to run a backtest
        </div>
      )}
    </div>
  );
}
