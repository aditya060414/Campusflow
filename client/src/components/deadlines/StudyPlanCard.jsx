import React from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Renders an individual study session roadmap checkbox card.
 * Features customizable checked states and strike-through fonts.
 */
export const StudyPlanCard = ({ session, onToggle }) => {
  const { dayNumber, date, task, hours, completed } = session;

  return (
    <div
      onClick={() => onToggle(!completed)}
      className={`p-3.5 border rounded-[4px] flex items-center justify-between gap-3 cursor-pointer transition-colors duration-150 relative ${
        completed
          ? "border-emerald-500/30 bg-emerald-500/[0.03]"
          : "bg-panel border-border hover:border-muted/50"
      }`}
    >
      <div className="flex items-center gap-3 truncate max-w-[85%]">
        {/* Custom checkbox */}
        <div
          className={`h-4 w-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${
            completed
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "border-border bg-panel"
          }`}
        >
          {completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
        </div>

        {/* Task Details */}
        <div className="space-y-0.5 truncate">
          <span
            className={`text-[9px] font-bold tracking-wider uppercase block font-display ${completed ? "text-emerald-500/70" : "text-primary"}`}
          >
            Day {dayNumber} •{" "}
            {new Date(date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>

          <span
            className={`text-[13px] font-bold block truncate font-body ${
              completed
                ? "text-muted/60 line-through font-medium"
                : "text-txt"
            }`}
          >
            {task}
          </span>
        </div>
      </div>

      {/* Duration badge */}
      <div
        className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 uppercase tracking-wider border font-display ${
          completed
            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            : "bg-primary/10 text-primary border-primary/20"
        }`}
      >
        {hours}h
      </div>
    </div>
  );
};

export default StudyPlanCard;
