"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { Loader2, BrainCircuit, Zap, Search, TrendingUp, ArrowLeft, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import StockSearch from "@/components/sandbox/StockSearch";
import { getCredits, deductCredits, CREDIT_COSTS } from "@/lib/credits";

export default function QuantEdgePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [currentSymbol, setCurrentSymbol] = useState("^NSEI");
  const [currentName, setCurrentName] = useState("Nifty 50 Index");
  const [quantInsights, setQuantInsights] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);

  // Protect route
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Load credits
  useEffect(() => {
    if (user) {
      getCredits(user.uid).then(setCredits);
    }
  }, [user]);

  const handleStockSelect = (symbol: string, name: string) => {
    setCurrentSymbol(symbol);
    setCurrentName(name);
    setQuantInsights(null);
  };

  const handleGenerate = async () => {
    if (!currentSymbol || !currentName) return;

    if (user && credits !== null && credits < 2) {
      alert("Insufficient credits for this action.");
      return;
    }

    setIsGenerating(true);
    setQuantInsights(null);

    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api/quant-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: currentSymbol,
          company_name: currentName,
        }),
      });

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No readable stream");

      const decoder = new TextDecoder();
      let done = false;
      let streamedText = "";
      setQuantInsights("");

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value, { stream: true });
        streamedText += chunk;
        setQuantInsights(streamedText);
      }
    } catch (err) {
      console.error("Failed to generate quant insights:", err);
    } finally {
      setIsGenerating(false);
      if (user) {
        const newBal = await deductCredits(user.uid, 2);
        if (newBal >= 0) setCredits(newBal);
      }
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
      </div>
    );
  }

  const displaySymbol = currentSymbol.replace(".NS", "").replace(".BO", "");

  return (
    <div className="min-h-screen bg-transparent text-white font-sans">
      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-purple text-xs font-bold tracking-widest mb-6 uppercase">
              <Sparkles className="w-3.5 h-3.5" /> Alternative Data Intelligence
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-4">
              Quant <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-purple to-[#d8b4fe]">Edge</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Get institutional-grade alternative data theses powered by Prizm AI. Analyze satellite imagery, foot traffic, search trends, and credit card data for any stock.
            </p>
          </div>

          {/* Stock Selector */}
          <div className="max-w-md mx-auto mb-8">
            <div className="glass-panel rounded-xl p-6">
              <h3 className="text-xs font-bold text-sandbox-muted uppercase tracking-wider mb-3">Select Instrument</h3>
              <StockSearch onSelect={handleStockSelect} currentSymbol={currentSymbol} />
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold text-white">{displaySymbol}</div>
                  <div className="text-xs text-sandbox-muted">{currentName}</div>
                </div>
                <div className="text-[10px] px-1.5 py-0.5 bg-candle-green/10 text-candle-green border border-candle-green/20 rounded font-mono">
                  ACTIVE
                </div>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          {!quantInsights && !isGenerating && (
            <div className="text-center mb-8">
              <button
                onClick={handleGenerate}
                className="px-8 py-3 bg-gradient-to-r from-brand-purple to-[#a21caf] text-white font-bold rounded-xl text-sm hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Generate Thesis (2⚡)
              </button>
              <p className="text-xs text-sandbox-muted mt-3">
                Costs 2 credits per generation
              </p>
            </div>
          )}

          {/* Loading State */}
          {isGenerating && !quantInsights && (
            <div className="glass-panel rounded-xl p-12 text-center">
              <Loader2 className="w-8 h-8 text-brand-purple animate-spin mx-auto mb-4" />
              <h3 className="text-white font-bold mb-1">Analyzing Alternative Data...</h3>
              <p className="text-xs text-sandbox-muted">Satellite imagery • Foot traffic • Search trends • Credit card data</p>
            </div>
          )}

          {/* Results */}
          {quantInsights !== null && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="glass-panel rounded-xl p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <BrainCircuit className="w-32 h-32 text-brand-purple" />
              </div>
              <div className="flex items-center gap-2 mb-6">
                <BrainCircuit className="w-5 h-5 text-brand-purple" />
                <h3 className="text-sm font-bold text-brand-purple uppercase tracking-wider">
                  AI Thesis — {displaySymbol}
                </h3>
              </div>
              <div
                className="text-sm text-sandbox-text space-y-3 leading-relaxed relative z-10 prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{
                  __html: quantInsights
                    ?.replace(/\n/g, "<br/>")
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') || "",
                }}
              />
              <div className="flex items-center gap-3 mt-8">
                <button
                  onClick={handleGenerate}
                  className="px-6 py-2 bg-brand-purple/20 hover:bg-brand-purple/30 text-brand-purple text-xs font-bold rounded-lg transition-colors border border-brand-purple/30"
                >
                  Regenerate (2⚡)
                </button>
                <button
                  onClick={() => {
                    // Extract a concise prompt from the thesis for the strategy builder
                    const thesisSummary = quantInsights
                      ?.replace(/\*\*/g, "")
                      .split("\n")
                      .filter(line => line.trim().length > 10)
                      .slice(0, 3)
                      .join(". ")
                      .slice(0, 300) || "";
                    const prompt = `Based on Quant Edge thesis for ${displaySymbol}: ${thesisSummary}`;
                    router.push(`/sandbox?quantPrompt=${encodeURIComponent(prompt)}&quantSymbol=${encodeURIComponent(currentSymbol)}&quantName=${encodeURIComponent(currentName)}`);
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-brand-purple to-[#a21caf] text-white text-xs font-bold rounded-lg hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Create Strategy from Thesis →
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
