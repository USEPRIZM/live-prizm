"use client";

import React, { useEffect, useState, useMemo } from "react";
import { toPng } from "html-to-image";
import { Loader2, Wand2, X, Sparkles } from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line,
  Cell,
} from "recharts";

interface OHLCDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  google_trends?: number;
}

interface SandboxChartProps {
  symbol: string;
  stockName: string;
  onDataLoaded?: (count: number) => void;
  onRangeChange?: (range: string) => void;
}

const RANGES = ["1m", "3m", "6m", "1y", "5y"] as const;

export default function SandboxChart({ symbol, stockName, onDataLoaded, onRangeChange }: SandboxChartProps) {
  const [data, setData] = useState<OHLCDataPoint[]>([]);
  const [range, setRange] = useState<string>("1y");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [showAltData, setShowAltData] = useState(false);

  const handleExplainChart = async () => {
    const chartEl = document.getElementById("prizm-chart-canvas");
    if (!chartEl) return;

    setIsAnalyzing(true);
    setAiAnalysis(null);

    try {
      const base64Image = await toPng(chartEl, {
        backgroundColor: "#0d0f14",
        pixelRatio: 1, // keep it small for faster transmission
      });

      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api/analyze-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: symbol,
          image: base64Image,
        }),
      });

      const data = await res.json();
      if (data.status === "success" && data.analysis) {
        setAiAnalysis(data.analysis);
      } else {
        console.error("AI Analysis failed:", data.message);
        setAiAnalysis(`⚠️ ${data.message || "Failed to analyze chart."}`);
      }
    } catch (err) {
      console.error("Failed to capture or analyze chart:", err);
      setAiAnalysis("⚠️ Failed to capture or analyze chart. Check console for details.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (!symbol) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/stocks/${encodeURIComponent(symbol)}/history?range=${range}`
        );
        const json = await res.json();
        if (json.status === "success" && json.data) {
          setData(json.data);
          setSource(json.source || "");
          onDataLoaded?.(json.count || json.data.length);
        } else {
          setError(json.message || "Failed to load data");
          setData([]);
        }
      } catch (err) {
        console.error("Chart data fetch failed:", err);
        setError("Could not connect to data server. Is the backend running?");
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [symbol, range, onDataLoaded]);

  const handleRangeChange = (r: string) => {
    setRange(r);
    setAiAnalysis(null); // Reset analysis on range change
    onRangeChange?.(r);
  };

  // Compute price change
  const priceChange = useMemo(() => {
    if (data.length < 2) return { value: 0, percent: 0, isPositive: true };
    const first = data[0].close;
    const last = data[data.length - 1].close;
    const change = last - first;
    const pct = (change / first) * 100;
    return { value: change, percent: pct, isPositive: change >= 0 };
  }, [data]);

  const latestPrice = data.length > 0 ? data[data.length - 1].close : 0;

  // Custom candlestick-like rendering: use close line + colored volume bars
  const chartData = useMemo(() => {
    return data.map((d) => ({
      ...d,
      // For bar coloring
      isGreen: d.close >= d.open,
    }));
  }, [data]);

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 bg-prizm-light rounded-full animate-pulse" />
            <div className="h-2.5 w-2.5 bg-prizm-deep rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
            <div className="h-2.5 w-2.5 bg-prizm-light rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
          </div>
          <span className="font-mono text-xs text-sandbox-muted">
            Fetching {symbol}...
          </span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-candle-red font-mono text-sm mb-2">⚠ Error</div>
          <div className="text-sandbox-muted text-xs max-w-xs">{error}</div>
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0 && !isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-sandbox-muted font-mono text-sm">Select a stock to begin</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between px-1 mb-4">
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-xl font-bold text-white tracking-tight">
              {symbol.replace(".NS", "").replace(".BO", "")}
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-sandbox-border text-sandbox-muted">
              {symbol.includes(".BO") ? "BSE" : symbol.startsWith("^") ? "INDEX" : "NSE"}
            </span>
            {source === "cache" && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-candle-green/10 text-candle-green">
                CACHED
              </span>
            )}
          </div>
          <div className="text-xs text-sandbox-muted truncate max-w-[250px]">{stockName}</div>
          <div className="flex items-baseline gap-3 mt-2">
            <span className="text-2xl font-bold text-white font-mono">
              ₹{latestPrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </span>
            <span className={`text-sm font-mono font-semibold ${priceChange.isPositive ? "text-candle-green" : "text-candle-red"}`}>
              {priceChange.isPositive ? "+" : ""}
              {priceChange.percent.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Range selector and AI Button */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1 bg-sandbox-bg rounded-lg p-1 border border-sandbox-border">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => handleRangeChange(r)}
                className={`px-3 py-1.5 text-xs font-mono font-bold rounded-md transition-all ${
                  range === r
                    ? "bg-white text-black"
                    : "text-sandbox-muted hover:text-sandbox-text hover:bg-sandbox-border/50"
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
          
            <button
              onClick={handleExplainChart}
              disabled={isAnalyzing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-zinc-200 text-black rounded-md text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-50"
              title="Ask AI to analyze this chart"
            >
              {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
              {isAnalyzing ? "Analyzing..." : "Explain Chart"}
            </button>
            <button
              onClick={() => setShowAltData(!showAltData)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all border ${showAltData ? 'bg-brand-purple/20 border-brand-purple/50 text-brand-purple' : 'bg-transparent border-sandbox-border text-sandbox-muted hover:text-white'}`}
              title="Toggle Alternative Data (Google Trends)"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Alt Data
            </button>
          </div>
        </div>

      {/* Chart */}
      <div id="prizm-chart-canvas" className="flex-1 min-h-0 relative">
        {/* AI Analysis Overlay */}
        {aiAnalysis && (
          <div className="absolute top-4 right-4 z-10 w-80 bg-sandbox-panel/95 backdrop-blur-md border border-sandbox-border rounded-md p-4 shadow-xl animate-fade-in-up">
            <button 
              onClick={() => setAiAnalysis(null)}
              className="absolute top-2 right-2 text-sandbox-muted hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">AI Chart Analysis</span>
            </div>
            <p className="text-sm text-sandbox-text leading-relaxed">
              {aiAnalysis}
            </p>
          </div>
        )}
        <ResponsiveContainer width="100%" height="75%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e2130" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#4a5568", fontFamily: "monospace" }}
              axisLine={false}
              tickLine={false}
              minTickGap={50}
              tickMargin={8}
            />
            <YAxis
              yAxisId="price"
              domain={["auto", "auto"]}
              tick={{ fontSize: 10, fill: "#4a5568", fontFamily: "monospace" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${v.toLocaleString("en-IN")}`}
              width={70}
              tickMargin={8}
            />
            {showAltData && (
              <YAxis
                yAxisId="alt"
                orientation="right"
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: "#8B5CF6", fontFamily: "monospace" }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
            )}
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1d27",
                border: "1px solid #2a2d3a",
                borderRadius: "6px",
                padding: "12px 16px",
                boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)",
              }}
              labelStyle={{ color: "#64748b", fontSize: "11px", fontFamily: "monospace", marginBottom: "8px" }}
              formatter={(value: any, name: any) => {
                const label = String(name).charAt(0).toUpperCase() + String(name).slice(1);
                const formatted = String(name) === "volume"
                  ? Number(value).toLocaleString("en-IN")
                  : `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
                return [formatted, label];
              }}
              itemStyle={{ fontSize: "12px", fontFamily: "monospace" }}
            />
            {/* Close price line */}
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="close"
              stroke="#ffffff"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: "#ffffff", stroke: "#1a1d27", strokeWidth: 3 }}
              animationDuration={1200}
            />
            {/* Alt Data Line */}
            {showAltData && (
              <Line
                yAxisId="alt"
                type="monotone"
                dataKey="google_trends"
                stroke="#8B5CF6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                animationDuration={1200}
                opacity={0.6}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>

        {/* Volume bars */}
        <ResponsiveContainer width="100%" height="22%">
          <ComposedChart data={chartData} margin={{ top: 0, right: 5, left: 0, bottom: 0 }}>
            <XAxis dataKey="date" hide />
            <YAxis hide />
            <Bar dataKey="volume" animationDuration={800}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`vol-${index}`}
                  fill={entry.isGreen ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}
                />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
