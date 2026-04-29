"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Activity, BrainCircuit, Globe2, BarChart3, ChevronRight, Target, Newspaper, Sparkles } from "lucide-react";
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

      {/* Core Tools — Explained Simply */}
      <section id="core-tools" className="max-w-5xl mx-auto px-6 pb-20 relative z-10 scroll-mt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-widest mb-4 uppercase">
              New to Trading?
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-white">Our Core Tools — Explained Simply</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">No jargon. Here&apos;s what each tool does in plain English.</p>
          </div>

          <div className="space-y-6">
            {/* Sandbox */}
            <div id="sandbox-explained" className="bg-gradient-to-r from-brand-purple/10 to-transparent border border-brand-purple/20 rounded-2xl p-8 flex items-start gap-6 scroll-mt-24">
              <div className="w-14 h-14 rounded-xl bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center shrink-0">
                <Target className="w-7 h-7 text-brand-purple" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">The Sandbox <span className="text-sm font-mono text-brand-purple">(Strategy Builder & Backtester)</span></h3>
                <p className="text-slate-300 leading-relaxed text-sm">
                  The Sandbox is your risk-free testing ground. Instead of guessing if a trading idea works and risking real money to find out, you can just type your idea in plain English (like <em className="text-white">&quot;buy when the stock drops 5% and volume is high&quot;</em>). Our AI understands your sentence, builds the logic, and instantly tests your idea against years of real historical stock data. Within seconds, it shows you exactly how much money that strategy would have made or lost — including all real Indian taxes and fees deducted automatically.
                </p>
              </div>
            </div>

            {/* Quant Edge */}
            <div id="quant-explained" className="bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-2xl p-8 flex items-start gap-6 scroll-mt-24">
              <div className="w-14 h-14 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Quant Edge <span className="text-sm font-mono text-emerald-400">(Alternative Data & AI Insights)</span></h3>
                <p className="text-slate-300 leading-relaxed text-sm">
                  Quant Edge lets you trade based on real-world events, not just price charts. Billion-dollar hedge funds use &quot;alternative data&quot; to get an unfair advantage — like tracking Google search trends or shipping routes. We bring that power directly to you. You can ask our AI to analyze complex real-world relationships, like <em className="text-white">&quot;What happens to Indian auto stocks when global oil prices go up?&quot;</em>, and it will instantly give you a data-backed answer so you can trade ahead of the curve.
                </p>
              </div>
            </div>

            {/* Market Pulse */}
            <div id="market-explained" className="bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20 rounded-2xl p-8 flex items-start gap-6 scroll-mt-24">
              <div className="w-14 h-14 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Newspaper className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Market Pulse <span className="text-sm font-mono text-blue-400">(Live News Analysis)</span></h3>
                <p className="text-slate-300 leading-relaxed text-sm">
                  Market Pulse is your intelligent financial news reader. The stock market moves fast, and reading hundreds of long articles to find a trading opportunity is impossible. Market Pulse scans the latest live headlines and uses AI to instantly summarize what the news actually means for the market. Instead of just giving you a boring article, it tells you exactly which specific stocks might go up (Bullish) or down (Bearish) because of that news, saving you hours of research.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Advanced Features Grid */}
      <section className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 text-xs font-bold tracking-widest mb-4 uppercase">
            Under the Hood
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-white">Advanced Capabilities</h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto">The institutional-grade technology powering your strategies.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Feature 1 */}
          <motion.div id="smart-risk" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors group relative overflow-hidden scroll-mt-24">
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
          <motion.div id="walk-forward" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors group relative overflow-hidden scroll-mt-24">
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
          <motion.div id="alt-data" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors group relative overflow-hidden scroll-mt-24">
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
          <motion.div id="nlp" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors group relative overflow-hidden scroll-mt-24">
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
        <motion.div id="tax-simulation" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="mt-6 w-full bg-gradient-to-r from-white/5 to-transparent border border-white/10 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 scroll-mt-24">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-6 h-6 text-yellow-400" />
              <h3 className="text-2xl font-bold text-white">Realistic Indian Tax Simulation</h3>
              <span className="ml-2 px-2 py-0.5 rounded-md bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-[10px] font-bold uppercase tracking-wider">Built into the Sandbox</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-sm max-w-2xl">
              Paper trading platforms lie to you. They assume every trade executes perfectly for free. Prizm simulates the harsh reality of the Indian market. Every backtest you run in the Sandbox automatically subtracts Zerodha Brokerage, STT (Securities Transaction Tax), Exchange Fees, GST, Stamp Duty, and Execution Slippage. There is no separate page for this — it&apos;s always active. If your strategy survives our engine, it can survive the real world.
            </p>
          </div>
          <Link href="/sandbox" className="shrink-0 px-8 py-4 rounded-xl bg-white text-black font-extrabold tracking-wide hover:scale-105 transition-transform flex items-center gap-2">
            Try it Now <ChevronRight className="w-5 h-5" />
          </Link>
        </motion.div>

        {/* How to Use & Guidelines */}
        <motion.div id="how-to-use" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className="mt-16 bg-white/5 border border-brand-purple/30 rounded-3xl p-8 md:p-12 scroll-mt-24">
          <h2 className="text-3xl font-extrabold mb-6 tracking-tight text-white">How to Use Prizm & Guidelines</h2>
          
          <div className="space-y-6 text-slate-300">
            <div>
              <h3 className="text-xl font-bold text-brand-purple mb-2">1. Getting Started in the Sandbox</h3>
              <p className="text-sm leading-relaxed mb-2">The Sandbox is where you build your strategies. Simply enter your trading logic in plain English (e.g., "Buy Nifty when RSI is below 30"). The AI will parse this into executable code blocks.</p>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Be as specific as possible with indicators (e.g., "50-day Moving Average").</li>
                <li>Specify conditions for both entry (Buy) and exit (Sell).</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-brand-purple mb-2">2. Using Credits</h3>
              <p className="text-sm leading-relaxed mb-2">Prizm uses a credit system to manage server loads. Every account starts with 50 credits and refreshes daily.</p>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li><strong>Generating Strategies:</strong> 2 Credits</li>
                <li><strong>Running Backtests:</strong> 1 Credit</li>
                <li><strong>Analyzing News:</strong> 2 Credits</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-brand-purple mb-2">3. General Guidelines</h3>
              <p className="text-sm leading-relaxed mb-2">To get the best results, remember that past performance is not indicative of future results. Prizm provides simulation, not financial advice.</p>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Always test strategies over long periods (2-5 years) to ensure they aren't overfitted to a specific month.</li>
                <li>Ensure you have realistic expectations; strategies with 90% win rates in the Sandbox usually fail in live markets due to unforeseen slippage.</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Need Help Section */}
        <motion.div id="help" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }} className="mt-8 text-center bg-black/50 border border-white/10 rounded-3xl p-8 md:p-12 scroll-mt-24">
          <h3 className="text-2xl font-bold mb-4 text-white">Need Help?</h3>
          <p className="text-slate-400 mb-6">If you have any questions, encounter a bug, or need help building a complex strategy, our team is here for you.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="mailto:useprizm.in@gmail.com" className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl font-bold transition-colors">
              useprizm.in
            </a>
            <a href="mailto:swarnimera@gmail.com" className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl font-bold transition-colors">
              swarnimera@gmail.com
            </a>
          </div>
        </motion.div>

      </section>

      {/* Footer */}
      <footer className="mt-10 border-t border-white/10 py-8 text-center">
        <p className="text-slate-500 text-sm font-mono">Prizm © 2026. Built for independent minds.</p>
      </footer>
    </div>
  );
}
