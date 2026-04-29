"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from "@/components/AuthContext";
import LoginModal from "@/components/LoginModal";
import { LogOut, User as UserIcon, Menu, X } from "lucide-react";
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { refreshDailyCredits } from '@/lib/credits';
import { Zap } from 'lucide-react';

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (user) {
      refreshDailyCredits(user.uid).then(setCredits);
    }
  }, [user]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleProtectedLink = (e: React.MouseEvent, path: string) => {
    if (!user) {
      e.preventDefault();
      setIsMobileMenuOpen(false);
      setIsLoginOpen(true);
    } else {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      <nav className="w-full px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center relative z-50">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl sm:text-2xl font-extrabold tracking-tight text-white drop-shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:text-brand-purple transition-colors">
            PRIZM
          </Link>
        </div>

        {/* Center Links — Desktop */}
        <div className="hidden md:flex items-center space-x-8 bg-white/5 border border-white/10 rounded-full px-6 py-2 backdrop-blur-md">
          <Link href="/features" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">What We Do</Link>
          <Link href="/markets" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">Markets</Link>
          <Link 
            href={user ? "/quant" : "#"} 
            onClick={(e) => handleProtectedLink(e, "/quant")}
            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Quant Edge
          </Link>
          <Link 
            href={user ? "/sandbox" : "#"} 
            onClick={(e) => handleProtectedLink(e, "/sandbox")}
            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Sandbox
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="w-16 h-6 bg-white/10 animate-pulse rounded-full"></div>
          ) : user ? (
            <div className="flex items-center gap-2 sm:gap-4">
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
                className="hidden sm:block text-slate-400 hover:text-white transition-colors"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsLoginOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-400 hover:text-white transition-colors"
            >
              <UserIcon className="w-4 h-4" />
              Sign In
            </button>
          )}

          {/* Hamburger — Mobile only */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-slate-300 hover:text-white transition-colors p-1"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          
          {/* Drawer */}
          <div className="absolute top-0 right-0 w-72 h-full bg-[#0a0a12] border-l border-white/10 flex flex-col animate-fade-in-up">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <span className="text-lg font-bold text-white">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav Links */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
              <Link 
                href="/features" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                What We Do
              </Link>
              <Link 
                href="/markets" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Markets
              </Link>
              <Link 
                href={user ? "/quant" : "#"} 
                onClick={(e) => handleProtectedLink(e, "/quant")}
                className="block px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Quant Edge
                {!user && <span className="ml-2 text-[10px] text-brand-purple font-bold uppercase">Login Required</span>}
              </Link>
              <Link 
                href={user ? "/sandbox" : "#"} 
                onClick={(e) => handleProtectedLink(e, "/sandbox")}
                className="block px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Sandbox
                {!user && <span className="ml-2 text-[10px] text-brand-purple font-bold uppercase">Login Required</span>}
              </Link>
              <Link 
                href={user ? "/leaderboard" : "#"} 
                onClick={(e) => handleProtectedLink(e, "/leaderboard")}
                className="block px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Leaderboard
              </Link>

              {/* Divider */}
              <div className="my-4 h-px bg-white/10" />

              {/* Credits on mobile */}
              {user && credits !== null && (
                <div className="px-4 py-3 rounded-xl bg-brand-purple/10 border border-brand-purple/20">
                  <div className="flex items-center gap-2 text-brand-purple text-sm font-bold">
                    <Zap className="w-4 h-4" />
                    {credits} Credits Remaining
                  </div>
                </div>
              )}

              {/* Logout on mobile */}
              {user && (
                <button
                  onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-candle-red hover:bg-candle-red/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}
