"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, Mail } from "lucide-react";
import { auth } from "@/lib/firebase";
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // View State
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // Email State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Cleanup on close
  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setLoadingProvider(null);
      setIsForgotPassword(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // -----------------------------------------------------------------
  // Google Auth
  // -----------------------------------------------------------------
  const handleGoogleLogin = async () => {
    setLoadingProvider('google');
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Google auth error:", err);
      setError(err.message || "Failed to sign in with Google.");
    } finally {
      setLoadingProvider(null);
    }
  };

  // -----------------------------------------------------------------
  // Email Auth
  // -----------------------------------------------------------------
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    // Password Policy Validation
    if (isSignUp) {
      if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
      if (!/[0-9]/.test(password)) {
        setError("Password must contain at least one number.");
        return;
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        setError("Password must contain at least one special character.");
        return;
      }
    }

    setLoadingProvider('email');
    setError(null);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Email auth error:", err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("Invalid email or password.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("An account with this email already exists.");
      } else if (err.code === 'auth/weak-password') {
        // Fallback if Firebase throws weak-password for another reason
        setError(err.message || "Password does not meet the security policy requirements.");
      } else {
        setError(err.message || "An error occurred during authentication.");
      }
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address to reset your password.");
      return;
    }

    setLoadingProvider('reset');
    setError(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setError("Password reset email sent! Check your inbox.");
      // Note: we purposely don't close the modal so they can see the success message
    } catch (err: any) {
      console.error("Reset error:", err);
      if (err.code === 'auth/user-not-found') {
        setError("No account found with this email.");
      } else {
        setError(err.message || "An error occurred. Please try again.");
      }
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-sandbox-panel border border-sandbox-border rounded-xl shadow-2xl animate-fade-in-up">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-sandbox-muted hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
              {isForgotPassword 
                ? "Reset Password" 
                : isSignUp 
                  ? "Create Account" 
                  : "Welcome Back"}
            </h2>
            <p className="text-sm text-sandbox-muted">
              {isForgotPassword 
                ? "Enter your email to receive a reset link."
                : isSignUp 
                  ? "Join Prizm to save your strategies." 
                  : "Sign in to save and publish your strategies."}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-candle-red/10 border border-candle-red/30 rounded-lg text-xs text-candle-red text-center">
              {error}
            </div>
          )}

          {/* ----------------- EMAIL FORM ----------------- */}
          {!isForgotPassword && (
            <>
              <form onSubmit={handleEmailSubmit} className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-medium text-sandbox-muted mb-1">Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-sandbox-bg border border-sandbox-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-purple transition-colors"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-medium text-sandbox-muted">Password</label>
                    {!isSignUp && (
                      <button 
                        type="button" 
                        onClick={() => setIsForgotPassword(true)}
                        className="text-[10px] font-bold text-brand-purple hover:text-white transition-colors"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-sandbox-bg border border-sandbox-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-purple transition-colors"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loadingProvider !== null}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-purple hover:bg-brand-purple/90 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50 mt-2"
                >
                  {loadingProvider === 'email' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isSignUp ? "Sign Up" : "Sign In"}
                </button>
              </form>

              <div className="mt-4 text-center text-sm">
                <span className="text-sandbox-muted">
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}
                </span>
                <button 
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="ml-2 text-brand-purple hover:text-white font-bold transition-colors"
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </button>
              </div>
            </>
          )}

          {/* ----------------- FORGOT PASSWORD FORM ----------------- */}
          {isForgotPassword && (
            <form onSubmit={handleForgotPassword} className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-sandbox-muted mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-sandbox-bg border border-sandbox-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-purple transition-colors"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loadingProvider !== null || !email}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-purple hover:bg-brand-purple/90 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50 mt-2"
              >
                {loadingProvider === 'reset' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Send Reset Link
              </button>
              <div className="text-center mt-4">
                <button 
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setError(null);
                  }}
                  className="text-xs font-bold text-sandbox-muted hover:text-white transition-colors"
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          )}

          {/* ----------------- GOOGLE (Always Visible unless Forgot Password) ----------------- */}
          {!isForgotPassword && (
            <>
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-sandbox-border"></div>
                <span className="text-xs text-sandbox-muted uppercase tracking-wider">OR</span>
                <div className="flex-1 h-px bg-sandbox-border"></div>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={loadingProvider !== null}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-zinc-200 text-black rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
              >
                {loadingProvider === 'google' ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                Continue with Google
              </button>
            </>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-[10px] text-sandbox-muted leading-relaxed">
              By signing in, you agree to Prizm's<br/>
              <a href="#" className="underline hover:text-white transition-colors">Terms of Service</a> & <a href="#" className="underline hover:text-white transition-colors">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
