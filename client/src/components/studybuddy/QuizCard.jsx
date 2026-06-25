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
    <div className="p-6 bg-panel border border-border rounded-lg space-y-4">
      
      {/* Question Header */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-primary uppercase tracking-wider">
          Question {index + 1}
        </span>
        <h4 className="text-sm sm:text-base font-bold text-txt leading-relaxed">
          {question}
        </h4>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((option, idx) => {
          const letter = getOptionLetter(option, idx);
          const isSelected = selectedOption === letter;
          const isCorrect = correctAnswer === letter;
          
          let optionStyles = "border-border bg-panel text-txt hover:bg-panel2";
          let IndicatorIcon = null;

          if (showAnswers) {
            if (isCorrect) {
              // Highlight correct answer in Green
              optionStyles = "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold";
              IndicatorIcon = <Check className="h-4 w-4 text-emerald-400 shrink-0" />;
            } else if (isSelected && !isCorrect) {
              // Highlight selected incorrect answer in Red
              optionStyles = "border-red-500 bg-red-500/10 text-red-400 font-bold";
              IndicatorIcon = <X className="h-4 w-4 text-red-400 shrink-0" />;
            } else {
              // Gray out other unselected incorrect answers
              optionStyles = "border-border bg-panel text-muted opacity-50 cursor-not-allowed";
            }
          } else if (isSelected) {
            // Selected option styling before answers are shown
            optionStyles = "border-primary bg-panel2 text-primary font-bold";
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={showAnswers}
              onClick={() => onSelectOption(letter)}
              className={`w-full flex items-center justify-between p-3.5 rounded-[4px] border text-left text-xs sm:text-sm transition-colors duration-150 focus:outline-none ${optionStyles}`}
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-6 w-6 items-center justify-center rounded-[4px] text-xs font-bold shrink-0 ${
                  isSelected 
                    ? "bg-primary text-white" 
                    : "bg-panel2 text-muted border border-border"
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
        <p className="flex items-center gap-1 text-[11px] text-amber-400 font-bold">
          <AlertCircle className="h-3.5 w-3.5" />
          You did not answer this question.
        </p>
      )}
    </div>
  );
};

export default QuizCard;
