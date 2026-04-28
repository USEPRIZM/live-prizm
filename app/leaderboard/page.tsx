"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Home, LayoutDashboard, Trophy, TrendingUp, TrendingDown, Target, Copy, Check } from "lucide-react";

interface LeaderboardEntry {
  id: number;
  author: string;
  symbol: string;
  blocks: any[];
  win_rate: number;
  total_return: number;
  max_drawdown: number;
  total_trades: number;
  created_at: string;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api/leaderboard");
        const data = await res.json();
        if (data.status === "success") {
          setEntries(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const handleCopyStrategy = (entry: LeaderboardEntry) => {
    const strategyText = entry.blocks.map(b => `${b.type} ${b.label}`).join(" AND ");
    navigator.clipboard.writeText(`Run this on ${entry.symbol}: ${strategyText}`);
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans text-sandbox-text">

      {/* Main Content */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Top Strategies</h2>
          <p className="text-sandbox-muted text-sm max-w-2xl">
            Discover the best performing backtested strategies published by the Prizm community. Copy their logic, test it on your own assets, and climb the ranks.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-sandbox-border border-t-prizm-deep rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-xl">
            <Trophy className="w-12 h-12 text-sandbox-muted mx-auto mb-4 opacity-50" />
            <h3 className="text-white font-bold text-lg mb-1">No strategies published yet</h3>
            <p className="text-sandbox-muted text-sm">Be the first to publish a winning strategy from the Sandbox!</p>
            <Link href="/sandbox" className="inline-block mt-4 px-4 py-2 bg-brand-purple hover:bg-brand-purple/90 text-white text-sm font-bold rounded-md transition-colors">
              Go to Sandbox
            </Link>
          </div>
        ) : (
          <div className="glass-panel rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-sandbox-border bg-white/5">
                  <th className="py-4 px-6 text-xs font-bold text-sandbox-muted uppercase tracking-wider">Rank</th>
                  <th className="py-4 px-6 text-xs font-bold text-sandbox-muted uppercase tracking-wider">Trader</th>
                  <th className="py-4 px-6 text-xs font-bold text-sandbox-muted uppercase tracking-wider">Asset</th>
                  <th className="py-4 px-6 text-xs font-bold text-sandbox-muted uppercase tracking-wider">Total Return</th>
                  <th className="py-4 px-6 text-xs font-bold text-sandbox-muted uppercase tracking-wider">Win Rate</th>
                  <th className="py-4 px-6 text-xs font-bold text-sandbox-muted uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr key={entry.id} className="border-b border-sandbox-border/50 hover:bg-sandbox-border/20 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sandbox-bg border border-sandbox-border font-mono text-sm font-bold text-white">
                        #{index + 1}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-white">{entry.author}</td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-1 bg-sandbox-bg border border-sandbox-border rounded text-xs font-mono font-bold text-prizm-light">
                        {entry.symbol.replace(".NS", "").replace(".BO", "")}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className={`flex items-center gap-1.5 font-mono font-bold ${entry.total_return >= 0 ? "text-candle-green" : "text-candle-red"}`}>
                        {entry.total_return >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {entry.total_return >= 0 ? "+" : ""}{entry.total_return.toFixed(2)}%
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 font-mono">
                        <Target className="w-4 h-4 text-sandbox-muted" />
                        <span className={entry.win_rate >= 50 ? "text-white" : "text-sandbox-muted"}>
                          {entry.win_rate.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleCopyStrategy(entry)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-purple/20 text-brand-purple hover:bg-brand-purple/40 rounded-md text-xs font-bold transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      >
                        {copiedId === entry.id ? <Check className="w-3.5 h-3.5 text-candle-green" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedId === entry.id ? "Copied!" : "Copy Strategy"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
