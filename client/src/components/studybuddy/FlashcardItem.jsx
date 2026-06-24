import React, { useState } from "react";
import { RefreshCw, HelpCircle, CheckCircle } from "lucide-react";

/**
 * FlashcardItem component.
 * Implements a 3D double-sided flip card using pure Tailwind classes,
 * displaying a question on the front and answer on the back.
 */
export const FlashcardItem = ({ question, answer, index }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      onClick={() => setIsFlipped((prev) => !prev)}
      className="group h-56 w-full cursor-pointer [perspective:1000px]"
    >
      <div
        className={`relative h-full w-full rounded-2xl transition-transform duration-500 [transform-style:preserve-3d] ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        
        {/* =====================================================================
            FRONT SIDE (Question)
            ===================================================================== */}
        <div className="absolute inset-0 flex flex-col justify-between p-6 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 [backface-visibility:hidden]">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-primary dark:text-primary-400">
              <span className="flex items-center gap-1">
                <HelpCircle className="h-4.5 w-4.5" />
                CARD {index + 1}
              </span>
              <span className="text-gray-400 dark:text-slate-500">Question</span>
            </div>
            
            <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white leading-relaxed line-clamp-4">
              {question}
            </p>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-400 dark:text-slate-500 border-t border-gray-100 dark:border-slate-900 pt-3">
            <span className="flex items-center gap-1 font-medium">
              <RefreshCw className="h-3.5 w-3.5 animate-spin-slow" />
              Click card to flip
            </span>
          </div>
        </div>

        {/* =====================================================================
            BACK SIDE (Answer)
            ===================================================================== */}
        <div className="absolute inset-0 flex flex-col justify-between p-6 bg-primary text-white border border-primary-600 rounded-2xl shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-sky-100">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4.5 w-4.5" />
                ANSWER {index + 1}
              </span>
              <span>Solution</span>
            </div>
            
            {/* Scrollable container in case answer is detailed */}
            <div className="max-h-28 overflow-y-auto pr-1">
              <p className="text-sm leading-relaxed font-medium">
                {answer}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-sky-100 border-t border-primary-600 pt-3">
            <span className="flex items-center gap-1">
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
