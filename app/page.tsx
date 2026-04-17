import React from 'react';
import Image from 'next/image';
import Chart from '@/components/Chart';
import InteractivePrompt from '@/components/InteractivePrompt';

export default function PrizmLandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-prizm-light selection:text-slate-900">
      
      {/* Navigation */}
      <nav className="max-w-6xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Image 
            src="/logo.jpeg" 
            alt="Prizm Logo" 
            width={82} 
            height={82} 
            priority={true}
            className="object-contain"
          />
          <span className="text-3xl font-bold tracking-tight text-slate-900">PRIZM</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6">
        
        {/* Section 1: Signature Hero */}
        <section className="pt-24 pb-12 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tighter mb-6 leading-tight text-slate-900">
            Unblind the <span className="bg-clip-text text-transparent bg-gradient-to-r from-prizm-deep to-[#a21caf] inline-block">Data.</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Complexity shouldn't be a barrier to insight. We built a visual environment for independent minds to refine, simulate, and validate their market theories with institutional-grade precision.
          </p>
          
          <div className="mt-4">
            <span className="inline-block px-8 py-4 rounded-full border border-prizm-light bg-prizm-light/20 text-prizm-deep font-bold tracking-widest text-lg shadow-sm">
              COMING SOON
            </span>
          </div>
        </section>

        {/* Section 2: Story Behind the Name */}
        <section className="py-16 text-center max-w-3xl mx-auto">
          <div className="inline-block px-4 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-bold tracking-widest mb-6 uppercase">
            Story Behind the Name
          </div>
          <h2 className="text-3xl font-bold mb-6 tracking-tight">The "Prizm" Philosophy</h2>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed italic">
            "Market data is often a blinding stream of raw information. Much like a prism takes white light and reveals its component colors, we designed our platform to take that overwhelming noise and organize it into a clear, actionable spectrum."
          </p>
        </section>

        {/* Section 3: Visualizer Intro */}
        <section className="py-12 text-center max-w-5xl mx-auto">
           <h2 className="text-4xl font-bold mb-4 tracking-tighter leading-tight text-prizm-deep">Historical Sandbox</h2>
           <p className="text-xl text-slate-500 leading-relaxed mb-12">Simulate real markets natively with institutional grade performance.</p>
           
           {/* Chart Component Integration */}
           <div className="mx-auto w-full max-w-4xl mb-12">
             <Chart />
           </div>
        </section>

        {/* Section 4: What is Prizm? */}
        <section className="py-20 border-t border-slate-100 bg-slate-50 rounded-[3rem] px-8 text-center max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">Evolving the Analytical Experience</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            As developers and students of the market, we noticed a persistent gap. Prizm is our answer: a high-fidelity, no-code sandbox where **logic remains the primary focus.**
          </p>
        </section>

        {/* Section 5: Features */}
        <section className="py-24 border-t border-slate-100">
          <div className="text-center mb-24 max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold mb-4 tracking-tighter leading-tight text-prizm-deep">The Double Prism Engine</h2>
            <p className="text-xl text-slate-500 leading-relaxed">Engineering clarity through multi-threaded simulation.</p>
          </div>
          
          <div className="flex flex-col space-y-24 md:space-y-32">
            
            {/* Feature 1: The Effect */}
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="w-full md:w-1/2 flex justify-center">
                <InteractivePrompt />
              </div>
              <div className="w-full md:w-1/2 text-left">
                <div className="w-12 h-12 bg-prizm-light/30 rounded-full flex items-center justify-center text-prizm-deep font-bold mb-6 shadow-sm border border-prizm-light/50">1</div>
                <h3 className="text-3xl font-extrabold mb-4 tracking-tight">The Double Prism Effect.</h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Our engine disperses your initial hypothesis into multiple logical threads, allowing you to examine strategy integrity across various market conditions.
                </p>
              </div>
            </div>

            {/* Feature 2: Visual Logic */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
              <div className="w-full md:w-1/2 flex justify-center">
                 <div className="w-full max-w-sm relative text-left">
                    <div className="bg-white border-2 border-prizm-deep shadow-lg rounded-xl p-4 w-64 relative z-10 mb-4 ml-8">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-prizm-deep uppercase tracking-wider">Condition</span>
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
                <div className="w-12 h-12 bg-prizm-light/30 rounded-full flex items-center justify-center text-prizm-deep font-bold mb-6 shadow-sm border border-prizm-light/50">2</div>
                <h3 className="text-3xl font-extrabold mb-4 tracking-tight">Modular Logic, Zero Code.</h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Build strategies in our high-fidelity visual canvas. Drag-and-drop interlocking digital blocks to connect professional-grade indicators and patterns.
                </p>
              </div>
            </div>

            {/* Feature 3: Time Machine */}
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="w-full md:w-1/2 flex justify-center">
                 <div className="w-full max-w-sm bg-slate-900 rounded-2xl p-6 shadow-xl overflow-hidden relative text-left">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-prizm-deep to-transparent opacity-50"></div>
                    <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-xs font-mono text-slate-500 ml-2">backtest_engine.sh</span>
                    </div>
                    <div className="font-mono text-sm space-y-2">
                      <div className="text-slate-400">&gt; Initializing Historical Data... <span className="text-green-400">OK</span></div>
                      <div className="text-slate-400">&gt; Processing 5 years (2019-2024)...</div>
                      <div className="text-prizm-light animate-pulse">&gt; Executing trades... 14,203 simulated</div>
                      <div className="pt-4 border-t border-slate-800 mt-4 flex justify-between text-white">
                        <span>Win Rate: <strong className="text-green-400">68.4%</strong></span>
                        <span>Max DD: <strong className="text-red-400">-12.1%</strong></span>
                      </div>
                    </div>
                 </div>
              </div>
              <div className="w-full md:w-1/2 text-left">
                <div className="w-12 h-12 bg-prizm-light/30 rounded-full flex items-center justify-center text-prizm-deep font-bold mb-6 shadow-sm border border-prizm-light/50">3</div>
                <h3 className="text-3xl font-extrabold mb-4 tracking-tight">The Time Machine.</h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Validation requires data. Our simulation engine processes 5+ years of historical market cycles in seconds to provide a quiet, objective look at the past.
                </p>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 mt-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-start gap-4 text-left">
            <div className="font-bold text-xl tracking-tight text-slate-400">PRIZM</div>
            <div className="text-prizm-deep font-semibold text-lg">
              Proudly being built in Ahmedabad.
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <a 
              href="https://instagram.com/useprizm.in" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-slate-500 hover:text-prizm-deep transition-colors"
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
      
    </div>
  );
}