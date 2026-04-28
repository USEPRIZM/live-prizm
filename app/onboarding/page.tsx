"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [experience, setExperience] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If not logged in, they shouldn't be here
    if (!loading && !user) {
      router.push("/");
    }
    // If they already have a profile, they shouldn't be here
    if (!loading && profile) {
      router.push("/dashboard");
    }
    // Pre-fill name from Google auth if available
    if (user?.displayName && !name) {
      setName(user.displayName);
    }
  }, [user, profile, loading, router, name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!name || !phone || !gender || !experience) {
      setError("Please fill out all fields.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const userDoc = {
        uid: user.uid,
        name,
        email: user.email || "",
        phone,
        gender,
        experience,
        createdAt: Date.now(),
      };

      await setDoc(doc(db, "users", user.uid), userDoc);
      await refreshProfile(); // Force the context to fetch the newly created profile
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Error creating profile:", err);
      setError("Failed to create profile. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (loading || (!loading && (!user || profile))) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sandbox-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-sandbox-panel border border-sandbox-border rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        <div className="p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Complete Your Profile</h1>
            <p className="text-sm text-sandbox-muted">We need a few more details before you can access Prizm.</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-candle-red/10 border border-candle-red/30 rounded-lg text-xs text-candle-red text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-sandbox-muted mb-1.5 uppercase tracking-wider">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black border border-sandbox-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-purple transition-colors"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-sandbox-muted mb-1.5 uppercase tracking-wider">Phone Number</label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-black border border-sandbox-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-purple transition-colors"
                placeholder="+91 98765 43210"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-sandbox-muted mb-1.5 uppercase tracking-wider">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-black border border-sandbox-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-purple transition-colors appearance-none"
                required
              >
                <option value="" disabled>Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-sandbox-muted mb-1.5 uppercase tracking-wider">Trading Experience</label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full bg-black border border-sandbox-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-purple transition-colors appearance-none"
                required
              >
                <option value="" disabled>Select your experience level</option>
                <option value="Novice (0-1 yrs)">Novice (0-1 yrs)</option>
                <option value="Intermediate (1-3 yrs)">Intermediate (1-3 yrs)</option>
                <option value="Expert (3+ yrs)">Expert (3+ yrs)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-purple hover:bg-brand-purple/90 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50 mt-4"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Setup →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
