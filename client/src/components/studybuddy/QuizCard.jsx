import React from "react";
import { Check, X, AlertCircle } from "lucide-react";

/**
 * QuizCard component.
 * Displays a single MCQ item. Options are interactive and change color
 * based on selected states and correctness once answers are revealed.
 */
export const QuizCard = ({
  question,
  options,
  correctAnswer,
  selectedOption,
  showAnswers,
  onSelectOption,
  index,
}) => {
  
  // Helper to extract option letter (e.g. "A" from "A) Option text" or index-based)
  const getOptionLetter = (opt, idx) => {
    // If the option starts with "A)" or "A -", parse it. Otherwise use index map: 0->A, 1->B, etc.
    const cleanOpt = opt.trim();
    if (/^[A-D][\s\)\.\-]/.test(cleanOpt)) {
      return cleanOpt.charAt(0).toUpperCase();
    }
    return ["A", "B", "C", "D"][idx];
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm transition-colors duration-300 space-y-4">
      
      {/* Question Header */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-primary dark:text-primary-400 uppercase tracking-wider">
          Question {index + 1}
        </span>
        <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-relaxed">
          {question}
        </h4>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((option, idx) => {
          const letter = getOptionLetter(option, idx);
          const isSelected = selectedOption === letter;
          const isCorrect = correctAnswer === letter;
          
          let optionStyles = "border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-850";
          let IndicatorIcon = null;

          if (showAnswers) {
            if (isCorrect) {
              // Highlight correct answer in Green
              optionStyles = "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60 font-semibold";
              IndicatorIcon = <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
            } else if (isSelected && !isCorrect) {
              // Highlight selected incorrect answer in Red
              optionStyles = "border-red-500 bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/60 font-semibold";
              IndicatorIcon = <X className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />;
            } else {
              // Gray out other unselected incorrect answers
              optionStyles = "border-gray-200 dark:border-slate-900 bg-gray-50/50 dark:bg-slate-950/40 text-gray-400 dark:text-slate-650 cursor-not-allowed";
            }
          } else if (isSelected) {
            // Selected option styling before answers are shown
            optionStyles = "border-primary bg-sky-50/40 text-primary dark:border-primary-400 dark:bg-sky-950/25 dark:text-primary-400 font-semibold ring-2 ring-primary/10 dark:ring-primary-450/10";
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={showAnswers}
              onClick={() => onSelectOption(letter)}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all duration-250 focus:outline-none ${optionStyles}`}
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold shrink-0 ${
                  isSelected 
                    ? "bg-primary text-white dark:bg-primary-400 dark:text-slate-950" 
                    : "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400"
                }`}>
                  {letter}
                </span>
                <span className="leading-relaxed">{option}</span>
              </div>
              
              {IndicatorIcon}
            </button>
          );
        })}
      </div>

      {/* Show answers validation notice */}
      {showAnswers && !selectedOption && (
        <p className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-450 font-medium">
          <AlertCircle className="h-3.5 w-3.5" />
          You did not answer this question.
        </p>
      )}
    </div>
  );
};

export default QuizCard;
