import React, { useState } from "react";
import { RefreshCw, HelpCircle, CheckCircle } from "lucide-react";

/**
 * FlashcardItem component.
 * Implements a 3D double-sided flip card using pure Tailwind classes,
 * displaying a question on the front and answer on the back.
 */
export const FlashcardItem = ({ question, answer, difficulty, index }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const getDifficultyBadge = (level) => {
    const l = (level || "medium").toLowerCase();
    switch (l) {
      case "easy":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-panel2 text-emerald-600 dark:text-emerald-400 border border-border text-[10px] font-bold tracking-wide uppercase font-heading">
            🟢 Easy
          </span>
        );
      case "hard":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-panel2 text-red-600 dark:text-red-400 border border-border text-[10px] font-bold tracking-wide uppercase font-heading">
            🔴 Hard
          </span>
        );
      case "medium":
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-panel2 text-amber-600 dark:text-amber-400 border border-border text-[10px] font-bold tracking-wide uppercase font-heading">
            🟡 Medium
          </span>
        );
    }
  };

  return (
    <div
      onClick={() => setIsFlipped((prev) => !prev)}
      className="group h-56 w-full cursor-pointer [perspective:1000px]"
    >
      <div
        className={`relative h-full w-full rounded-[4px] transition-transform duration-500 [transform-style:preserve-3d] ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        
        {/* =====================================================================
            FRONT SIDE (Question)
            ===================================================================== */}
        <div className="absolute inset-0 flex flex-col justify-between p-6 bg-panel border border-border rounded-[4px] [backface-visibility:hidden]">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-primary">
              <span className="flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4" />
                CARD {index + 1}
              </span>
              {getDifficultyBadge(difficulty)}
            </div>
            
            <p className="text-sm sm:text-base font-semibold text-txt leading-relaxed line-clamp-4">
              {question}
            </p>
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted border-t border-border pt-3">
            <span className="flex items-center gap-1 font-bold">
              <RefreshCw className="h-3.5 w-3.5" />
              Click card to flip
            </span>
          </div>
        </div>

        {/* =====================================================================
            BACK SIDE (Answer)
            ===================================================================== */}
        <div className="absolute inset-0 flex flex-col justify-between p-6 bg-primary text-white border border-primary rounded-[4px] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-sky-100">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4.5 w-4.5" />
                ANSWER {index + 1}
              </span>
              <span className="text-[10px] uppercase tracking-wider font-bold">Solution</span>
            </div>
            
            {/* Scrollable container in case answer is detailed */}
            <div className="max-h-28 overflow-y-auto pr-1">
              <p className="text-sm leading-relaxed font-medium">
                {answer}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-sky-100 border-t border-[#3B82F6] pt-3">
            <span className="flex items-center gap-1 font-bold">
              <RefreshCw className="h-3.5 w-3.5" />
              Click card to flip back
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FlashcardItem;
