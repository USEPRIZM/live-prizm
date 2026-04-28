"use client";

import React, { useState } from 'react';
import { useAuth } from "@/components/AuthContext";
import LoginModal from "@/components/LoginModal";
import { LogOut, User as UserIcon } from "lucide-react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { refreshDailyCredits } from '@/lib/credits';
import { Zap } from 'lucide-react';

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    if (user) {
      refreshDailyCredits(user.uid).then(setCredits);
    }
  }, [user]);

  return (
    <>
      <nav className="w-full px-6 py-4 flex justify-between items-center relative z-50">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-2xl font-extrabold tracking-tight text-white drop-shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:text-brand-purple transition-colors">
            PRIZM
          </Link>
        </div>

        {/* Center Links */}
        <div className="hidden md:flex items-center space-x-8 bg-white/5 border border-white/10 rounded-full px-6 py-2 backdrop-blur-md">
          <Link href="/features" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">Features</Link>
          <Link href="/markets" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">Markets</Link>
          <Link href="/quant" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">Quant Edge</Link>
          <Link href="/sandbox" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">Sandbox</Link>
        </div>

        <div className="flex items-center gap-4">
          {loading ? (
            <div className="w-20 h-6 bg-white/10 animate-pulse rounded-full"></div>
          ) : user ? (
            <div className="flex items-center gap-4">
              {/* Credit Badge */}
              {credits !== null && (
                <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                  credits > 10 
                    ? 'bg-brand-purple/10 border-brand-purple/30 text-brand-purple' 
                    : credits > 0 
                      ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' 
                      : 'bg-candle-red/10 border-candle-red/30 text-candle-red'
                }`}>
                  <Zap className="w-3.5 h-3.5" />
                  {credits} credits
                </div>
              )}
              <Link href="/dashboard" className="flex items-center gap-2 hover:bg-white/10 px-2 py-1 rounded-md transition-colors group">
                <div className="w-8 h-8 rounded-full bg-brand-purple flex items-center justify-center text-sm font-bold text-white uppercase shadow-[0_0_15px_rgba(139,92,246,0.5)] group-hover:bg-brand-purple/90">
                  {user.displayName ? user.displayName.charAt(0) : user.email?.charAt(0) || "U"}
                </div>
                <span className="text-sm font-semibold text-slate-300 hidden sm:block group-hover:text-white transition-colors">
                  My Account
                </span>
              </Link>
              <button 
                onClick={logout}
                className="text-slate-400 hover:text-white transition-colors"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsLoginOpen(true)}
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-slate-400 hover:text-white transition-colors"
            >
              <UserIcon className="w-4 h-4" />
              Sign In
            </button>
          )}
        </div>
      </nav>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}
