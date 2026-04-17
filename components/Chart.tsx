"use client";

import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DataPoint {
  date: string;
  close: number;
}

export default function Chart() {
  const [data, setData] = useState<DataPoint[]>([]);

  useEffect(() => {
    fetch('/export.json')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Failed to load chart data:", err));
  }, []);

  if (data.length === 0) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center bg-slate-50 text-slate-400 rounded-2xl border border-slate-200">
        <div className="animate-pulse flex items-center gap-2">
          <div className="h-3 w-3 bg-prizm-light rounded-full"></div>
          <div className="h-3 w-3 bg-prizm-deep rounded-full"></div>
          <span className="ml-2 font-mono text-sm">Fetching Data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[450px] w-full p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
      <div className="mb-6 px-2">
         <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Nifty 50 Index</h3>
         <p className="text-sm text-slate-500 font-mono mt-1">5-Year Historical Performance</p>
      </div>
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 10,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'monospace' }} 
              axisLine={false} 
              tickLine={false} 
              minTickGap={40}
              tickMargin={12}
            />
            <YAxis 
              domain={['auto', 'auto']} 
              tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'monospace' }} 
              axisLine={false} 
              tickLine={false}
              tickFormatter={(value) => `${value.toLocaleString()}`}
              width={60}
              tickMargin={12}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', padding: '12px 16px' }}
              labelStyle={{ color: '#64748b', marginBottom: '6px', fontSize: '12px', fontWeight: 'bold' }}
              itemStyle={{ color: '#8B5CF6', fontSize: '14px', fontWeight: 'bold' }}
              formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Close']}
            />
            <Line
              type="monotone"
              dataKey="close"
              stroke="var(--color-prizm-deep)"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: "var(--color-prizm-deep)", stroke: "#fff", strokeWidth: 3 }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
