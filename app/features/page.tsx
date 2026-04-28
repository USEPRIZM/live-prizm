"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Activity, BrainCircuit, Globe2, BarChart3, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#03000A] text-white font-sans selection:bg-brand-purple/30">
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 text-center max-w-4xl mx-auto px-4 relative z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-purple/10 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-block px-4 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-purple text-xs font-bold tracking-widest mb-6 uppercase">
            Platform Capabilities
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter mb-6 leading-tight">
            Institutional tools,<br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-purple to-[#d8b4fe]">explained simply.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            We built Prizm because Wall Street shouldn't be the only place with access to advanced risk management, alternative data, and AI-driven analysis. Here's exactly how our platform gives you the edge.
          </p>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Feature 1 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheck className="w-32 h-32 text-brand-purple" />
            </div>
            <div className="w-12 h-12 rounded-xl bg-brand-purple/20 flex items-center justify-center mb-6 border border-brand-purple/30">
              <ShieldCheck className="w-6 h-6 text-brand-purple" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Smart Risk Sizing</h3>
            <h4 className="text-sm font-mono text-brand-purple mb-4">Behind the scenes: Position Sizing & ATR Stops</h4>
            <p className="text-slate-400 leading-relaxed text-sm mb-4">
              Most beginners buy exactly 100 shares of a stock regardless of how volatile it is. This is incredibly dangerous.
            </p>
            <p className="text-slate-400 leading-relaxed text-sm">
              <strong className="text-white">How Prizm helps:</strong> You can simply tell our AI, "Risk 2% of my capital." Our engine automatically analyzes the stock's normal daily swings (Volatility/ATR) and calculates the exact number of shares to buy so that if a crash happens, you only lose a safely controlled 2%.
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity className="w-32 h-32 text-blue-400" />
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6 border border-blue-500/30">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Walk-Forward Validation</h3>
            <h4 className="text-sm font-mono text-blue-400 mb-4">Behind the scenes: Train vs. Blind Test Splits</h4>
            <p className="text-slate-400 leading-relaxed text-sm mb-4">
              It's easy to build a strategy that looks amazing in the past, but completely fails tomorrow. This is called "overfitting."
            </p>
            <p className="text-slate-400 leading-relaxed text-sm">
              <strong className="text-white">How Prizm helps:</strong> Every time you run a backtest, Prizm secretly hides the last 30% of the data. It trains your strategy on the first 70%, and then blindly tests it on the hidden 30%. We then give your strategy a "Robustness Grade" so you know if it's actually reliable.
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Globe2 className="w-32 h-32 text-emerald-400" />
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-6 border border-emerald-500/30">
              <Globe2 className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Alternative Data Integration</h3>
            <h4 className="text-sm font-mono text-emerald-400 mb-4">Behind the scenes: Search Trends & Synthetics</h4>
            <p className="text-slate-400 leading-relaxed text-sm mb-4">
              Charts only show you what has already happened. The best hedge funds look at real-world data to guess what will happen next.
            </p>
            <p className="text-slate-400 leading-relaxed text-sm">
              <strong className="text-white">How Prizm helps:</strong> Our "Quant Edge" allows you to build strategies using non-price data. You can tell the engine to "buy when Google Search interest for a company spikes" or "buy when Satellite imagery shows full parking lots."
            </p>
          </motion.div>

          {/* Feature 4 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <BrainCircuit className="w-32 h-32 text-[#d8b4fe]" />
            </div>
            <div className="w-12 h-12 rounded-xl bg-brand-purple/20 flex items-center justify-center mb-6 border border-brand-purple/30">
              <BrainCircuit className="w-6 h-6 text-[#d8b4fe]" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Natural Language Programming</h3>
            <h4 className="text-sm font-mono text-[#d8b4fe] mb-4">Behind the scenes: Prizm AI Parser</h4>
            <p className="text-slate-400 leading-relaxed text-sm mb-4">
              To test a trading idea, you normally have to spend months learning Python, connecting to data APIs, and writing hundreds of lines of code.
            </p>
            <p className="text-slate-400 leading-relaxed text-sm">
              <strong className="text-white">How Prizm helps:</strong> You just type what you want in plain English. <em>"Buy when the price drops below the 50-day average and volume spikes."</em> Our proprietary AI immediately translates your sentence into mathematical code blocks and runs the simulation.
            </p>
          </motion.div>

        </div>

        {/* Real Costs Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="mt-6 w-full bg-gradient-to-r from-white/5 to-transparent border border-white/10 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-6 h-6 text-yellow-400" />
              <h3 className="text-2xl font-bold text-white">Realistic Indian Tax Simulation</h3>
            </div>
            <p className="text-slate-400 leading-relaxed text-sm max-w-2xl">
              Paper trading platforms lie to you. They assume every trade executes perfectly for free. Prizm simulates the harsh reality of the Indian market. Every backtest automatically subtracts Zerodha Brokerage, STT (Securities Transaction Tax), Exchange Fees, GST, Stamp Duty, and Execution Slippage. If your strategy survives our engine, it can survive the real world.
            </p>
          </div>
          <Link href="/sandbox" className="shrink-0 px-8 py-4 rounded-xl bg-white text-black font-extrabold tracking-wide hover:scale-105 transition-transform flex items-center gap-2">
            Try it Now <ChevronRight className="w-5 h-5" />
          </Link>
        </motion.div>

      </section>

      {/* Footer */}
      <footer className="mt-20 border-t border-white/10 py-8 text-center">
        <p className="text-slate-500 text-sm font-mono">Prizm © 2026. Built for independent minds.</p>
      </footer>
    </div>
  );
}
