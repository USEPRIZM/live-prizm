"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Loader2, Shield, Users, Mail, Phone, User, Calendar, ChevronDown, Search, ArrowLeft, Activity, Zap, Pencil, Check, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { setCreditsForUser, MAX_CREDITS } from "@/lib/credits";

// Allowlist of admin emails — only these users can access this page
const ADMIN_EMAILS = [
  "swarnimmishra@gmail.com",
  "swarnimera@gmail.com",
  "admin@useprizm.in",
  // Add more admin emails here
];

interface UserRecord {
  uid: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  experience: string;
  createdAt: number;
  credits?: number;
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"createdAt" | "name" | "experience">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [editingCreditUid, setEditingCreditUid] = useState<string | null>(null);
  const [editCreditValue, setEditCreditValue] = useState("");

  // Auth gate — redirect if not admin
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
      return;
    }
    if (!loading && user && !ADMIN_EMAILS.includes(user.email || "")) {
      router.push("/");
      return;
    }
  }, [user, loading, router]);

  // Fetch all users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user || !ADMIN_EMAILS.includes(user.email || "")) return;

      try {
        const usersRef = collection(db, "users");
        const snapshot = await getDocs(usersRef);
        const fetched: UserRecord[] = [];
        snapshot.forEach((doc) => {
          fetched.push({ uid: doc.id, ...doc.data() } as UserRecord);
        });
        setUsers(fetched);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    if (!loading && user) {
      fetchUsers();
    }
  }, [user, loading]);

  // Auth loading / unauthorized state
  if (loading || !user || !ADMIN_EMAILS.includes(user.email || "")) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
      </div>
    );
  }

  // Filtered & sorted users
  const filteredUsers = users
    .filter((u) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.includes(q)
      );
    })
    .sort((a, b) => {
      if (sortField === "createdAt") {
        return sortDir === "desc" ? b.createdAt - a.createdAt : a.createdAt - b.createdAt;
      }
      if (sortField === "name") {
        return sortDir === "desc"
          ? (b.name || "").localeCompare(a.name || "")
          : (a.name || "").localeCompare(b.name || "");
      }
      if (sortField === "experience") {
        return sortDir === "desc"
          ? (b.experience || "").localeCompare(a.experience || "")
          : (a.experience || "").localeCompare(b.experience || "");
      }
      return 0;
    });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const experienceColor = (exp: string) => {
    switch (exp?.toLowerCase()) {
      case "beginner":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "intermediate":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "advanced":
        return "bg-candle-green/10 text-candle-green border-candle-green/30";
      case "professional":
        return "bg-brand-purple/10 text-brand-purple border-brand-purple/30";
      default:
        return "bg-white/5 text-sandbox-muted border-white/10";
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white font-sans">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-6 h-6 text-candle-red" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Panel</h1>
        </div>
        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="glass-panel rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2 text-sandbox-muted">
              <Users className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
            </div>
            <div className="text-3xl font-mono font-bold text-white">
              {isLoadingUsers ? <Loader2 className="w-6 h-6 animate-spin text-brand-purple" /> : users.length}
            </div>
          </div>
          <div className="glass-panel rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2 text-sandbox-muted">
              <Activity className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Newest User</span>
            </div>
            <div className="text-sm font-mono font-bold text-white truncate">
              {isLoadingUsers ? "..." : users.length > 0 ? users.sort((a, b) => b.createdAt - a.createdAt)[0]?.name || "—" : "—"}
            </div>
          </div>
          <div className="glass-panel rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2 text-sandbox-muted">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Your Role</span>
            </div>
            <div className="text-sm font-bold text-candle-green">Super Admin</div>
          </div>
        </div>

        {/* Search */}
        <div className="glass-panel rounded-xl p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sandbox-muted" />
            <input
              type="text"
              placeholder="Search users by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-purple/50 transition-colors placeholder:text-sandbox-muted font-mono"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="glass-panel rounded-xl overflow-hidden">
          {isLoadingUsers ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-20 text-sandbox-muted">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-sm">No users found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-sandbox-border bg-white/5">
                    <th className="py-4 px-6 text-xs font-bold text-sandbox-muted uppercase tracking-wider">#</th>
                    <th
                      className="py-4 px-6 text-xs font-bold text-sandbox-muted uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                      onClick={() => toggleSort("name")}
                    >
                      <div className="flex items-center gap-1">
                        Name {sortField === "name" && <ChevronDown className={`w-3 h-3 transition-transform ${sortDir === "asc" ? "rotate-180" : ""}`} />}
                      </div>
                    </th>
                    <th className="py-4 px-6 text-xs font-bold text-sandbox-muted uppercase tracking-wider">Email</th>
                    <th className="py-4 px-6 text-xs font-bold text-sandbox-muted uppercase tracking-wider">Phone</th>
                    <th className="py-4 px-6 text-xs font-bold text-sandbox-muted uppercase tracking-wider">Gender</th>
                    <th className="py-4 px-6 text-xs font-bold text-sandbox-muted uppercase tracking-wider">Credits</th>
                    <th
                      className="py-4 px-6 text-xs font-bold text-sandbox-muted uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                      onClick={() => toggleSort("experience")}
                    >
                      <div className="flex items-center gap-1">
                        Experience {sortField === "experience" && <ChevronDown className={`w-3 h-3 transition-transform ${sortDir === "asc" ? "rotate-180" : ""}`} />}
                      </div>
                    </th>
                    <th
                      className="py-4 px-6 text-xs font-bold text-sandbox-muted uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                      onClick={() => toggleSort("createdAt")}
                    >
                      <div className="flex items-center gap-1">
                        Joined {sortField === "createdAt" && <ChevronDown className={`w-3 h-3 transition-transform ${sortDir === "asc" ? "rotate-180" : ""}`} />}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, index) => (
                    <tr key={u.uid} className="border-b border-sandbox-border/50 hover:bg-white/5 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="w-7 h-7 rounded-full bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center text-[11px] font-mono font-bold text-brand-purple">
                          {index + 1}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sm font-bold text-white">
                            {u.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <span className="font-medium text-white">{u.name || "—"}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-sm text-sandbox-muted">
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          <span className="font-mono text-xs">{u.email || "—"}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-sm text-sandbox-muted">
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          <span className="font-mono text-xs">{u.phone || "—"}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs text-sandbox-muted">{u.gender || "—"}</span>
                      </td>
                      <td className="py-4 px-6">
                        {editingCreditUid === u.uid ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              value={editCreditValue}
                              onChange={(e) => setEditCreditValue(e.target.value)}
                              className="w-16 bg-black border border-brand-purple/50 rounded px-2 py-1 text-xs font-mono text-white focus:outline-none"
                              min={0}
                              max={MAX_CREDITS}
                              autoFocus
                            />
                            <button
                              onClick={async () => {
                                const val = parseInt(editCreditValue);
                                if (!isNaN(val)) {
                                  await setCreditsForUser(u.uid, val);
                                  setUsers(prev => prev.map(x => x.uid === u.uid ? { ...x, credits: Math.max(0, Math.min(val, MAX_CREDITS)) } : x));
                                }
                                setEditingCreditUid(null);
                              }}
                              className="p-1 hover:bg-candle-green/20 rounded transition-colors"
                            >
                              <Check className="w-3.5 h-3.5 text-candle-green" />
                            </button>
                            <button
                              onClick={() => setEditingCreditUid(null)}
                              className="p-1 hover:bg-candle-red/20 rounded transition-colors"
                            >
                              <X className="w-3.5 h-3.5 text-candle-red" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-brand-purple" />
                            <span className="text-xs font-mono font-bold text-white">{u.credits ?? "—"}</span>
                            <button
                              onClick={() => { setEditingCreditUid(u.uid); setEditCreditValue(String(u.credits ?? 0)); }}
                              className="p-1 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded transition-all"
                              title="Edit credits"
                            >
                              <Pencil className="w-3 h-3 text-sandbox-muted" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${experienceColor(u.experience)}`}>
                          {u.experience || "—"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs font-mono text-sandbox-muted">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
