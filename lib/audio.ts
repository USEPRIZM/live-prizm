"use client";

// Simple Web Audio API synthesizer for UI interactions

let audioCtx: AudioContext | null = null;

const getContext = () => {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
};

// A very short, crisp, subtle tick for generic clicks
export const playTick = () => {
  const ctx = getContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);

  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.05);
};

// A softer, slightly longer pop for opening panels
export const playPop = () => {
  const ctx = getContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.1);
};

// A gentle ascending chime for successful tasks (like backtest finishing)
export const playSuccess = () => {
  const ctx = getContext();
  if (!ctx) return;

  const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5 (A Major arpeggio)
  const duration = 0.1;

  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime + index * duration);

    gain.gain.setValueAtTime(0, ctx.currentTime + index * duration);
    gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + index * duration + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * duration + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + index * duration);
    osc.stop(ctx.currentTime + index * duration + duration);
  });
};
