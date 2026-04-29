"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { Loader2, User, Mail, Phone, Calendar, Target, Activity, Shield, Key, ArrowRight, Clock, Zap, RefreshCw, BrainCircuit, Pencil, Check, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { getCreditData, getNextRefreshTime, refreshDailyCredits, MAX_CREDITS, DAILY_REFRESH, CreditData } from "@/lib/credits";

interface SavedStrategy {
  id: string;
  name: string;
  prompt: string;
  createdAt: number;
}

export default function DashboardPage() {
  const { user, profile, loading, logout, refreshProfile } = useAuth();
  const router = useRouter();

  // Password Change State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Strategies State
  const [strategies, setStrategies] = useState<SavedStrategy[]>([]);
  const [loadingStrategies, setLoadingStrategies] = useState(true);

  // Credits State
  const [creditData, setCreditData] = useState<CreditData | null>(null);
  const [timeUntilRefresh, setTimeUntilRefresh] = useState("");

  // Phone Edit State
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneValue, setPhoneValue] = useState("");
  const [isSavingPhone, setIsSavingPhone] = useState(false);

  // Reset via Email State
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
    if (!loading && user && !profile) {
      router.push("/onboarding");
    }
  }, [user, profile, loading, router]);

  // Load strategies
  useEffect(() => {
    const fetchStrategies = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, "strategies"), 
          where("userId", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        const fetched: SavedStrategy[] = [];
        snapshot.forEach((doc) => {
          fetched.push({ id: doc.id, ...doc.data() } as SavedStrategy);
        });
        fetched.sort((a, b) => b.createdAt - a.createdAt);
        setStrategies(fetched);
      } catch (err) {
        console.error("Error fetching strategies:", err);
      } finally {
        setLoadingStrategies(false);
      }
    };
    
    if (user && !loading) {
      fetchStrategies();
    }
  }, [user, loading]);

  // Load credits & refresh
  useEffect(() => {
    const loadCredits = async () => {
      if (!user) return;
      await refreshDailyCredits(user.uid);
      const data = await getCreditData(user.uid);
      setCreditData(data);
    };
    if (user && !loading) {
      loadCredits();
    }
  }, [user, loading]);

  // Countdown timer for credit refresh
  useEffect(() => {
    if (!creditData) return;

    const updateCountdown = () => {
      const nextRefresh = getNextRefreshTime(creditData.lastCreditRefresh);
      const now = new Date();
      const diff = nextRefresh.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeUntilRefresh("Refreshing...");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeUntilRefresh(`${hours}h ${minutes}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // update every minute
    return () => clearInterval(interval);
  }, [creditData]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
    if (!oldPassword || !newPassword) {
      setPasswordError("Please fill out both password fields.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setPasswordError("New password must contain at least one number.");
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      setPasswordError("New password must contain at least one special character.");
      return;
    }

    setIsChangingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    try {
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      
      setPasswordSuccess("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
    } catch (err: any) {
      console.error("Change password error:", err);
      if (err.code === 'auth/invalid-credential') {
        setPasswordError("Incorrect old password.");
      } else {
        setPasswordError(err.message || "An error occurred while changing your password.");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
      </div>
    );
  }

  const isPasswordUser = user.providerData.some((p) => p.providerId === 'password');
  const creditPercentage = creditData ? Math.round((creditData.credits / MAX_CREDITS) * 100) : 0;

  return (
    <div className="min-h-screen bg-transparent text-white font-sans selection:bg-brand-purple/30 selection:text-white pb-20">
      
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        <div className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">My Account</h1>
          <p className="text-sandbox-muted">Your profile, credits, and strategy history.</p>
        </div>

        {/* Credits Banner */}
        <div className="glass-panel rounded-xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-5">
            <Zap className="w-24 h-24 text-brand-purple" />
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-brand-purple" />
                <h2 className="text-sm font-bold text-brand-purple uppercase tracking-wider">Credit Balance</h2>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-5xl font-mono font-bold text-white">
                  {creditData?.credits ?? "—"}
                </span>
                <span className="text-sm text-sandbox-muted font-mono">/ {MAX_CREDITS}</span>
              </div>
              {/* Progress bar */}
              <div className="w-full sm:w-64 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-brand-purple to-[#d8b4fe]"
                  style={{ width: `${creditPercentage}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="glass-panel rounded-lg p-4 min-w-[140px]">
                <div className="flex items-center gap-1.5 mb-1 text-sandbox-muted">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Next Refresh</span>
                </div>
                <div className="text-lg font-mono font-bold text-white">{timeUntilRefresh || "—"}</div>
                <div className="text-[10px] text-sandbox-muted mt-0.5">+{DAILY_REFRESH} credits</div>
              </div>
              <div className="glass-panel rounded-lg p-4 min-w-[140px]">
                <div className="flex items-center gap-1.5 mb-1 text-sandbox-muted">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Last Refresh</span>
                </div>
                <div className="text-sm font-mono font-bold text-white">
                  {creditData ? new Date(creditData.lastCreditRefresh).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" }) : "—"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column: Profile Card */}
          <div className="md:col-span-1 space-y-6">
            <div className="glass-panel rounded-xl overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-brand-purple/20 to-brand-purple/5 relative">
                <div className="absolute -bottom-10 left-6">
                  <div className="w-20 h-20 rounded-xl bg-sandbox-bg border-4 border-sandbox-panel flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                    {profile.name?.charAt(0) || "U"}
                  </div>
                </div>
              </div>
              
              <div className="pt-14 px-6 pb-6">
                <h2 className="text-xl font-bold mb-1">{profile.name}</h2>
                <div className="text-sm text-brand-purple font-medium mb-6">{profile.experience}</div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-sandbox-muted" />
                    <span className="text-sandbox-text">{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm group/phone">
                    <Phone className="w-4 h-4 text-sandbox-muted" />
                    {isEditingPhone ? (
                      <div className="flex items-center gap-1.5 flex-1">
                        <input
                          type="tel"
                          value={phoneValue}
                          onChange={(e) => setPhoneValue(e.target.value)}
                          className="flex-1 bg-black border border-brand-purple/50 rounded px-2 py-1 text-sm text-white focus:outline-none font-mono"
                          placeholder="+91 XXXXX XXXXX"
                          autoFocus
                        />
                        <button
                          disabled={isSavingPhone}
                          onClick={async () => {
                            if (!user || !phoneValue.trim()) return;
                            setIsSavingPhone(true);
                            try {
                              await updateDoc(doc(db, "users", user.uid), { phone: phoneValue.trim() });
                              await refreshProfile();
                              setIsEditingPhone(false);
                            } catch (err) {
                              console.error("Failed to update phone:", err);
                            } finally {
                              setIsSavingPhone(false);
                            }
                          }}
                          className="p-1 hover:bg-candle-green/20 rounded transition-colors"
                        >
                          {isSavingPhone ? <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-purple" /> : <Check className="w-3.5 h-3.5 text-candle-green" />}
                        </button>
                        <button
                          onClick={() => setIsEditingPhone(false)}
                          className="p-1 hover:bg-candle-red/20 rounded transition-colors"
                        >
                          <X className="w-3.5 h-3.5 text-candle-red" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sandbox-text">{profile.phone || "Not set"}</span>
                        <button
                          onClick={() => { setPhoneValue(profile.phone || ""); setIsEditingPhone(true); }}
                          className="p-1 opacity-0 group-hover/phone:opacity-100 hover:bg-white/10 rounded transition-all"
                          title="Edit phone"
                        >
                          <Pencil className="w-3 h-3 text-sandbox-muted" />
                        </button>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <User className="w-4 h-4 text-sandbox-muted" />
                    <span className="text-sandbox-text">{profile.gender}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-sandbox-muted" />
                    <span className="text-sandbox-text">Joined {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Recently"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="glass-panel rounded-xl p-4 space-y-2">
              <Link href="/sandbox" className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-2.5 text-sm text-sandbox-muted group-hover:text-white transition-colors">
                  <Target className="w-4 h-4 text-brand-purple" />
                  Sandbox
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-sandbox-muted group-hover:text-white transition-colors" />
              </Link>
              <Link href="/quant" className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-2.5 text-sm text-sandbox-muted group-hover:text-white transition-colors">
                  <BrainCircuit className="w-4 h-4 text-brand-purple" />
                  Quant Edge
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-sandbox-muted group-hover:text-white transition-colors" />
              </Link>
              <Link href="/markets" className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-2.5 text-sm text-sandbox-muted group-hover:text-white transition-colors">
                  <Activity className="w-4 h-4 text-brand-purple" />
                  Market Pulse
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-sandbox-muted group-hover:text-white transition-colors" />
              </Link>
            </div>

            {/* SECURITY SECTION */}
            {isPasswordUser && (
              <div className="glass-panel rounded-xl p-6">
                <div className="flex items-center gap-2 mb-6 text-sandbox-muted">
                  <Shield className="w-5 h-5 text-brand-purple" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Security</h3>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  {passwordError && (
                    <div className="p-3 bg-candle-red/10 border border-candle-red/30 rounded-lg text-xs text-candle-red">
                      {passwordError}
                    </div>
                  )}
                  {passwordSuccess && (
                    <div className="p-3 bg-candle-green/10 border border-candle-green/30 rounded-lg text-xs text-candle-green">
                      {passwordSuccess}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-xs font-medium text-sandbox-muted mb-1.5 uppercase tracking-wider">Current Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className="h-4 w-4 text-sandbox-muted" />
                      </div>
                      <input 
                        type="password" 
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full bg-black border border-sandbox-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-purple transition-colors"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-sandbox-muted mb-1.5 uppercase tracking-wider">New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className="h-4 w-4 text-sandbox-muted" />
                      </div>
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-black border border-sandbox-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-purple transition-colors"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isChangingPassword || !oldPassword || !newPassword}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-purple hover:bg-brand-purple/90 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50 mt-2"
                  >
                    {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
                  </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-6">
                  <div className="flex-1 h-px bg-sandbox-border" />
                  <span className="text-[10px] text-sandbox-muted uppercase tracking-wider">or</span>
                  <div className="flex-1 h-px bg-sandbox-border" />
                </div>

                {/* Reset via Email */}
                <div>
                  <p className="text-xs text-sandbox-muted mb-3">
                    Forgot your current password? We&apos;ll send a reset link to <strong className="text-white">{profile.email}</strong>.
                  </p>
                  {resetEmailSent ? (
                    <div className="p-3 bg-candle-green/10 border border-candle-green/30 rounded-lg text-xs text-candle-green flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Reset email sent! Check your inbox.
                    </div>
                  ) : (
                    <button
                      disabled={isSendingReset}
                      onClick={async () => {
                        if (!user?.email) return;
                        setIsSendingReset(true);
                        try {
                          await sendPasswordResetEmail(auth, user.email);
                          setResetEmailSent(true);
                        } catch (err: any) {
                          console.error("Reset email error:", err);
                          setPasswordError(err.message || "Failed to send reset email.");
                        } finally {
                          setIsSendingReset(false);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
                    >
                      {isSendingReset ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                      Send Reset Link via Email
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Stats & Work History */}
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="glass-panel rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2 text-sandbox-muted">
                  <Target className="w-4 h-4" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">Strategies</h3>
                </div>
                <div className="text-3xl font-mono font-bold">
                  {loadingStrategies ? <Loader2 className="w-6 h-6 animate-spin text-brand-purple" /> : strategies.length}
                </div>
              </div>
              <div className="glass-panel rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2 text-sandbox-muted">
                  <Zap className="w-4 h-4" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">Credits Used</h3>
                </div>
                <div className="text-3xl font-mono font-bold">
                  {creditData ? MAX_CREDITS - creditData.credits : "—"}
                </div>
              </div>
              <div className="glass-panel rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2 text-sandbox-muted">
                  <Calendar className="w-4 h-4" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">Member Since</h3>
                </div>
                <div className="text-sm font-mono font-bold mt-1">
                  {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "Recently"}
                </div>
              </div>
            </div>
            
            {/* Strategy History */}
            <div className="glass-panel rounded-xl overflow-hidden">
              <div className="p-6 border-b border-sandbox-border">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-brand-purple" /> Strategy History
                </h3>
                <p className="text-xs text-sandbox-muted mt-1">All strategies you&apos;ve saved from the Sandbox</p>
              </div>
              
              <div className="p-6">
                {loadingStrategies ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
                  </div>
                ) : strategies.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-12">
                    <Target className="w-12 h-12 text-sandbox-border mb-4" />
                    <h3 className="text-lg font-bold mb-2">No Saved Strategies</h3>
                    <p className="text-sm text-sandbox-muted max-w-sm">
                      Head back to the Sandbox, build your first strategy, and hit &quot;Save&quot; to see it appear here.
                    </p>
                    <Link 
                      href="/sandbox"
                      className="mt-6 px-6 py-2 bg-brand-purple hover:bg-brand-purple/90 text-white font-bold rounded-md text-sm transition-colors"
                    >
                      Go to Sandbox
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {strategies.map((strategy) => (
                      <Link 
                        key={strategy.id}
                        href={`/sandbox?strategyId=${strategy.id}`}
                        className="flex items-center justify-between p-4 bg-white/5 border border-sandbox-border rounded-xl hover:border-brand-purple/30 transition-colors group"
                      >
                        <div className="flex-1 min-w-0 mr-4">
                          <h4 className="font-bold text-white truncate">{strategy.name}</h4>
                          <p className="text-xs text-sandbox-muted italic truncate mt-0.5">&quot;{strategy.prompt}&quot;</p>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="flex items-center gap-1 text-[10px] text-sandbox-muted font-mono">
                            <Clock className="w-3 h-3" />
                            {new Date(strategy.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                          </div>
                          <ArrowRight className="w-4 h-4 text-sandbox-muted group-hover:text-brand-purple transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
          
        </div>
      </main>
    </div>
  );
}
