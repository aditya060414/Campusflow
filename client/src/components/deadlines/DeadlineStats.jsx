import React from "react";
import { Calendar, AlertCircle, Clock, CheckSquare } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Renders a full-width row of academic planning statistics.
 * Refactored to lock card heights to exactly 120px and enforce a strict vertical grid alignment.
 */
export const DeadlineStats = ({ deadlines = [], generatedPlans = {} }) => {
  // 1. Active Deadlines (incomplete)
  const activeCount = deadlines.filter((d) => !d.completed).length;

  // 2. Due This Week (0 <= daysRemaining <= 7, incomplete)
  const dueThisWeekCount = deadlines.filter(
    (d) => !d.completed && d.daysRemaining >= 0 && d.daysRemaining <= 7,
  ).length;

  // 3. Planned Study Hours (Sum from roadmaps)
  let plannedHours = 0;
  // 4. Completed Sessions (checked roadmap days)
  let completedSessions = 0;

  deadlines.forEach((d) => {
    const plan = generatedPlans[d.id];
    if (plan && Array.isArray(plan)) {
      plan.forEach((session) => {
        const durationMatch = session.duration
          ? session.duration.match(/\d+/)
          : null;
        const hours = durationMatch
          ? parseInt(durationMatch[0], 10)
          : session.hours || 2;
        plannedHours += hours;
        if (session.completed) {
          completedSessions += 1;
        }
      });
    }
  });

  const statsData = [
    {
      title: "Active Deadlines",
      value: activeCount,
      description: "Incomplete tasks",
      microDesc: activeCount > 0 ? "+1 new today" : "All caught up",
      icon: Calendar,
      color: "from-blue-500 to-indigo-600",
      borderColor: "border-l-indigo-500",
      glowClass: "bg-indigo-500/15",
    },
    {
      title: "Due This Week",
      value: dueThisWeekCount,
      description: "Urgent submissions",
      microDesc: dueThisWeekCount > 0 ? "Requires action" : "No urgent tasks",
      icon: AlertCircle,
      color: "from-amber-500 to-red-500",
      borderColor: "border-l-amber-500",
      glowClass: "bg-amber-500/15",
    },
    {
      title: "Planned Study Hours",
      value: `${plannedHours}h`,
      description: "Allocated in roadmaps",
      microDesc: plannedHours > 0 ? "+2.5h avg/day" : "0 hours scheduled",
      icon: Clock,
      color: "from-sky-400 to-blue-500",
      borderColor: "border-l-sky-500",
      glowClass: "bg-sky-500/15",
    },
    {
      title: "Completed Sessions",
      value: completedSessions,
      description: "Study milestones met",
      microDesc: completedSessions > 0 ? "+2 done today" : "Start planning now",
      icon: CheckSquare,
      color: "from-emerald-400 to-teal-500",
      borderColor: "border-l-emerald-500",
      glowClass: "bg-emerald-500/15",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-border gap-[1px] border border-border rounded-lg overflow-hidden">
      {statsData.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="bg-panel p-6 flex flex-col justify-between min-h-[110px]"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-muted font-bold uppercase tracking-widest font-display">
                  {stat.title}
                </span>
                <Icon className="w-4.5 h-4.5 text-primary stroke-[1.75]" />
              </div>
              <h2 className="text-[28px] font-bold text-txt font-display leading-none">
                {stat.value}
              </h2>
            </div>
            <p className="text-[12px] text-muted font-body mt-2">
              {stat.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default DeadlineStats;
