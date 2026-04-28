"use client";

import React, { useState, useEffect } from "react";
import { X, ChevronRight, Check } from "lucide-react";

interface Step {
  target: string;
  title: string;
  content: string;
  placement: "bottom" | "left" | "right" | "top";
}

const TOUR_STEPS: Step[] = [
  {
    target: "#tour-search",
    title: "1. Select a Stock",
    content: "Start by searching for any NSE or BSE stock to load its historical price data.",
    placement: "bottom",
  },
  {
    target: "#tour-chart",
    title: "2. Analyze the Trend",
    content: "View the candlestick chart and volume to identify trading opportunities across different time ranges.",
    placement: "right",
  },
  {
    target: "#tour-strategy",
    title: "3. Build a Strategy",
    content: "Describe your trading idea in plain English, or click a Starter Strategy to load an example.",
    placement: "left",
  },
  {
    target: "#tour-run-backtest",
    title: "4. Run Backtest",
    content: "Click this to simulate your strategy against years of historical data and view the results below.",
    placement: "top",
  },
];

export default function GuidedTour() {
  const [runTour, setRunTour] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    // Only run once per session/localstorage
    const hasSeenTour = localStorage.getItem("prizm_has_seen_tour");
    if (!hasSeenTour) {
      // Small delay to let UI render
      setTimeout(() => setRunTour(true), 1500);
    }
  }, []);

  useEffect(() => {
    if (!runTour) return;

    const updateRect = () => {
      const el = document.querySelector(TOUR_STEPS[currentStep].target);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      }
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    return () => window.removeEventListener("resize", updateRect);
  }, [runTour, currentStep]);

  if (!runTour || !targetRect) return null;

  const step = TOUR_STEPS[currentStep];

  // Calculate popover position
  let popoverStyle: React.CSSProperties = {};
  const spacing = 16;

  switch (step.placement) {
    case "bottom":
      popoverStyle = { top: targetRect.bottom + spacing, left: targetRect.left };
      break;
    case "left":
      popoverStyle = { top: targetRect.top, right: window.innerWidth - targetRect.left + spacing };
      break;
    case "right":
      popoverStyle = { top: targetRect.top, left: targetRect.right + spacing };
      break;
    case "top":
      popoverStyle = { bottom: window.innerHeight - targetRect.top + spacing, left: targetRect.left };
      break;
  }

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(c => c + 1);
    } else {
      endTour();
    }
  };

  const endTour = () => {
    setRunTour(false);
    localStorage.setItem("prizm_has_seen_tour", "true");
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 z-40 transition-opacity" />

      {/* Spotlight highlight hole */}
      <div
        className="fixed z-40 border-2 border-white rounded-md pointer-events-none transition-all duration-300 ease-in-out shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
        style={{
          top: targetRect.top - 8,
          left: targetRect.left - 8,
          width: targetRect.width + 16,
          height: targetRect.height + 16,
        }}
      />

      {/* Popover */}
      <div
        className="fixed z-50 w-72 bg-sandbox-panel border border-sandbox-border rounded-md p-5 shadow-2xl transition-all duration-300 ease-in-out"
        style={popoverStyle}
      >
        <button onClick={endTour} className="absolute top-3 right-3 text-sandbox-muted hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-sm font-bold text-white mb-2 pr-6">{step.title}</h3>
        <p className="text-xs text-sandbox-muted leading-relaxed mb-6">
          {step.content}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {TOUR_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  idx === currentStep ? "bg-white" : "bg-sandbox-border"
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 bg-white hover:bg-zinc-200 text-black px-3 py-1.5 rounded-md text-xs font-bold transition-colors"
          >
            {currentStep === TOUR_STEPS.length - 1 ? (
              <>Finish <Check className="w-3.5 h-3.5" /></>
            ) : (
              <>Next <ChevronRight className="w-3.5 h-3.5" /></>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
