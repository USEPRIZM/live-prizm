"use client";

import React, { useState, useCallback, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Info, TrendingUp, TrendingDown, Clock, Zap, Target, BarChart2, Download, Save, ShieldAlert, CheckCircle2, User as UserIcon, Home, Compass, LayoutDashboard, Trophy, X, BrainCircuit, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import StockSearch from "@/components/sandbox/StockSearch";
import SandboxChart from "@/components/sandbox/SandboxChart";
import StrategyBuilder from "@/components/sandbox/StrategyBuilder";
import BacktestResults from "@/components/sandbox/BacktestResults";
import StatusBar from "@/components/sandbox/StatusBar";
import GuidedTour from "@/components/sandbox/GuidedTour";
import { useAuth } from "@/components/AuthContext";
import LoginModal from "@/components/LoginModal";
import { LogOut } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDoc, doc } from "firebase/firestore";
import { getCredits, deductCredits, refreshDailyCredits, CREDIT_COSTS } from "@/lib/credits";

interface Block {
  type: string;
  label: string;
}

interface BacktestMetrics {
  totalReturn: number;
  winRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
  totalTrades: number;
  startingCapital: number;
  endingCapital: number;
}

interface TradeLogEntry {
  date: string;
  action: string;
  price: number;
  pnl: number;
}

interface EquityCurvePoint {
  date: string;
  equity: number;
}

