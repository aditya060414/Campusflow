import React from "react";
import { Calendar } from "lucide-react";
import { motion } from "framer-motion";

/**
 * A beautiful, vertical chronological timeline representing academic milestones.
 * Refactored to be a compact summary widget: max-height 280px, scrollable list, fixed header.
 */
export const DeadlineTimeline = ({ deadlines = [] }) => {
  // Sort incomplete deadlines chronologically (closest first)
  const activeTimeline = [...deadlines]
    .filter((d) => !d.completed && d.daysRemaining >= 0)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  // If no active deadlines, render nothing
  if (activeTimeline.length === 0) {
    return null;
  }

  // Priority color nodes
  const getNodeColor = (priority) => {
    if (priority === "High") return "bg-red-500";
    if (priority === "Medium") return "bg-amber-505 bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div className="p-6 bg-panel border border-border rounded-lg space-y-5 relative z-10 w-full max-h-[280px] flex flex-col justify-between animate-fade-in">
      {/* Fixed Header */}
      <div className="space-y-1 shrink-0">
        <h2 className="text-[16px] sm:text-[18px] font-bold text-txt font-display">
          Milestone Timeline
        </h2>
        <p className="text-[12px] text-muted">
          Chronological path of your active exams, assignments, and project submissions
        </p>
      </div>

      {/* Scrollable Timeline Track */}
      <div className="relative pl-6 space-y-6 flex-1 overflow-y-auto pr-1 mt-2">
        {/* Timeline path line */}
        <div className="absolute left-2.5 top-2.5 bottom-2.5 w-[2px] bg-border rounded-full" />

        {activeTimeline.map((d, idx) => {
          return (
            <div
              key={d.id}
              className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 group pb-1 font-body"
            >
              {/* Timeline Indicator Node */}
              <div
                className={`absolute -left-[18px] top-[5px] h-3 w-3 rounded-full border-2 border-panel transition-transform duration-250 ${getNodeColor(d.priority)}`}
              />

              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[13px] font-bold text-txt">
                    {d.title}
                  </span>
                  <span className="text-[9px] font-bold tracking-wider text-primary uppercase px-1.5 py-0.5 bg-primary/10 rounded border border-primary/20 font-display">
                    {d.subject}
                  </span>
                  {d.type && (
                    <span className="text-[10px] font-bold text-muted uppercase font-display">
                      • {d.type}
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-muted flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(d.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>

              {/* Countdown metrics */}
              <div className="flex items-center gap-2 sm:text-right shrink-0">
                <span className="text-[12px] font-bold text-muted font-display uppercase tracking-wider">
                  {d.daysRemaining} {d.daysRemaining === 1 ? "day" : "days"} remaining
                </span>
                <span
                  className={`h-2.5 w-2.5 rounded-full ${d.priority === "High" ? "bg-red-500" : d.priority === "Medium" ? "bg-amber-555 bg-amber-500" : "bg-emerald-500"}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DeadlineTimeline;
