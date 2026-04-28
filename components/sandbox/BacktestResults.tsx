"use client";

import React, { useMemo, useState } from "react";
import { toPng } from "html-to-image";
import { useAuth } from "@/components/AuthContext";
import LoginModal from "@/components/LoginModal";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { TrendingUp, TrendingDown, Activity, BarChart3, Target, Wallet, Info, Share2, Loader2, Sparkles, Trophy, Clock, Receipt, Scale, ShieldCheck, AlertTriangle } from "lucide-react";

interface BacktestMetrics {
  totalReturn: number;
  winRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
  totalTrades: number;
  startingCapital: number;
  endingCapital: number;
  totalCosts?: number;
  costImpact?: number;
  profitFactor?: number;
  avgHoldDays?: number;
}

interface WalkForwardTest {
  consistency: number;
  grade: string;
  gradeColor: "green" | "amber" | "red";
  trainPeriod: { start: string; end: string; dataPoints: number };
  testPeriod: { start: string; end: string; dataPoints: number };
  trainMetrics: BacktestMetrics;
  testMetrics: BacktestMetrics;
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

interface BacktestResultsProps {
  metrics: BacktestMetrics | null;
  equityCurve: EquityCurvePoint[];
  tradeLog: TradeLogEntry[];
  symbol: string;
  isLoading?: boolean;
  aiInsight?: string | null;
  blocks?: any[];
  walkForward?: WalkForwardTest | null;
}

function MetricCard({
  label,
  value,
  suffix = "",
  prefix = "",
  icon: Icon,
  isPositive,
  delay = 0,
  tooltip,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  prefix?: string;
  icon: React.ElementType;
  isPositive?: boolean;
  delay?: number;
  tooltip?: string;
}) {
  const colorClass =
    isPositive === undefined
      ? "text-white"
      : isPositive
      ? "text-candle-green"
      : "text-candle-red";

  return (
    <div
      className="glass-panel border-white/10 rounded-xl p-3 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-1.5 mb-2 relative group">
        <Icon className="w-3.5 h-3.5 text-sandbox-muted" />
        <span className="text-[10px] uppercase tracking-wider text-sandbox-muted font-bold">
          {label}
        </span>
        {tooltip && (
          <div className="cursor-help">
            <Info className="w-3 h-3 text-sandbox-muted/70 hover:text-prizm-light transition-colors" />
            <div className="absolute bottom-full left-0 mb-2 w-48 bg-black/80 backdrop-blur-md border border-brand-purple/30 text-white text-[10px] p-2 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-xl normal-case tracking-normal">
              {tooltip}
              <div className="absolute -bottom-1 left-4 w-2 h-2 bg-black/80 border-b border-r border-brand-purple/30 transform rotate-45" />
            </div>
          </div>
        )}
      </div>
      <div className={`text-lg font-bold font-mono ${colorClass}`}>
        {prefix}
        {value}
        {suffix}
      </div>
    </div>
  );
}

export default function BacktestResults({
  metrics,
  equityCurve,
  tradeLog,
  symbol,
  isLoading = false,
  aiInsight = null,
  blocks = [],
  walkForward = null,
}: BacktestResultsProps) {
  const displaySymbol = symbol.replace(".NS", "").replace(".BO", "");
  const [isExporting, setIsExporting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<"idle" | "success" | "error">("idle");
  const { user } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const handlePublish = async () => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }

    const author = user.displayName || user.email?.split('@')[0] || "Anonymous Trader";

    setIsPublishing(true);
    setPublishStatus("idle");

    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api/leaderboard/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author,
          symbol,
          blocks,
          metrics,
          totalTrades: tradeLog.length,
        }),
      });

      const data = await res.json();
      if (data.status === "success") {
        setPublishStatus("success");
        setTimeout(() => setPublishStatus("idle"), 3000);
      } else {
        setPublishStatus("error");
        alert(data.message || "Failed to publish strategy.");
      }
    } catch (err) {
      console.error("Publish error:", err);
      setPublishStatus("error");
      alert("Failed to connect to the server.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleShare = async () => {
    const cardElement = document.getElementById("prizm-flex-card");
    if (!cardElement) return;

    setIsExporting(true);
    try {
      const dataUrl = await toPng(cardElement, {
        backgroundColor: "#0d0f14", // Match sandbox-bg
        pixelRatio: 2, // High resolution
      });

      const link = document.createElement("a");
      link.download = `prizm_strategy_${displaySymbol}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export image:", err);
      alert("Failed to export image due to a styling conflict. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-8">
        <div className="relative w-12 h-12 mb-4">
          <div className="absolute inset-0 border-2 border-sandbox-border rounded-full" />
          <div className="absolute inset-0 border-2 border-prizm-deep border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="font-mono text-xs text-sandbox-muted animate-pulse">
          Simulating trades on {displaySymbol}...
        </div>
      </div>
    );
  }

  // Empty state
  if (!metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-8 text-center">
        <BarChart3 className="w-8 h-8 text-sandbox-border mb-3" />
        <div className="text-sm text-sandbox-muted">No backtest results yet</div>
        <div className="text-xs text-sandbox-muted/60 mt-1">
          Generate a strategy and run a backtest to see results
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto sandbox-scroll relative">
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <div id="prizm-flex-card" className="bg-sandbox-bg p-2 -m-2 rounded-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 px-2 pt-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-prizm-deep" />
            <h4 className="text-sm font-bold text-white tracking-wide uppercase">
              Backtest Results
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-sandbox-muted">{displaySymbol}</span>
            <button
              onClick={handlePublish}
              disabled={isPublishing || publishStatus === "success"}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#eab308]/20 hover:bg-[#eab308]/40 text-[#fde047] rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
              title="Publish to Community Leaderboard"
            >
              {isPublishing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trophy className="w-3 h-3" />}
              {publishStatus === "success" ? "Published!" : isPublishing ? "Publishing..." : "Publish"}
            </button>
            <button
              onClick={handleShare}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-2.5 py-1 border border-sandbox-border hover:bg-white text-sandbox-text hover:text-black rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
              title="Export Strategy Card as Image"
            >
              {isExporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Share2 className="w-3 h-3" />}
              {isExporting ? "Exporting..." : "Share"}
            </button>
          </div>
        </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <MetricCard
          label="Total Return"
          value={metrics.totalReturn.toFixed(2)}
          suffix="%"
          prefix={metrics.totalReturn >= 0 ? "+" : ""}
          icon={metrics.totalReturn >= 0 ? TrendingUp : TrendingDown}
          isPositive={metrics.totalReturn >= 0}
          delay={0}
          tooltip="The total percentage of profit or loss over the simulated period."
        />
        <MetricCard
          label="Win Rate"
          value={metrics.winRate.toFixed(1)}
          suffix="%"
          icon={Target}
          isPositive={metrics.winRate >= 50}
          delay={50}
          tooltip="The percentage of your trades that actually made a profit. Above 50% is generally good."
        />
        <MetricCard
          label="Profit Factor"
          value={metrics.profitFactor !== undefined ? (metrics.profitFactor === Infinity ? "∞" : metrics.profitFactor.toFixed(2)) : "—"}
          icon={Scale}
          isPositive={metrics.profitFactor !== undefined && metrics.profitFactor > 1.5}
          delay={100}
          tooltip="Gross Profit divided by Gross Loss. > 1 is profitable, > 2 is excellent."
        />
        <MetricCard
          label="Max Drawdown"
          value={metrics.maxDrawdown.toFixed(2)}
          suffix="%"
          icon={TrendingDown}
          isPositive={false}
          delay={150}
          tooltip="The biggest single drop your portfolio experienced from its highest peak. Lower is better."
        />
        <MetricCard
          label="Sharpe Ratio"
          value={metrics.sharpeRatio.toFixed(2)}
          icon={Activity}
          isPositive={metrics.sharpeRatio >= 1}
          delay={200}
          tooltip="A measure of risk vs. reward. A ratio above 1.0 means you are taking smart risks."
        />
        <MetricCard
          label="Avg Hold Time"
          value={metrics.avgHoldDays !== undefined ? metrics.avgHoldDays : "—"}
          suffix=" days"
          icon={Clock}
          delay={250}
          tooltip="Average number of days a position is held before being closed."
        />
        <MetricCard
          label="Total Trades"
          value={metrics.totalTrades}
          icon={BarChart3}
          delay={300}
          tooltip="Total number of buy and sell actions executed during the backtest."
        />
        <MetricCard
          label="Total Costs"
          value={metrics.totalCosts !== undefined ? `₹${metrics.totalCosts.toLocaleString("en-IN")}` : "—"}
          icon={Receipt}
          delay={350}
          tooltip="Estimated slippage + brokerage + STT + GST + exchange fees."
        />
        <MetricCard
          label="Final Capital"
          value={`₹${metrics.endingCapital.toLocaleString("en-IN")}`}
          icon={Wallet}
          isPositive={metrics.endingCapital >= metrics.startingCapital}
          delay={400}
          tooltip="The net cash you would have today (after costs) if you started with ₹1,00,000."
        />
      </div>

      {/* Walk-Forward Validation */}
      {walkForward && (
        <div className="mb-4 glass-panel rounded-xl p-4 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '450ms', animationFillMode: 'both' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-purple" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Robustness Check</h4>
            </div>
            <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
              walkForward.gradeColor === "green" ? "bg-candle-green/10 text-candle-green border-candle-green/30" :
              walkForward.gradeColor === "amber" ? "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/30" :
              "bg-candle-red/10 text-candle-red border-candle-red/30"
            }`}>
              {walkForward.grade} ({walkForward.consistency}%)
            </div>
          </div>
          <p className="text-[11px] text-sandbox-muted mb-3">
            Strategy was trained on {walkForward.trainPeriod.dataPoints} days and blindly tested on the remaining {walkForward.testPeriod.dataPoints} days to check for overfitting.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-black/30 rounded p-2">
              <div className="text-[10px] text-sandbox-muted uppercase mb-1">Training Period</div>
              <div className={`text-sm font-bold font-mono ${walkForward.trainMetrics.totalReturn >= 0 ? "text-candle-green" : "text-candle-red"}`}>
                {walkForward.trainMetrics.totalReturn >= 0 ? "+" : ""}{walkForward.trainMetrics.totalReturn.toFixed(2)}%
              </div>
            </div>
            <div className="bg-black/30 rounded p-2">
              <div className="text-[10px] text-sandbox-muted uppercase mb-1">Blind Test Period</div>
              <div className={`text-sm font-bold font-mono ${walkForward.testMetrics.totalReturn >= 0 ? "text-candle-green" : "text-candle-red"}`}>
                {walkForward.testMetrics.totalReturn >= 0 ? "+" : ""}{walkForward.testMetrics.totalReturn.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plain English Translation Block */}
      <div className="mb-4 bg-prizm-deep/5 border border-prizm-deep/20 rounded-xl p-4 animate-fade-in-up" style={{ animationDelay: "450ms" }}>
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-prizm-light" />
          <span className="text-xs font-bold text-prizm-light uppercase tracking-wider">In Plain English</span>
        </div>
        <p className="text-sm text-sandbox-text leading-relaxed">
          If you had started with <strong className="text-white">₹1,00,000</strong> and followed this strategy over the selected period, you would have made <strong className="text-white">{metrics.totalTrades} trades</strong>, winning <strong className={metrics.winRate >= 50 ? "text-candle-green" : "text-candle-red"}>{metrics.winRate.toFixed(1)}%</strong> of them. Today, you would have <strong className={metrics.totalReturn >= 0 ? "text-candle-green" : "text-candle-red"}>₹{metrics.endingCapital.toLocaleString("en-IN")}</strong>. The worst drop you had to endure along the way was <strong className="text-candle-red">{metrics.maxDrawdown.toFixed(1)}%</strong>.
        </p>
      </div>

      {/* AI Insight Block */}
      {aiInsight && (
        <div className="mb-4 bg-sandbox-panel border border-sandbox-border rounded-md p-4 animate-fade-in-up" style={{ animationDelay: "480ms" }}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">AI Strategy Critic</span>
          </div>
          <p className="text-sm text-sandbox-text leading-relaxed italic">
            "{aiInsight}"
          </p>
        </div>
      )}

      {/* Mini equity curve */}
      {equityCurve.length > 0 && (
        <div className="mb-4 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
          <div className="text-[10px] uppercase tracking-wider text-sandbox-muted font-bold mb-2">
            Equity Curve
          </div>
          <div className="bg-sandbox-bg border border-sandbox-border rounded-xl p-3 h-28">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={equityCurve}>
                <XAxis dataKey="date" hide />
                <YAxis hide domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1d27",
                    border: "1px solid #2a2d3a",
                    borderRadius: "8px",
                    padding: "8px",
                    fontSize: "11px",
                    fontFamily: "monospace",
                  }}
                  formatter={(v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, "Equity"]}
                  labelStyle={{ color: "#64748b", fontSize: "10px" }}
                />
                <Line
                  type="monotone"
                  dataKey="equity"
                  stroke={metrics.totalReturn >= 0 ? "#22c55e" : "#ef4444"}
                  strokeWidth={2}
                  dot={false}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      
      {/* Watermark visible at the bottom of the card */}
      <div className="flex prizm-watermark items-center gap-1.5 justify-center pt-2 pb-2 opacity-30 mt-2 border-t border-sandbox-border/30">
         <Activity className="w-3 h-3 text-prizm-deep" />
         <span className="text-[9px] font-bold tracking-widest text-sandbox-muted uppercase">Built on Prizm Sandbox</span>
      </div>

      </div> {/* End of prizm-flex-card wrapper */}

      {/* Trade log */}
      {tradeLog.length > 0 && (
        <div className="animate-fade-in-up" style={{ animationDelay: "600ms" }}>
          <div className="text-[10px] uppercase tracking-wider text-sandbox-muted font-bold mb-2">
            Recent Trades
          </div>
          <div className="bg-sandbox-bg border border-sandbox-border rounded-xl overflow-hidden">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-sandbox-border">
                  <th className="text-left px-3 py-2 text-sandbox-muted font-bold">Date</th>
                  <th className="text-left px-3 py-2 text-sandbox-muted font-bold">Action</th>
                  <th className="text-right px-3 py-2 text-sandbox-muted font-bold">Price</th>
                  <th className="text-right px-3 py-2 text-sandbox-muted font-bold">P&L</th>
                </tr>
              </thead>
              <tbody>
                {tradeLog.map((trade, idx) => (
                  <tr key={idx} className="border-b border-sandbox-border/50 last:border-0">
                    <td className="px-3 py-1.5 text-sandbox-text">{trade.date}</td>
                    <td className="px-3 py-1.5">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          trade.action === "BUY"
                            ? "bg-candle-green/15 text-candle-green"
                            : "bg-candle-red/15 text-candle-red"
                        }`}
                      >
                        {trade.action}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-right text-sandbox-text">
                      ₹{trade.price.toLocaleString("en-IN")}
                    </td>
                    <td
                      className={`px-3 py-1.5 text-right font-semibold ${
                        trade.pnl > 0
                          ? "text-candle-green"
                          : trade.pnl < 0
                          ? "text-candle-red"
                          : "text-sandbox-muted"
                      }`}
                    >
                      {trade.pnl !== 0
                        ? `${trade.pnl > 0 ? "+" : ""}₹${trade.pnl.toLocaleString("en-IN")}`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
