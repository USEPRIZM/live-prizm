/**
 * Prizm Credit System
 * Manages user credits stored in Firestore.
 * Credits reset every 24 hours (stacking on top of existing balance, capped at MAX).
 */
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";

// --- Credit Costs ---
export const CREDIT_COSTS = {
  GENERATE_STRATEGY: 2,
  RUN_BACKTEST: 1,
  EXPLAIN_CHART: 3,
  ANALYZE_NEWS: 2,
  QUANT_INSIGHTS: 2,
} as const;

const MAX_CREDITS = 100;
const DAILY_REFRESH = 20;
const INITIAL_CREDITS = 50;
const REFRESH_INTERVAL_HOURS = 24;

export { MAX_CREDITS, DAILY_REFRESH, INITIAL_CREDITS };

export interface CreditData {
  credits: number;
  lastCreditRefresh: string;
}

/**
 * Get or initialize the user's credit document.
 */
export async function getCredits(uid: string): Promise<number> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const data: CreditData = {
      credits: INITIAL_CREDITS,
      lastCreditRefresh: new Date().toISOString(),
    };
    await setDoc(ref, data, { merge: true });
    return INITIAL_CREDITS;
  }

  const data = snap.data() as Partial<CreditData>;

  if (data.credits === undefined) {
    await setDoc(ref, { credits: INITIAL_CREDITS, lastCreditRefresh: new Date().toISOString() }, { merge: true });
    return INITIAL_CREDITS;
  }

  return data.credits;
}

/**
 * Get full credit data including last refresh timestamp.
 */
export async function getCreditData(uid: string): Promise<CreditData> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const data: CreditData = {
      credits: INITIAL_CREDITS,
      lastCreditRefresh: new Date().toISOString(),
    };
    await setDoc(ref, data, { merge: true });
    return data;
  }

  const raw = snap.data() as Partial<CreditData>;
  return {
    credits: raw.credits ?? INITIAL_CREDITS,
    lastCreditRefresh: raw.lastCreditRefresh ?? new Date().toISOString(),
  };
}

/**
 * Check if user has enough credits for an action.
 */
export async function hasEnoughCredits(uid: string, cost: number): Promise<boolean> {
  const credits = await getCredits(uid);
  return credits >= cost;
}

/**
 * Deduct credits from a user. Returns the new balance.
 * Returns -1 if insufficient credits.
 */
export async function deductCredits(uid: string, cost: number): Promise<number> {
  const credits = await getCredits(uid);
  if (credits < cost) return -1;

  const ref = doc(db, "users", uid);
  await updateDoc(ref, { credits: increment(-cost) });
  return credits - cost;
}

/**
 * Set a user's credits to an exact value (admin only).
 */
export async function setCreditsForUser(uid: string, newCredits: number): Promise<void> {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, { credits: Math.max(0, Math.min(newCredits, MAX_CREDITS)) });
}

/**
 * Calculate when the next credit refresh will happen.
 */
export function getNextRefreshTime(lastRefreshISO: string): Date {
  const lastRefresh = new Date(lastRefreshISO);
  return new Date(lastRefresh.getTime() + REFRESH_INTERVAL_HOURS * 60 * 60 * 1000);
}

/**
 * Check and apply daily credit refresh.
 * Adds DAILY_REFRESH credits if 24 hours have passed since last refresh, 
 * stacking on top of current balance (capped at MAX_CREDITS).
 * Returns the new balance.
 */
export async function refreshDailyCredits(uid: string): Promise<number> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return await getCredits(uid);
  }

  const data = snap.data() as Partial<CreditData>;
  const lastRefresh = data.lastCreditRefresh ? new Date(data.lastCreditRefresh) : new Date(0);
  const now = new Date();

  // Check if 24 hours have passed since the last refresh
  const hoursSinceRefresh = (now.getTime() - lastRefresh.getTime()) / (1000 * 60 * 60);

  if (hoursSinceRefresh >= REFRESH_INTERVAL_HOURS) {
    // Calculate how many full 24h cycles have passed
    const cyclesPassed = Math.floor(hoursSinceRefresh / REFRESH_INTERVAL_HOURS);
    const creditsToAdd = cyclesPassed * DAILY_REFRESH;
    const currentCredits = data.credits ?? 0;
    const newCredits = Math.min(currentCredits + creditsToAdd, MAX_CREDITS);

    // Set the lastRefresh to the most recent cycle boundary
    const newRefreshTime = new Date(lastRefresh.getTime() + cyclesPassed * REFRESH_INTERVAL_HOURS * 60 * 60 * 1000);

    await updateDoc(ref, {
      credits: newCredits,
      lastCreditRefresh: newRefreshTime.toISOString(),
    });
    return newCredits;
  }

  return data.credits ?? INITIAL_CREDITS;
}
