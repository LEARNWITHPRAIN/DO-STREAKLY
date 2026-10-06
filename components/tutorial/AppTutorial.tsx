"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, X } from "lucide-react";
import { StreaklyService } from "@/lib/services/streaklyService";

export interface TutorialStep {
  targetId: string;
  fallbackTargetId?: string;
  title: string;
  description: string;
  placement?: "top" | "bottom" | "left" | "right";
  actionHint?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    targetId: "first-habit-card",
    title: "Your first habit",
    description: "Your habits will be listed here and categorized by time.",
    placement: "bottom",
  },
  {
    targetId: "habit-checkbox",
    title: "Check to finish a habit",
    description: "Tap the check box to finish a habit.",
    placement: "left",
  },
  {
    targetId: "habit-more-actions",
    title: "More actions",
    description: "Tap the '...' button to find more actions.",
    placement: "bottom",
  },
  {
    targetId: "habit-undo-menu-item",
    fallbackTargetId: "habit-more-actions",
    title: "Undo",
    description: "You can undo the action after mishandling.",
    placement: "bottom",
  },
  {
    targetId: "nav-journey-tab",
    fallbackTargetId: "nav-journey-tab-desktop",
    title: "Journey",
    description: "Challenge your friends here.",
    placement: "top",
  },
  {
    targetId: "add-habit-btn",
    fallbackTargetId: "add-habit-btn-desktop",
    title: "Add habits",
    description: "Add more habits any time.",
    placement: "bottom",
  },
];

interface AppTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish?: () => void;
}

export function AppTutorial({ isOpen, onClose, onFinish }: AppTutorialProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const step = TUTORIAL_STEPS[currentStepIndex];

  // Measure target DOM element
  const updateTargetPosition = useCallback(() => {
    if (!step) return;

    let el = document.getElementById(step.targetId);
    if (!el && step.fallbackTargetId) {
      el = document.getElementById(step.fallbackTargetId);
    }

    // Special case for Step 4 (Undo): if menu is closed, open the more actions menu so Undo is in the DOM
    if (step.targetId === "habit-undo-menu-item" && !el) {
      const moreBtn = document.getElementById("habit-more-actions");
      if (moreBtn) {
        moreBtn.click();
        setTimeout(() => {
          const undoEl = document.getElementById("habit-undo-menu-item");
          if (undoEl) {
            undoEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
            setTargetRect(undoEl.getBoundingClientRect());
          }
        }, 100);
        return;
      }
    }

    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      // If element not rendered on page yet, fallback to screen center
      setTargetRect(null);
    }
  }, [step]);

  useEffect(() => {
    if (!isOpen) return;
    updateTargetPosition();

    const handleResize = () => updateTargetPosition();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", updateTargetPosition, true);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", updateTargetPosition, true);
    };
  }, [isOpen, currentStepIndex, updateTargetPosition]);

  if (!isOpen || !step) return null;

  const handleNext = () => {
    if (currentStepIndex < TUTORIAL_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    await StreaklyService.setTutorialDone(true);
    if (onFinish) onFinish();
    onClose();
  };

  // Calculate Tooltip position relative to TargetRect
  const getTooltipStyle = () => {
    if (!targetRect) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const margin = 16;
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

    // Default positioning logic
    let top = targetRect.bottom + margin;
    let left = targetRect.left + targetRect.width / 2;

    if (step.placement === "top" || targetRect.bottom + 180 > (window.innerHeight || 800)) {
      top = targetRect.top - margin - 150;
    } else if (step.placement === "left" && !isMobile) {
      left = targetRect.left - margin - 260;
      top = targetRect.top - 10;
      return { top: `${Math.max(20, top)}px`, left: `${Math.max(20, left)}px` };
    }

    // Keep horizontally within viewport
    const clampedLeft = Math.max(16, Math.min((window.innerWidth || 400) - 300, left - 140));

    return {
      top: `${Math.max(20, top)}px`,
      left: `${clampedLeft}px`,
    };
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-auto select-none overflow-hidden">
      {/* 1. Dim the screen backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-[2px] transition-all duration-300"
        onClick={handleNext}
      />

      {/* 2. Highlight element with blue outline & glowing ring */}
      {targetRect && (
        <motion.div
          layoutId="tutorial-highlight-box"
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
          className="absolute z-[101] rounded-2xl border-2 border-blue-400 ring-4 ring-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.7)] cursor-pointer"
          onClick={handleNext}
        />
      )}

      {/* 3. Green rounded tooltip with pointer arrow */}
      <motion.div
        key={currentStepIndex}
        initial={{ opacity: 0, y: 8, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        style={getTooltipStyle()}
        className="absolute z-[102] w-[290px] md:w-[320px] rounded-2xl border-2 border-[#22c55e] bg-[#144728] p-4 text-white shadow-2xl backdrop-blur-md"
      >
        {/* Pointer arrow indicator */}
        <div
          className={`absolute h-3 w-3 bg-[#144728] border-t-2 border-l-2 border-[#22c55e] rotate-45 ${
            step.placement === "top"
              ? "-bottom-2 left-10 border-t-0 border-l-0 border-b-2 border-r-2"
              : "-top-2 left-10"
          }`}
        />

        {/* Step progress & header */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#B6F34A]">
            Step {currentStepIndex + 1} of {TUTORIAL_STEPS.length}
          </span>
          <span className="text-[11px] font-bold text-emerald-200">
            {step.title}
          </span>
        </div>

        {/* Tooltip Content Description */}
        <p className="text-xs md:text-sm text-gray-100 font-medium leading-relaxed">
          {step.description}
        </p>

        {/* Advance Arrow / Next button */}
        <div className="mt-3 pt-2.5 border-t border-emerald-600/40 flex items-center justify-between">
          <span className="text-[10px] text-emerald-300">
            Tap highlighted element to advance
          </span>
          <button
            onClick={handleNext}
            className="flex items-center gap-1 bg-[#B6F34A] text-[#0B0F0D] hover:bg-[#a3e635] px-3 py-1 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <span>{currentStepIndex === TUTORIAL_STEPS.length - 1 ? "Finish" : "Next"}</span>
            <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
          </button>
        </div>
      </motion.div>

      {/* 4. "SKIP TUTORIAL" outlined pill at the bottom */}
      <div className="absolute bottom-8 left-0 right-0 z-[102] flex justify-center">
        <button
          onClick={handleComplete}
          className="rounded-full border border-white/50 bg-black/40 hover:bg-black/70 hover:border-white px-6 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-lg backdrop-blur-md transition-all active:scale-95"
        >
          SKIP TUTORIAL
        </button>
      </div>
    </div>
  );
}
