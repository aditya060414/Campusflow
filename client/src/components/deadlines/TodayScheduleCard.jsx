import React from "react";
import { Sparkles, BookOpen, Brain, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Renders Today's AI Schedule card showing study slots, times, and total study duration.
 * Connects the Deadline Manager's generated sessions to a daily planner view.
 */
export const TodayScheduleCard = () => {
  const scheduleItems = [
    {
      time: "09:00",
      task: "Deadlock Concepts",
      icon: BookOpen,
      duration: "1 Hour",
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      time: "11:00",
      task: "Resource Allocation",
      icon: Brain,
      duration: "1 Hour",
      color: "text-indigo-500 bg-indigo-500/10",
    },
    {
      time: "04:00",
      task: "Revision Session",
      icon: Sparkles,
      duration: "1 Hour",
      color: "text-green-500 bg-green-500/10",
    },
  ];

  return (
    <div className="w-full bg-panel border border-border rounded-lg p-6 relative overflow-hidden animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        {/* Left Side: Header & Subtitle */}
        <div className="space-y-1.5 max-w-sm shrink-0">
          <div className="flex items-center gap-2 text-primary font-bold text-[12px] uppercase tracking-wider font-display">
            <Sparkles className="w-3.5 h-3.5 stroke-[1.75]" />
            Academic Coach
          </div>
          <h3 className="text-[16px] sm:text-[18px] font-bold text-txt font-display">
            Today's AI Schedule
          </h3>
          <p className="text-[14px] text-muted leading-relaxed font-body">
            Optimized study blocks generated from your vector notes and upcoming milestones.
          </p>
        </div>

        {/* Middle: Grid of Time Slots */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {scheduleItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-3 bg-panel2 border border-border rounded-[4px] flex items-center gap-3"
              >
                <div
                  className="h-8 w-8 rounded-[4px] flex items-center justify-center shrink-0 bg-primary/10 text-primary border border-primary/20"
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-bold text-primary block uppercase tracking-wider font-display">
                    {item.time} ({item.duration})
                  </span>
                  <span className="text-[13px] font-bold text-txt block truncate font-body">
                    {item.task}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Total Study Progress Card */}
        <div className="p-4 bg-panel2 border border-border rounded-[4px] shrink-0 w-full lg:w-[220px] space-y-2.5 flex flex-col justify-center">
          <div className="flex items-center justify-between text-[12px] font-bold text-txt font-display">
            <span>Total Study Time</span>
            <span className="text-primary font-black">
              3 Hours
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="w-full bg-border h-1.5 rounded-[2px] overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: "100%" }}
              />
            </div>
            <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 font-display uppercase tracking-wider">
              <CheckCircle className="w-3 h-3" /> All sessions scheduled
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayScheduleCard;
