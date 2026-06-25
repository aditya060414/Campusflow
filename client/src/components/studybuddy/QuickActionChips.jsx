import React from "react";
import {
  HelpCircle,
  Copy,
  CheckSquare,
  FileText,
  Sparkles,
} from "lucide-react";

export const QuickActionChips = ({ onChipClick, onTabSwitch }) => {
  const chips = [
    {
      label: "Explain Topic",
      icon: HelpCircle,
      prompt:
        "Provide a comprehensive, clear, and high-level explanation of the primary concepts in my uploaded notes for this subject.",
      color: "hover:text-primary hover:border-primary hover:bg-panel2",
    },
    {
      label: "Summarize Notes",
      icon: FileText,
      prompt:
        "Summarize the key takeaways, chapters, and core definitions in my uploaded lecture notes.",
      color: "hover:text-purple-500 hover:border-purple-500 hover:bg-panel2",
    },
    {
      label: "Generate Flashcards",
      icon: Copy,
      action: "flashcards",
      color: "hover:text-amber-500 hover:border-amber-500 hover:bg-panel2",
    },
    {
      label: "Generate Quiz",
      icon: CheckSquare,
      action: "quiz",
      color: "hover:text-emerald-500 hover:border-emerald-500 hover:bg-panel2",
    },
  ];

  const handleClick = (chip) => {
    if (chip.prompt && onChipClick) {
      onChipClick(chip.prompt);
    } else if (chip.action && onTabSwitch) {
      onTabSwitch(chip.action);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip, idx) => {
        const Icon = chip.icon;
        return (
          <button
            key={idx}
            type="button"
            onClick={() => handleClick(chip)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border border-border bg-panel text-xs font-bold text-muted transition-colors duration-150 ${chip.color}`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{chip.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default QuickActionChips;
