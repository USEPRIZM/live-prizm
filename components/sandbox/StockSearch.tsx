"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, TrendingUp } from "lucide-react";

interface StockResult {
  symbol: string;
  name: string;
  exchange: string;
}

interface StockSearchProps {
  onSelect: (symbol: string, name: string) => void;
  currentSymbol?: string;
}

export default function StockSearch({ onSelect, currentSymbol }: StockSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StockResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (query.length < 1) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/stocks/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.status === "success") {
          setResults(data.results);
          setIsOpen(true);
          setSelectedIndex(-1);
        }
      } catch (err) {
        console.error("Stock search failed:", err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = useCallback((stock: StockResult) => {
    onSelect(stock.symbol, stock.name);
    setQuery("");
    setIsOpen(false);
    inputRef.current?.blur();
  }, [onSelect]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const exchangeColor = (exchange: string) => {
    switch (exchange) {
      case "NSE": return "bg-blue-500/20 text-blue-400";
      case "BSE": return "bg-amber-500/20 text-amber-400";
      case "INDEX": return "bg-white/10 text-white";
      default: return "bg-sandbox-border text-sandbox-muted";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sandbox-muted" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 0 && results.length > 0 && setIsOpen(true)}
          placeholder={currentSymbol ? `${currentSymbol} — Search stocks...` : "Search any NSE/BSE stock..."}
          className="w-full bg-sandbox-panel border border-sandbox-border rounded-md pl-9 pr-8 py-2.5 text-sm text-sandbox-text placeholder-sandbox-muted focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/30 transition-all font-mono"
          id="stock-search-input"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); setIsOpen(false); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-sandbox-border rounded transition-colors"
          >
            <X className="w-3 h-3 text-sandbox-muted" />
          </button>
        )}
        {isLoading && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-[#1a1625] border border-brand-purple/30 rounded-lg shadow-2xl shadow-black/60 max-h-72 overflow-y-auto sandbox-scroll">
          {results.map((stock, idx) => (
            <button
              key={stock.symbol}
              onClick={() => handleSelect(stock)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                idx === selectedIndex
                  ? "bg-white/10 text-white"
                  : "hover:bg-sandbox-border/50 text-sandbox-text"
              }`}
            >
              <TrendingUp className="w-4 h-4 text-sandbox-muted flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm">{stock.symbol.replace('.NS', '').replace('.BO', '')}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${exchangeColor(stock.exchange)}`}>
                    {stock.exchange}
                  </span>
                </div>
                <div className="text-xs text-sandbox-muted truncate">{stock.name}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && results.length === 0 && query.length > 0 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-[#1a1625] border border-brand-purple/30 rounded-lg shadow-2xl shadow-black/60 p-4 text-center text-sm text-sandbox-muted">
          No stocks found for &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}
