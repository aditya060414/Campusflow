import React from "react";
import { motion } from "framer-motion";
import DeadlineCard from "./DeadlineCard";

/**
 * Renders a list of sorted deadline cards within a responsive grid.
 * Applies a smooth stagger entrance animation using Framer Motion.
 */
export const UpcomingDeadlineList = ({
  deadlines = [],
  selectedDeadlineId,
  onSelect,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  // Stagger entry animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: "easeOut" } },
  };

  // Sort: Incomplete first, then by days remaining (closest deadlines first)
  const sortedDeadlines = [...deadlines].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return a.daysRemaining - b.daysRemaining;
  });

  return (
    <div className="space-y-4 relative z-10 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] sm:text-[24px] font-bold text-txt font-display">
          Upcoming Milestones
        </h2>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-border bg-panel2 text-muted uppercase tracking-wider font-display">
          {deadlines.filter((d) => !d.completed).length} active
        </span>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 xl:grid-cols-2 gap-4"
      >
        {sortedDeadlines.map((deadline) => (
          <motion.div
            key={deadline.id}
            variants={itemVariants}
            layoutId={`card-container-${deadline.id}`}
          >
            <DeadlineCard
              deadline={deadline}
              isSelected={deadline.id === selectedDeadlineId}
              onSelect={onSelect}
              onToggleComplete={onToggleComplete}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default UpcomingDeadlineList;
