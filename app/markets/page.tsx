"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { Loader2, ArrowLeft, TrendingUp, TrendingDown, Minus, Newspaper, BrainCircuit, ExternalLink, RefreshCcw, ChevronRight, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import LoginModal from "@/components/LoginModal";
import { getCredits, deductCredits, refreshDailyCredits, CREDIT_COSTS } from "@/lib/credits";

interface NewsItem {
  title: string;
  summary: string;
  link: string;
  pubDate: string;
}

interface ImpactedEntity {
  entity: string;
  impact: "Bullish" | "Bearish" | "Neutral";
  reasoning: string;
}

interface AIAnalysis {
  keywords: string[];
  impacted_entities: ImpactedEntity[];
}

export default function MarketsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const [news, setNews] = useState<NewsItem[]>([]);
  const [isFetchingFeed, setIsFetchingFeed] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeItem, setActiveItem] = useState<NewsItem | null>(null);
  const [activeAnalysis, setActiveAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Credit system
  const [credits, setCredits] = useState<number | null>(null);
  const [showCreditModal, setShowCreditModal] = useState(false);

  useEffect(() => {
    if (user) {
      refreshDailyCredits(user.uid).then(setCredits);
    }
  }, [user]);

  const fetchMarketPulse = async () => {
    setIsFetchingFeed(true);
    setError(null);
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api/market-pulse");
      const data = await res.json();
      if (data.status === "success") {
        setNews(data.news);
        if (data.news.length > 0) {
          handleSelectNews(data.news[0]);
        }
      } else {
        setError(data.message || "Failed to load market data.");
      }
    } catch (err) {
      console.error("Error fetching market pulse:", err);
      setError("Network error. Make sure your Python backend is running.");
    } finally {
      setIsFetchingFeed(false);
    }
  };

  useEffect(() => {
    fetchMarketPulse();
  }, []);

  const handleSelectNews = async (item: NewsItem) => {
    setActiveItem(item);
    setActiveAnalysis(null);

    // Credit check for AI analysis
    if (user && credits !== null && credits < CREDIT_COSTS.ANALYZE_NEWS) {
      setShowCreditModal(true);
      return;
    }

    setIsAnalyzing(true);

    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api/analyze-news-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: item.title, summary: item.summary })
      });
      const data = await res.json();
      if (data.status === "success" && data.analysis) {
        setActiveAnalysis(data.analysis);
      }
    } catch (err) {
      console.error("Error analyzing news:", err);
    } finally {
      setIsAnalyzing(false);
      // Deduct credits
      if (user) {
        const newBal = await deductCredits(user.uid, CREDIT_COSTS.ANALYZE_NEWS);
        if (newBal >= 0) setCredits(newBal);
      }
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case "Bullish": return <TrendingUp className="w-4 h-4" />;
      case "Bearish": return <TrendingDown className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "Bullish": return "bg-candle-green/10 border-candle-green/30 text-candle-green";
      case "Bearish": return "bg-candle-red/10 border-candle-red/30 text-candle-red";
      default: return "bg-sandbox-border border-sandbox-muted/30 text-sandbox-muted";
    }
  };

  // Helper to highlight keywords in text
  const renderHighlightedText = (text: string, keywords: string[]) => {
    if (!keywords || keywords.length === 0) return <p className="text-sandbox-muted leading-relaxed text-sm">{text}</p>;

    const escapedKeywords = keywords.map(kw => kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${escapedKeywords.join('|')})`, 'gi');
    const parts = text.split(regex);

    return (
      <p className="text-sandbox-muted leading-relaxed text-sm">
        {parts.map((part, i) => {
          if (keywords.some(kw => kw.toLowerCase() === part.toLowerCase())) {
            return (
              <span key={i} className="bg-brand-purple/20 text-brand-purple px-1 rounded font-medium">
                {part}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </p>
    );
  };

  if (loading) {
    return (
      <div className="h-screen bg-sandbox-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
      </div>
    );
  }
  return (
    <div className="h-[calc(100vh-60px)] sm:h-[calc(100vh-80px)] flex flex-col bg-transparent text-white font-sans selection:bg-brand-purple/30 selection:text-white overflow-hidden">
      <div className="shrink-0 max-w-[1400px] mx-auto w-full px-4 pt-4 flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2 tracking-tight text-white">
          <Newspaper className="w-5 h-5 text-brand-purple" /> Market Pulse
        </h1>
        <button
          onClick={fetchMarketPulse}
          disabled={isFetchingFeed}
          className="px-3 py-1.5 text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCcw className={`w-3.5 h-3.5 ${isFetchingFeed ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="shrink-0 px-6 py-3 bg-candle-red/10 border-b border-candle-red/30 text-sm text-candle-red font-medium flex items-center gap-2">
          <TrendingDown className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Main Content - fills remaining viewport */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 max-w-[1400px] mx-auto w-full p-2 sm:p-4 gap-2 sm:gap-4">

        {/* Left Column: News Feed — independently scrollable */}
        <div className={`${activeItem ? 'hidden md:flex' : 'flex'} w-full md:w-[380px] md:shrink-0 glass-panel rounded-2xl flex-col overflow-hidden`}>
          <div className="shrink-0 px-5 py-4 flex items-center justify-between border-b border-sandbox-border/50">
            <h2 className="text-xs font-bold uppercase tracking-wider text-sandbox-muted flex items-center gap-2">
              <Newspaper className="w-3.5 h-3.5" /> Live Feed
            </h2>
            {isFetchingFeed && <Loader2 className="w-3.5 h-3.5 text-brand-purple animate-spin" />}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {isFetchingFeed && news.length === 0 ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-sandbox-panel border border-sandbox-border rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-sandbox-border rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-sandbox-border rounded w-full"></div>
                </div>
              ))
            ) : news.length === 0 ? (
              <div className="text-center p-8 text-sandbox-muted text-sm">
                No recent headlines found.
              </div>
            ) : (
              news.map((item, idx) => {
                const isActive = activeItem?.title === item.title;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectNews(item)}
                    className={`w-full text-left rounded-lg p-4 transition-all group ${
                      isActive
                        ? 'bg-brand-purple/10 border border-brand-purple/40'
                        : 'bg-transparent border border-transparent hover:bg-white/[0.03] hover:border-sandbox-border'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h3 className={`text-sm font-semibold leading-snug line-clamp-2 ${isActive ? 'text-white' : 'text-sandbox-muted group-hover:text-white'}`}>
                        {item.title}
                      </h3>
                      <ChevronRight className={`w-4 h-4 shrink-0 mt-0.5 transition-colors ${isActive ? 'text-brand-purple' : 'text-sandbox-border'}`} />
                    </div>
                    <div className="text-[10px] font-mono text-sandbox-muted/60 mt-2 flex justify-between items-center">
                      <span>{item.pubDate || "Just now"}</span>
                      {isActive && <span className="text-brand-purple font-bold text-[9px] tracking-wider">READING</span>}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detail View — independently scrollable */}
        <div className={`${!activeItem ? 'hidden md:flex' : 'flex'} flex-1 glass-panel rounded-2xl flex-col min-w-0 overflow-hidden relative z-0`}>
          {!activeItem ? (
            <div className="flex-1 flex flex-col items-center justify-center text-sandbox-muted gap-3">
              <Newspaper className="w-10 h-10 opacity-30" />
              <p className="text-sm">Select a headline to view details.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 sm:p-8 max-w-3xl">

                {/* Mobile Back Button */}
                <button 
                  onClick={() => setActiveItem(null)} 
                  className="md:hidden flex items-center gap-2 text-sm font-bold text-brand-purple mb-4 hover:text-white transition-colors"
                >
                  ← Back to Feed
                </button>

                {/* Headline */}
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mb-6 sm:mb-8 leading-tight">
                  {activeItem.title}
                </h1>

                {/* Article Content Card */}
                <div className="mb-8 bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Newspaper className="w-4 h-4 text-sandbox-muted" />
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-sandbox-muted">Article Summary</h3>
                  </div>

                  {activeAnalysis ? (
                    renderHighlightedText(activeItem.summary, activeAnalysis.keywords)
                  ) : (
                    <p className="text-sandbox-muted leading-relaxed text-sm">{activeItem.summary}</p>
                  )}

                  <a
                    href={activeItem.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-brand-purple text-white text-sm font-bold rounded-lg hover:bg-brand-purple/90 transition-all shadow-lg hover:shadow-brand-purple/20"
                  >
                    Read Full Article <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* AI Analysis Section */}
                <div className="mb-8">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-sandbox-muted flex items-center gap-2 mb-5">
                    <BrainCircuit className="w-4 h-4 text-brand-purple" /> PRIZM Impact Analysis
                  </h2>

                  {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center bg-white/5 border border-white/10 rounded-xl">
                      <Loader2 className="w-8 h-8 text-brand-purple animate-spin mb-4" />
                      <h3 className="text-white font-bold mb-1">PRIZM is analyzing this article...</h3>
                      <p className="text-xs text-sandbox-muted">Extracting keywords and predicting sector impacts.</p>
                    </div>
                  ) : !activeAnalysis ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-sandbox-muted bg-white/5 border border-white/10 rounded-xl">
                      <BrainCircuit className="w-8 h-8 mb-2 opacity-40" />
                      <p className="text-sm">Analysis unavailable. Try refreshing.</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {/* Keywords */}
                      {activeAnalysis.keywords && activeAnalysis.keywords.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-sandbox-muted mr-1">Key Drivers</span>
                          {activeAnalysis.keywords.map((kw, i) => (
                            <span key={i} className="px-2.5 py-1 bg-brand-purple/10 border border-brand-purple/20 text-brand-purple text-xs font-medium rounded-md">
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Impact Cards */}
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-sandbox-muted mt-4 mb-3">Stocks & Sectors Impacted</h3>
                      {activeAnalysis.impacted_entities?.map((item, idx) => (
                        <div key={idx} className="p-5 bg-white/5 border border-white/10 rounded-xl hover:border-brand-purple/30 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-base text-white">{item.entity}</h3>
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${getImpactColor(item.impact)}`}>
                              {getImpactIcon(item.impact)} {item.impact}
                            </span>
                          </div>
                          <p className="text-sm text-sandbox-muted leading-relaxed">
                            {item.reasoning}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Analyst Note */}
                <div className="mb-8 p-5 bg-brand-purple/5 border border-brand-purple/10 rounded-xl flex items-start gap-4">
                  <BrainCircuit className="w-5 h-5 text-brand-purple shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">AI Analyst Note</h4>
                    <p className="text-xs text-sandbox-muted leading-relaxed">
                      This analysis is generated in real-time by PRIZM AI. Use this sentiment data as a starting point to run backtests in the Sandbox.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}
