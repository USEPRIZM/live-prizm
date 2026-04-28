"use client";

import React from "react";
import { Circle, Database, Clock } from "lucide-react";

interface StatusBarProps {
  symbol?: string;
  dataSource?: string;
  dataPoints?: number;
  lastUpdated?: string;
  isConnected?: boolean;
}

export default function StatusBar({
  symbol = "—",
  dataSource = "yfinance",
  dataPoints = 0,
  lastUpdated,
  isConnected = true,
}: StatusBarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-sandbox-bg border-t border-sandbox-border text-[11px] font-mono text-sandbox-muted">
      <div className="flex items-center gap-4">
        {/* Connection status */}
        <div className="flex items-center gap-1.5">
          <Circle
            className={`w-2 h-2 fill-current ${
              isConnected ? "text-candle-green" : "text-candle-red"
            }`}
          />
          <span>{isConnected ? "Connected" : "Disconnected"}</span>
        </div>

        {/* Current symbol */}
        <div className="flex items-center gap-1.5">
          <span className="text-sandbox-muted/50">│</span>
          <span className="text-sandbox-text font-bold">{symbol}</span>
        </div>

        {/* Data points */}
        {dataPoints > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-sandbox-muted/50">│</span>
            <Database className="w-3 h-3" />
            <span>{dataPoints.toLocaleString()} pts</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Last updated */}
        {lastUpdated && (
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            <span>Updated: {lastUpdated}</span>
          </div>
        )}

        {/* Data source */}
        <div className="flex items-center gap-1.5">
          <span className="text-sandbox-muted/50">│</span>
          <span>Source: {dataSource}</span>
        </div>

        {/* Brand */}
        <div className="flex items-center gap-1.5">
          <span className="text-sandbox-muted/50">│</span>
          <span className="text-prizm-deep font-bold">PRIZM</span>
        </div>
      </div>
    </div>
  );
}
