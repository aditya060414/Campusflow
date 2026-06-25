import React from "react";
import { Edit2, Trash2, CheckCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

/**
 * A beautiful, glassmorphic card representing a single deadline.
 * Refactored to enforce a strict min-height of 240px and lock the progress/actions to the bottom.
 */
export const DeadlineCard = ({
  deadline,
  isSelected,
  onSelect,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const {
    id,
    title,
    subject,
    description,
    priority,
    daysRemaining,
    progress,
    type,
  } = deadline;

  // Calculate Health Status
  const getHealthStatus = () => {
    if (progress === 100) {
      return {
        text: "Completed",
        color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      };
    }
    if (daysRemaining < 0) {
      return {
        text: "Overdue",
        color: "text-red-500 bg-red-500/10 border-red-500/20",
      };
    }
    if (daysRemaining <= 2 && progress < 40) {
      return {
        text: "At Risk",
        color: "text-red-500 bg-red-500/10 border-red-500/20",
      };
    }
    if (daysRemaining <= 5 && progress < 20) {
      return {
        text: "At Risk",
        color: "text-red-500 bg-red-500/10 border-red-500/20",
      };
    }
    if (daysRemaining <= 5 && progress < 50) {
      return {
        text: "Falling Behind",
        color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      };
    }
    return {
      text: "On Track",
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    };
  };

  const health = getHealthStatus();

  // Category Colors
  const getTypeBadge = () => {
    const typeStr = type || "Assignment";
    if (typeStr.toLowerCase() === "exam") {
      return "text-red-500 bg-red-500/10 border-red-500/20";
    } else if (typeStr.toLowerCase() === "project") {
      return "text-primary bg-primary/10 border-primary/20";
    } else {
      return "text-orange-500 bg-orange-500/10 border-orange-500/20";
    }
  };

  // Priority Colors
  const getPriorityColor = () => {
    if (priority === "High")
      return "text-red-500 bg-red-500/10 border-red-500/20";
    if (priority === "Medium")
      return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
  };

  return (
    <div
      onClick={() => onSelect(id)}
      className={`p-6 rounded-lg border transition-colors duration-150 cursor-pointer relative flex flex-col justify-between min-h-[250px] ${
        isSelected
          ? "border-primary bg-panel"
          : "bg-panel border-border hover:border-muted/55"
      }`}
    >
      {/* Top Section (Header + Description) */}
      <div className="space-y-3 w-full">
        {/* 1. Header: Subject, Title & Badges */}
        <div className="space-y-1.5 w-full">
          <div className="space-y-0.5 w-full">
            <span className="text-[10px] font-bold tracking-widest text-muted uppercase block font-display">
              {subject}
            </span>
            <h3 className="text-[16px] sm:text-[18px] font-bold text-txt font-display transition-colors truncate w-full">
              {title}
            </h3>
          </div>

          {/* Dedicated Category & Health Badges Container */}
          <div className="flex flex-wrap gap-[6px] w-full items-center">
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider max-w-fit whitespace-nowrap ${getTypeBadge()}`}
            >
              {type || "Assignment"}
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider max-w-fit whitespace-nowrap ${health.color}`}
            >
              {health.text}
            </span>
          </div>
        </div>

        {/* 2. Clamped Description */}
        <p className="text-[14px] text-muted line-clamp-2 leading-relaxed font-body">
          {description || "No syllabus or details provided."}
        </p>
      </div>

      {/* Bottom Section (Progress Bar + Actions) */}
      <div className="space-y-3 mt-4 w-full">
        {/* 3. Progress Bar */}
        <div className="space-y-1 w-full">
          <div className="flex items-center justify-between text-[11px] font-bold text-muted font-display">
            <span>Roadmap progress</span>
            <span className="text-primary">{progress}%</span>
          </div>
          <div className="w-full bg-border h-1.5 rounded-[2px] overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 4. Footer Metrics & Actions */}
        <div className="flex items-center justify-between border-t border-border pt-3 text-[12px] text-muted flex-nowrap w-full">
          <div className="flex items-center gap-2.5 shrink-0">
            <span
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded border ${getPriorityColor()} font-bold text-[9px] uppercase tracking-wider font-display`}
            >
              {priority}
            </span>

            <span className="flex items-center gap-1 font-bold text-[11px] uppercase tracking-wider font-display">
              <Clock className="w-3.5 h-3.5" />
              {daysRemaining >= 0 ? `${daysRemaining} days left` : "Overdue"}
            </span>
          </div>

          {/* Action Buttons */}
          <div
            className="flex items-center gap-1 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onToggleComplete(id)}
              title={deadline.completed ? "Mark Incomplete" : "Mark Complete"}
              className="p-1.5 rounded hover:bg-panel2 text-muted hover:text-emerald-500 transition-colors border border-transparent hover:border-border"
            >
              <CheckCircle
                className={`w-3.5 h-3.5 ${deadline.completed ? "text-emerald-500" : ""}`}
              />
            </button>

            <button
              onClick={() => onEdit(deadline)}
              title="Edit Deadline"
              className="p-1.5 rounded hover:bg-panel2 text-muted hover:text-primary transition-colors border border-transparent hover:border-border"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onDelete(id)}
              title="Delete Deadline"
              className="p-1.5 rounded hover:bg-panel2 text-muted hover:text-red-500 transition-colors border border-transparent hover:border-border"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeadlineCard;