function SandboxContent() {
  // Stock state
  const [currentSymbol, setCurrentSymbol] = useState("^NSEI");
  const [currentName, setCurrentName] = useState("Nifty 50 Index");
  const [dataPoints, setDataPoints] = useState(0);
  const [currentRange, setCurrentRange] = useState("1y");

  // Strategy state
  const [strategyBlocks, setStrategyBlocks] = useState<Block[]>([]);
  const [initialPrompt, setInitialPrompt] = useState("");
  const [initialBlocks, setInitialBlocks] = useState<Block[]>([]);

  // Backtest state
  const [isBacktesting, setIsBacktesting] = useState(false);
  const [backtestMetrics, setBacktestMetrics] = useState<BacktestMetrics | null>(null);
  const [equityCurve, setEquityCurve] = useState<EquityCurvePoint[]>([]);
  const [tradeLog, setTradeLog] = useState<TradeLogEntry[]>([]);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [walkForwardResults, setWalkForwardResults] = useState<any | null>(null);

  // Quant Insights
  const [quantInsights, setQuantInsights] = useState<string | null>(null);
  const [isGeneratingQuant, setIsGeneratingQuant] = useState(false);

  const { user, loading, logout } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const router = useRouter();

  // Credit system
  const [credits, setCredits] = useState<number | null>(null);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditAction, setCreditAction] = useState("");

  // Protect route
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Load credits on mount
  useEffect(() => {
    if (user) {
      refreshDailyCredits(user.uid).then(setCredits);
    }
  }, [user]);

  // Save Modal
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [savePrompt, setSavePrompt] = useState("");
  const [saveBlocks, setSaveBlocks] = useState<Block[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const searchParams = useSearchParams();

  // Load strategy from URL
  useEffect(() => {
    const strategyId = searchParams.get("strategyId");
    if (!strategyId) return;

    const loadStrategy = async () => {
      try {
        const docRef = doc(db, "strategies", strategyId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setInitialPrompt(data.prompt);
          setInitialBlocks(data.logic);
          setStrategyBlocks(data.logic);
        }
      } catch (err) {
        console.error("Error loading strategy:", err);
      }
    };
    loadStrategy();
  }, [searchParams]);

  // Load strategy from Quant Edge thesis
  useEffect(() => {
    const quantPrompt = searchParams.get("quantPrompt");
    const quantSymbol = searchParams.get("quantSymbol");
    const quantName = searchParams.get("quantName");
    if (!quantPrompt) return;

    // Set the stock if provided
    if (quantSymbol) setCurrentSymbol(quantSymbol);
    if (quantName) setCurrentName(quantName);

    // Set the prompt so StrategyBuilder auto-fills it
    setInitialPrompt(quantPrompt);
  }, [searchParams]);

  const handleStockSelect = useCallback((symbol: string, name: string) => {
    setCurrentSymbol(symbol);
    setCurrentName(name);
    setBacktestMetrics(null);
    setEquityCurve([]);
    setTradeLog([]);
    setAiInsight(null);
    setWalkForwardResults(null);
    setQuantInsights(null); // Reset quant insights on stock change
  }, []);

  const handleDataLoaded = useCallback((count: number) => {
    setDataPoints(count);
    setIsConnected(true);
  }, []);

  const handleRangeChange = useCallback((range: string) => {
    setCurrentRange(range);
  }, []);

  const handleBlocksGenerated = useCallback((blocks: Block[]) => {
    setStrategyBlocks(blocks);
  }, []);

  const handleRunBacktest = useCallback(
    async (blocks: Block[]) => {
      if (!currentSymbol || blocks.length === 0) return;

      // Credit check
      if (user && credits !== null && credits < CREDIT_COSTS.RUN_BACKTEST) {
        setCreditAction("Run Backtest");
        setShowCreditModal(true);
        return;
      }

      setIsBacktesting(true);
      setBacktestMetrics(null);
      setAiInsight(null);
      setWalkForwardResults(null);

      try {
        const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api/run-backtest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            symbol: currentSymbol,
            blocks: blocks,
            range: currentRange,
          }),
        });
        
        const data = await res.json();
        
        if (data.status === "success") {
          setBacktestMetrics(data.metrics);
          setEquityCurve(data.equityCurve || []);
          setTradeLog(data.tradeLog || []);
          setWalkForwardResults(data.walkForward || null);
          
          if (data.tradeLog && data.tradeLog.length > 0) {
            const winR = data.metrics.winRate;
            if (winR > 50) setAiInsight(`AI Note: This strategy is performing exceptionally well with a ${winR.toFixed(1)}% win rate!`);
            else setAiInsight(`AI Note: This strategy has a win rate of ${winR.toFixed(1)}%. Consider adding a stop-loss or adjusting momentum thresholds.`);
          } else {
            setAiInsight("AI Note: No trades were triggered. The conditions might be too strict for this timeframe.");
          }
        }
      } catch (err) {
        console.error("Backtest failed:", err);
      } finally {
        setIsBacktesting(false);
        // Deduct credits on success
        if (user) {
          const newBal = await deductCredits(user.uid, CREDIT_COSTS.RUN_BACKTEST);
          if (newBal >= 0) setCredits(newBal);
        }
      }
    },
    [currentSymbol, currentRange, user, credits]
  );

  const handleGenerateQuantInsights = async () => {
    if (!currentSymbol || !currentName) return;

    // Credit check
    if (user && credits !== null && credits < 2) {
      setCreditAction("Quant Insights");
      setShowCreditModal(true);
      return;
    }

    setIsGeneratingQuant(true);
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
      setQuantInsights(""); // Initialize empty string to show UI immediately

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
      setIsGeneratingQuant(false);
      // Deduct credits
      if (user) {
        const newBal = await deductCredits(user.uid, 2);
        if (newBal >= 0) setCredits(newBal);
      }
    }
  };

  const handleSaveClick = (promptStr: string, currentBlocks: Block[]) => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }
    setSavePrompt(promptStr);
    setSaveBlocks(currentBlocks);
    setIsSaveModalOpen(true);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !saveName.trim()) return;
    
    setIsSaving(true);
    setSaveError(null);

    try {
      await addDoc(collection(db, "strategies"), {
        userId: user.uid,
        name: saveName.trim(),
        prompt: savePrompt,
        logic: saveBlocks,
        createdAt: Date.now()
      });
      setIsSaveModalOpen(false);
      setSaveName("");
    } catch (err: any) {
      console.error("Failed to save strategy:", err);
      setSaveError(err.message || "Failed to save strategy");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-transparent text-sandbox-text font-sans overflow-hidden">

      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Left Column: Data Source */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-[300px] glass-panel rounded-2xl flex flex-col shrink-0 z-10 relative"
        >
          <div className="p-4 border-b border-sandbox-border bg-white/5">
            <h3 className="text-xs font-bold text-sandbox-muted uppercase tracking-wider mb-3">Data Source</h3>
            <StockSearch onSelect={handleStockSelect} />
          </div>
          
          <div className="flex-1 p-4 relative overflow-y-auto">
            <h3 className="text-xs font-bold text-sandbox-muted uppercase tracking-wider mb-4">Instrument Info</h3>
            
            <div className="bg-white/5 border border-sandbox-border rounded-xl p-4 mb-4 relative z-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xl font-bold text-white">{currentSymbol}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded font-mono">ACTIVE</span>
              </div>
              <p className="text-xs text-sandbox-muted mb-4">{currentName}</p>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black rounded p-2">
                  <div className="text-[10px] text-sandbox-muted uppercase mb-1">Data Points</div>
                  <div className="text-sm font-mono text-white">{dataPoints.toLocaleString()}</div>
                </div>
                <div className="bg-black rounded p-2">
                  <div className="text-[10px] text-sandbox-muted uppercase mb-1">Exchange</div>
                  <div className="text-sm font-mono text-white">NSE / BSE</div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-sandbox-border rounded-xl p-4">
              <h4 className="text-[10px] font-bold text-sandbox-muted uppercase mb-3">Timeframe</h4>
              <div className="grid grid-cols-3 gap-2">
                {['1mo', '3mo', '6mo', '1y', '2y', '5y'].map(range => (
                  <button 
                    key={range}
                    onClick={() => handleRangeChange(range)}
                    className={`py-1.5 text-xs font-mono rounded border transition-colors ${currentRange === range ? 'bg-brand-purple/20 border-brand-purple/50 text-white' : 'bg-black border-sandbox-border text-sandbox-muted hover:border-sandbox-muted'}`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* Quant Edge — Link to Dedicated Page */}
            <Link
              href="/quant"
              className="mt-4 block bg-brand-purple/5 border border-brand-purple/20 rounded-lg p-4 relative overflow-hidden group hover:border-brand-purple/40 transition-colors"
            >
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <BrainCircuit className="w-12 h-12 text-brand-purple" />
              </div>
              <h4 className="text-[10px] font-bold text-brand-purple uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Quant Edge
              </h4>
              <p className="text-[11px] text-sandbox-muted mb-2">
                Get AI-powered alternative data theses — satellite, foot traffic, search trends.
              </p>
              <span className="text-[10px] font-bold text-brand-purple group-hover:text-white uppercase tracking-wider transition-colors">
                Open Quant Edge →
              </span>
            </Link>
          </div>
        </motion.div>

        {/* Center Column: Chart & Results */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 flex flex-col min-w-0 gap-4 relative z-0"
        >
          <div className="h-[55%] min-h-[300px] glass-panel rounded-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-sandbox-border bg-white/5 shrink-0">
              <div className="flex items-center gap-3">
                <h3 className="text-xs font-bold text-sandbox-muted uppercase tracking-wider">Historical Data</h3>
                <span className="text-xs font-mono text-white">{currentSymbol} • {currentRange}</span>
              </div>
            </div>
            <div className="flex-1 relative">
              <SandboxChart 
                symbol={currentSymbol} 
                stockName={currentName}
                onDataLoaded={handleDataLoaded} 
                onRangeChange={handleRangeChange}
              />
            </div>
          </div>
          
          <div className="flex-1 glass-panel rounded-2xl overflow-y-auto relative z-0">
            <BacktestResults 
              metrics={backtestMetrics}
              equityCurve={equityCurve}
              tradeLog={tradeLog}
              isLoading={isBacktesting}
              aiInsight={aiInsight}
              symbol={currentSymbol}
              blocks={strategyBlocks}
              walkForward={walkForwardResults}
            />
          </div>
        </motion.div>

        {/* Right Column: Logic Builder */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-[380px] glass-panel rounded-2xl flex flex-col shrink-0 z-0 overflow-hidden"
        >
          <div className="flex-1 p-4 overflow-y-auto">
            <StrategyBuilder 
              onBlocksGenerated={handleBlocksGenerated}
              onRunBacktest={handleRunBacktest}
              onSaveStrategy={handleSaveClick}
              isBacktesting={isBacktesting}
              currentSymbol={currentSymbol}
              initialPrompt={initialPrompt}
              initialBlocks={initialBlocks}
            />
          </div>
        </motion.div>
      </div>

      <StatusBar isConnected={isConnected} symbol={currentSymbol} dataPoints={dataPoints} />

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />

      {/* Save Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsSaveModalOpen(false)}></div>
          <div className="relative w-full max-w-sm bg-sandbox-panel border border-sandbox-border rounded-xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Save className="w-5 h-5 text-brand-purple" /> Save Strategy
              </h2>
            </div>
            
            {saveError && (
              <div className="mb-4 p-2 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded">
                {saveError}
              </div>
            )}

            <form onSubmit={handleSaveSubmit}>
              <div className="mb-4">
                <label className="block text-xs font-medium text-sandbox-muted mb-1 uppercase tracking-wider">Strategy Name</label>
                <input 
                  type="text" 
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="e.g. Moving Average Bounce"
                  required
                  className="w-full bg-black border border-sandbox-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-purple transition-colors"
                />
              </div>
              <button 
                type="submit"
                disabled={isSaving || !saveName.trim()}
                className="w-full py-2 bg-brand-purple hover:bg-brand-purple/90 text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save to Profile"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Out of Credits Modal */}
      {showCreditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCreditModal(false)}></div>
          <div className="relative w-full max-w-sm bg-sandbox-panel border border-sandbox-border rounded-xl shadow-2xl p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-candle-red/10 border border-candle-red/30 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-7 h-7 text-candle-red" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Out of Credits</h2>
            <p className="text-sm text-sandbox-muted mb-1">
              <strong className="text-white">{creditAction}</strong> costs <strong className="text-brand-purple">{
                creditAction === "Run Backtest" ? CREDIT_COSTS.RUN_BACKTEST :
                creditAction === "Generate Strategy" ? CREDIT_COSTS.GENERATE_STRATEGY :
                creditAction === "Explain Chart" ? CREDIT_COSTS.EXPLAIN_CHART :
                CREDIT_COSTS.ANALYZE_NEWS
              } credits</strong>.
            </p>
            <p className="text-sm text-sandbox-muted mb-6">
              You have <strong className="text-candle-red">{credits ?? 0}</strong> remaining. Credits refresh daily at midnight.
            </p>
            <button
              onClick={() => setShowCreditModal(false)}
              className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-lg font-bold text-sm transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <GuidedTour />
    </div>
  );
}

export default function SandboxPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
      </div>
    }>
      <SandboxContent />
    </Suspense>
  );
}
