"use client";

import React, { useState } from 'react';
import { useAuth } from "@/components/AuthContext";
import LoginModal from "@/components/LoginModal";
import { LogOut, User as UserIcon } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Chart from '@/components/Chart';
import InteractivePrompt from '@/components/InteractivePrompt';

export default function PrizmLandingPage() {
  const { user, loading, logout } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-transparent text-white font-sans selection:bg-brand-purple/30 selection:text-white">
      <main className="max-w-6xl mx-auto px-6">
        
        {/* Section 1: Signature Hero */}
        <section className="pt-32 pb-16 text-center max-w-4xl mx-auto px-4 relative z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-purple/20 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tighter mb-6 leading-tight text-white drop-shadow-md">
            Unblind the <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-purple to-[#d8b4fe] inline-block">Data.</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Complexity shouldn't be a barrier to insight. We built a visual environment for independent minds to refine, simulate, and validate their market theories with institutional-grade precision.
          </p>
          
          <div className="mt-4 flex flex-col sm:flex-row items-center gap-4 justify-center">
            <button 
              onClick={() => user ? router.push('/sandbox') : setIsLoginOpen(true)}
              className="px-10 py-4 rounded-full bg-gradient-to-r from-brand-purple to-[#a21caf] text-white font-extrabold tracking-wide text-lg shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Launch Sandbox →
            </button>
            <Link 
              href="/features#how-to-use"
              className="w-10 h-10 rounded-full bg-white/5 border border-white/20 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              title="How to Use & Guidelines"
            >
              ?
            </Link>
          </div>
          <div className="mt-3 text-sm text-slate-400 font-mono">Free • Signup required</div>
        </section>

        {/* Section 2: Story Behind the Name */}
        <section className="py-16 text-center max-w-3xl mx-auto relative z-10">
          <div className="inline-block px-4 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-purple text-xs font-bold tracking-widest mb-6 uppercase shadow-[0_0_15px_rgba(139,92,246,0.15)]">
            Story Behind the Name
          </div>
          <h2 className="text-3xl font-bold mb-6 tracking-tight text-white">The "Prizm" Philosophy</h2>
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed italic">
            "Market data is often a blinding stream of raw information. Much like a prism takes white light and reveals its component colors, we designed our platform to take that overwhelming noise and organize it into a clear, actionable spectrum."
          </p>
        </section>

        {/* Section 3: Visualizer Intro */}
        <section className="py-12 text-center max-w-5xl mx-auto relative z-10">
           <h2 className="text-4xl font-bold mb-4 tracking-tighter leading-tight text-white drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">Historical Sandbox</h2>
           <p className="text-xl text-slate-400 leading-relaxed mb-12">Simulate real markets natively with institutional grade performance.</p>
           
           {/* Chart Component Integration */}
           <div className="mx-auto w-full max-w-4xl mb-12">
             <Chart />
           </div>
        </section>

        {/* Section 4: What is Prizm? */}
        <section className="py-20 border-t border-white/10 bg-white/5 backdrop-blur-md rounded-[3rem] px-8 text-center max-w-5xl mx-auto shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight text-white">Evolving the Analytical Experience</h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            As developers and students of the market, we noticed a persistent gap. Prizm is our answer: a high-fidelity, no-code sandbox where **logic remains the primary focus.**
          </p>
        </section>

        {/* Section 5: Features */}
        <section className="py-24 border-t border-white/10 relative z-10">
          <div className="text-center mb-24 max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold mb-4 tracking-tighter leading-tight text-white drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">The Double Prism Engine</h2>
            <p className="text-xl text-slate-400 leading-relaxed">Engineering clarity through multi-threaded simulation.</p>
          </div>
          
          <div className="flex flex-col space-y-24 md:space-y-32">
            
            {/* Feature 1: The Effect */}
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="w-full md:w-1/2 flex justify-center">
                <InteractivePrompt />
              </div>
              <div className="w-full md:w-1/2 text-left">
                <div className="w-12 h-12 bg-brand-purple/20 border border-brand-purple/50 rounded-full flex items-center justify-center text-brand-purple font-bold mb-6 shadow-[0_0_15px_rgba(139,92,246,0.3)]">1</div>
                <h3 className="text-3xl font-extrabold mb-4 tracking-tight text-white flex items-center gap-3">
                  The Double Prism Effect.
                  <Link href="/features#walk-forward" className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-slate-300 hover:text-white hover:bg-brand-purple transition-colors" title="Learn More">?</Link>
                </h3>
                <p className="text-lg text-slate-300 leading-relaxed">
                  Our engine disperses your initial hypothesis into multiple logical threads, allowing you to examine strategy integrity across various market conditions.
                </p>
              </div>
            </div>

            {/* Feature 2: Visual Logic */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
              <div className="w-full md:w-1/2 flex justify-center">
                 <div className="w-full max-w-sm relative text-left">
                    <div className="bg-white border-2 border-brand-purple shadow-lg rounded-xl p-4 w-64 relative z-10 mb-4 ml-8">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-brand-purple uppercase tracking-wider">Condition</span>
                        <div className="h-2 w-2 rounded-full bg-slate-200"></div>
                      </div>
                      <div className="font-mono text-sm text-slate-700">Moving Average (50) crosses Above Price</div>
                    </div>
                    <div className="absolute left-16 top-20 w-px h-16 bg-slate-300 -z-10"></div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 w-64 ml-auto">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Action</span>
                        <div className="h-2 w-2 rounded-full bg-green-400"></div>
                      </div>
                      <div className="font-mono text-sm font-bold text-slate-900">Execute BUY Order</div>
                    </div>
                 </div>
              </div>
              <div className="w-full md:w-1/2 text-left">
                <div className="w-12 h-12 bg-brand-purple/20 border border-brand-purple/50 rounded-full flex items-center justify-center text-brand-purple font-bold mb-6 shadow-[0_0_15px_rgba(139,92,246,0.3)]">2</div>
                <h3 className="text-3xl font-extrabold mb-4 tracking-tight text-white flex items-center gap-3">
                  Modular Logic, Zero Code.
                  <Link href="/features#how-to-use" className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-slate-300 hover:text-white hover:bg-brand-purple transition-colors" title="Learn More">?</Link>
                </h3>
                <p className="text-lg text-slate-300 leading-relaxed">
                  Build strategies in our high-fidelity visual canvas. Drag-and-drop interlocking digital blocks to connect professional-grade indicators and patterns.
                </p>
              </div>
            </div>

            {/* Feature 3: Time Machine */}
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="w-full md:w-1/2 flex justify-center">
                 <div className="w-full max-w-sm bg-slate-900 rounded-2xl p-6 shadow-xl overflow-hidden relative text-left">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-purple to-transparent opacity-50"></div>
                    <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-xs font-mono text-slate-500 ml-2">backtest_engine.sh</span>
                    </div>
                    <div className="font-mono text-sm space-y-2">
                      <div className="text-slate-400">&gt; Initializing Historical Data... <span className="text-green-400">OK</span></div>
                      <div className="text-slate-400">&gt; Processing 5 years (2019-2024)...</div>
                      <div className="text-brand-purple animate-pulse">&gt; Executing trades... 14,203 simulated</div>
                      <div className="pt-4 border-t border-slate-800 mt-4 flex justify-between text-white">
                        <span>Win Rate: <strong className="text-green-400">68.4%</strong></span>
                        <span>Max DD: <strong className="text-red-400">-12.1%</strong></span>
                      </div>
                    </div>
                 </div>
              </div>
              <div className="w-full md:w-1/2 text-left">
                <div className="w-12 h-12 bg-brand-purple/20 border border-brand-purple/50 rounded-full flex items-center justify-center text-brand-purple font-bold mb-6 shadow-[0_0_15px_rgba(139,92,246,0.3)]">3</div>
                <h3 className="text-3xl font-extrabold mb-4 tracking-tight text-white flex items-center gap-3">
                  The Time Machine.
                  <Link href="/features#tax-simulation" className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-slate-300 hover:text-white hover:bg-brand-purple transition-colors" title="Learn More">?</Link>
                </h3>
                <p className="text-lg text-slate-300 leading-relaxed">
                  Validation requires data. Our simulation engine processes 5+ years of historical market cycles in seconds to provide a quiet, objective look at the past.
                </p>
              </div>
            </div>

            {/* Feature 4: Natural Language to Logic */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
              <div className="w-full md:w-1/2 flex justify-center">
                 <div className="w-full max-w-sm relative text-left">
                    <div className="bg-slate-900 border border-slate-800 shadow-xl rounded-xl p-4 w-full relative z-10 mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-md bg-brand-purple/20 flex items-center justify-center">
                          <span className="text-brand-purple text-xs font-bold">AI</span>
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Strategy Prompt</span>
                      </div>
                      <div className="font-mono text-sm text-slate-300 italic mb-4">
                        "Nifty par buy karo jab RSI 30 ke neeche ho aur volume spike ho"
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs font-mono bg-brand-purple/20 text-brand-purple px-2 py-1 rounded">RSI &lt; 30</span>
                        <span className="text-xs font-mono bg-brand-purple/20 text-brand-purple px-2 py-1 rounded">Volume Spike</span>
                        <span className="text-xs font-mono bg-green-500/20 text-green-400 px-2 py-1 rounded">BUY Nifty</span>
                      </div>
                    </div>
                 </div>
              </div>
              <div className="w-full md:w-1/2 text-left">
                <div className="w-12 h-12 bg-brand-purple/20 border border-brand-purple/50 rounded-full flex items-center justify-center text-brand-purple font-bold mb-6 shadow-[0_0_15px_rgba(139,92,246,0.3)]">4</div>
                <h3 className="text-3xl font-extrabold mb-4 tracking-tight text-white flex items-center gap-3">
                  Speak Your Strategy.
                  <Link href="/features#nlp" className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-slate-300 hover:text-white hover:bg-brand-purple transition-colors" title="Learn More">?</Link>
                </h3>
                <p className="text-lg text-slate-300 leading-relaxed">
                  Our AI-powered NLP engine understands how Indian traders actually speak. Type your strategy in natural language (or even Hinglish) and watch it instantly convert into precise, executable logic blocks.
                </p>
              </div>
            </div>

            {/* Feature 5: Social Copy Trading */}
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="w-full md:w-1/2 flex justify-center">
                 <div className="w-full max-w-sm glass-panel rounded-2xl p-6 relative text-left">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-sandbox-border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-lg">🏆</div>
                        <div>
                          <div className="font-bold text-white">QuantMaster99</div>
                          <div className="text-xs text-slate-400">BankNifty Scalper</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-candle-green font-bold text-lg">+142%</div>
                        <div className="text-xs text-slate-400">Return</div>
                      </div>
                    </div>
                    <button className="w-full py-2 bg-brand-purple/20 hover:bg-brand-purple/40 border border-brand-purple/50 text-white rounded-lg text-sm font-bold transition-colors">
                      Clone Strategy
                    </button>
                 </div>
              </div>
              <div className="w-full md:w-1/2 text-left">
                <div className="w-12 h-12 bg-brand-purple/20 border border-brand-purple/50 rounded-full flex items-center justify-center text-brand-purple font-bold mb-6 shadow-[0_0_15px_rgba(139,92,246,0.3)]">5</div>
                <h3 className="text-3xl font-extrabold mb-4 tracking-tight text-white flex items-center gap-3">
                  Social Copy Trading.
                  <Link href="/features#how-to-use" className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-slate-300 hover:text-white hover:bg-brand-purple transition-colors" title="Learn More">?</Link>
                </h3>
                <p className="text-lg text-slate-300 leading-relaxed">
                  Don't start from scratch. Browse the Community Leaderboard to discover high-performing strategies. Analyze their backtest results, and clone their logic directly into your sandbox with a single click.
                </p>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 mt-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-start gap-4 text-left">
            <div className="font-bold text-xl tracking-tight text-slate-500">PRIZM</div>
            <div className="text-brand-purple font-semibold text-lg">
              Proudly being built in Ahmedabad.
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <a 
              href="https://instagram.com/useprizm.in" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-slate-500 hover:text-brand-purple transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              <span className="font-medium">useprizm.in</span>
            </a>
          </div>
        </div>
      </footer>
      
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}