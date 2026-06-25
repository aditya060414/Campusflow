import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Info,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * A highly interactive, premium monthly calendar grid.
 * Refactored to be the ultimate centerpiece: min-height 850px, horizontal scroll on mobile,
 * equal cell heights, single horizontal line header, and premium rounded-xl event chips.
 */
export const CalendarPreview = ({
  deadlines = [],
  studySessions = [],
  onOpenCreateModal,
}) => {
  // 1. Month Navigation State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Handle empty state
  if (deadlines.length === 0) {
    return (
      <div className="p-8 sm:p-12 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-dashed border-zinc-200 dark:border-white/10 rounded-3xl text-center max-w-2xl mx-auto space-y-5 relative z-10 animate-fade-in min-h-[400px] flex flex-col items-center justify-center shadow-lg">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-sky-500/10 dark:bg-sky-500/20 flex items-center justify-center text-sky-500 dark:text-sky-400">
          <CalendarIcon className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white font-heading">
            No deadlines scheduled
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 dark:text-zinc-500 max-w-md mx-auto leading-relaxed">
            Create your first exam, assignment, or project deadline.
            CampusFlow's AI will automatically build a personalized day-by-day
            study roadmap on your calendar!
          </p>
        </div>
        <button
          onClick={onOpenCreateModal}
          className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:opacity-95 shadow-md shadow-sky-500/15 transition-all font-heading"
        >
          Create Deadline
        </button>
      </div>
    );
  }

  // 2. Calendar Mechanics
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const totalDaysInPrevMonth = new Date(year, month, 0).getDate();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Generate Days Array for Grid
  const daysGrid = [];

  // Trailing days from previous month
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, totalDaysInPrevMonth - i);
    daysGrid.push({ date: d, isCurrentMonth: false });
  }

  // Current month days
  for (let i = 1; i <= totalDaysInMonth; i++) {
    const d = new Date(year, month, i);
    daysGrid.push({ date: d, isCurrentMonth: true });
  }

  // Leading days from next month to fill grid
  const remainingCells = 42 - daysGrid.length;
  for (let i = 1; i <= remainingCells; i++) {
    const d = new Date(year, month + 1, i);
    daysGrid.push({ date: d, isCurrentMonth: false });
  }

  const formatDateString = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const d = String(dateObj.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const isToday = (dateObj) => {
    const today = new Date();
    return (
      dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear()
    );
  };

  const getEventsForDate = (dateStr) => {
    const daysDeadlines = deadlines.filter((d) => d.date === dateStr);
    const daysStudy = studySessions.filter((s) => s.date === dateStr);
    return {
      deadlines: daysDeadlines,
      studySessions: daysStudy,
      total: daysDeadlines.length + daysStudy.length,
    };
  };

  // Render Category Event Pill Color
  const getDeadlinePillStyle = (d) => {
    const typeStr = d.type || "Assignment";
    if (typeStr.toLowerCase() === "exam") {
      return "bg-red-500/15 text-red-500 dark:text-red-400 border border-red-500/20";
    } else if (typeStr.toLowerCase() === "project") {
      return "bg-purple-500/15 text-purple-500 dark:text-purple-400 border border-purple-500/20";
    } else {
      return "bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/20";
    }
  };

  const getStudyPillStyle = (s) => {
    const taskText = (s.topic || s.task || "").toLowerCase();
    if (
      taskText.includes("revision") ||
      taskText.includes("review") ||
      taskText.includes("mock") ||
      taskText.includes("test")
    ) {
      return "bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/20";
    }
    return "bg-blue-500/15 text-blue-500 dark:text-blue-400 border border-blue-500/20";
  };

  const getCellHighlight = (events) => {
    if (events.deadlines.length > 0) {
      const hasHigh = events.deadlines.some((d) => d.priority === "High");
      const hasMed = events.deadlines.some((d) => d.priority === "Medium");
      if (hasHigh)
        return "bg-red-500/[0.03] dark:bg-red-500/[0.06] border-red-500/10";
      if (hasMed)
        return "bg-yellow-500/[0.03] dark:bg-yellow-500/[0.06] border-yellow-500/10";
      return "bg-green-500/[0.03] dark:bg-green-500/[0.06] border-green-500/10";
    }
    if (events.studySessions.length > 0) {
      return "bg-blue-500/[0.03] dark:bg-blue-500/[0.06] border-blue-500/10";
    }
    return "";
  };

  return (
    <div className="p-6 bg-panel border border-border rounded-lg space-y-6 relative z-10 w-full min-h-[850px] flex flex-col justify-between animate-fade-in">
      {/* 1. Calendar Header Control Row */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-border pb-5 shrink-0">
        {/* Title (Left) */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-[4px] bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-[16px] sm:text-[18px] font-bold text-txt font-display">
              Academic Calendar
            </h2>
            <p className="text-[12px] text-muted">
              Interactive monthly view tracking deadlines and generated AI studies
            </p>
          </div>
        </div>

        {/* Legend (Middle) */}
        <div className="flex flex-wrap gap-4 items-center text-[10px] font-bold tracking-wider uppercase text-muted font-display">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-[2px] bg-red-500" /> Exam
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-[2px] bg-orange-500" /> Assignment
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-[2px] bg-primary" /> Project
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-[2px] bg-blue-500" /> Study
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-[2px] bg-green-500" /> Revision
          </span>
        </div>

        {/* Month Controls (Right) */}
        <div className="flex items-center gap-2 self-end xl:self-auto shrink-0">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-[4px] border border-border bg-transparent text-muted hover:bg-panel2 hover:text-txt transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handleToday}
            className="px-3.5 py-2 rounded-[4px] border border-border bg-transparent text-txt hover:bg-panel2 transition-colors text-[12px] font-bold font-display"
          >
            Today
          </button>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-[4px] border border-border bg-transparent text-muted hover:bg-panel2 hover:text-txt transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <span className="text-[18px] sm:text-[20px] font-bold font-display text-txt min-w-[160px] text-center pl-2">
            {monthNames[month]} {year}
          </span>
        </div>
      </div>

      {/* 2. Monthly Grid Container */}
      <div className="w-full overflow-x-auto rounded-[4px] border border-border bg-panel2 flex-1 flex flex-col justify-between">
        <div className="min-w-[720px] lg:min-w-0 w-full flex-1 flex flex-col justify-between divide-y divide-border">
          {/* Days of the Week headers */}
          <div className="grid grid-cols-7 text-center py-3 bg-panel text-[10px] font-bold tracking-wider uppercase text-muted border-b border-border shrink-0 font-display">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* 42-cell Grid with equalized responsive heights */}
          <div className="grid grid-cols-7 grid-rows-6 divide-x divide-y divide-border flex-1 bg-border gap-[1px]">
            {daysGrid.map(({ date, isCurrentMonth }, idx) => {
              const dateStr = formatDateString(date);
              const events = getEventsForDate(dateStr);
              const cellToday = isToday(date);

              return (
                <div
                  key={idx}
                  onClick={() =>
                    events.total > 0 &&
                    setSelectedDayEvents({ date: dateStr, ...events })
                  }
                  className={`min-h-[60px] md:min-h-[80px] lg:min-h-[120px] p-2 flex flex-col gap-1.5 transition-colors relative overflow-hidden ${
                    isCurrentMonth
                      ? "bg-panel text-txt"
                      : "bg-panel2 text-muted"
                  } ${getCellHighlight(events)} ${events.total > 0 ? "cursor-pointer hover:bg-panel2" : ""}`}
                >
                  {/* Cell Number Header */}
                  <div className="flex items-center justify-between shrink-0">
                    <span
                      className={`h-6 w-6 rounded-[4px] flex items-center justify-center text-[12px] font-bold font-display ${
                        cellToday
                          ? "bg-primary text-white"
                          : ""
                      }`}
                    >
                      {date.getDate()}
                    </span>
                  </div>

                  {/* Event pills inside cells */}
                  <div className="flex flex-col gap-1 overflow-hidden flex-1 w-full">
                    {/* Render deadlines */}
                    {events.deadlines.slice(0, 2).map((d) => (
                      <div
                        key={d.id}
                        className={`rounded-[2px] px-1.5 py-0.5 text-[10px] truncate font-bold border leading-tight ${getDeadlinePillStyle(d)}`}
                      >
                        {d.title}
                      </div>
                    ))}

                    {/* Render study sessions if slot remains */}
                    {events.deadlines.length < 2 &&
                      events.studySessions
                        .slice(0, 2 - events.deadlines.length)
                        .map((s, sIdx) => (
                          <div
                            key={sIdx}
                            className={`rounded-[2px] px-1.5 py-0.5 text-[10px] truncate font-bold border leading-tight ${getStudyPillStyle(s)}`}
                          >
                            {s.duration
                              ? `${s.duration.match(/\d+/)?.[0] || "2"}h `
                              : ""}
                            {s.topic || s.task}
                          </div>
                        ))}

                    {/* Overflow count pill */}
                    {events.total > 2 && (
                      <div className="rounded-[2px] px-1.5 py-0.5 text-[10px] font-bold bg-panel2 text-muted border border-border text-center leading-tight">
                        +{events.total - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Details popover / bottom sheet for clicked date (AnimatePresence) */}
      <AnimatePresence>
        {selectedDayEvents && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDayEvents(null)}
              className="fixed inset-0 bg-black/60"
            />

            {/* Content box */}
            <div
              className="bg-panel border border-border w-full max-w-md rounded-lg relative overflow-hidden z-10 p-5 space-y-4 font-body"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-[10px] font-bold tracking-widest text-muted uppercase font-display">
                  Schedule Details
                </span>
                <span className="text-[14px] font-bold text-txt font-display">
                  {new Date(selectedDayEvents.date).toLocaleDateString(
                    "en-US",
                    {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    },
                  )}
                </span>
                <button
                  onClick={() => setSelectedDayEvents(null)}
                  className="p-1 rounded hover:bg-panel2 text-muted hover:text-txt transition-colors border border-transparent hover:border-border"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Event list */}
              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                {/* Deadlines Section */}
                {selectedDayEvents.deadlines.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-widest block font-display">
                      Academic Submissions
                    </span>
                    {selectedDayEvents.deadlines.map((d) => (
                      <div
                        key={d.id}
                        className={`p-3 rounded-[4px] flex items-center justify-between border ${getDeadlinePillStyle(d)}`}
                      >
                        <div className="space-y-0.5 truncate max-w-[70%]">
                          <h4 className="text-[13px] font-bold truncate">
                            {d.title}
                          </h4>
                          <span className="text-[10px] font-bold text-muted uppercase font-display">
                            {d.subject}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold uppercase shrink-0 font-display">
                          {d.type || "Assignment"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Study Sessions Section */}
                {selectedDayEvents.studySessions.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-widest block font-display">
                      AI Study Sessions
                    </span>
                    {selectedDayEvents.studySessions.map((s, sIdx) => (
                      <div
                        key={sIdx}
                        className={`p-3 rounded-[4px] flex items-center justify-between border ${getStudyPillStyle(s)}`}
                      >
                        <div className="space-y-0.5 truncate max-w-[70%]">
                          <h4 className="text-[13px] font-bold truncate">
                            {s.topic || s.task}
                          </h4>
                          <span className="text-[10px] font-bold text-muted uppercase font-display">
                            Preparation Session
                          </span>
                        </div>
                        <span className="text-[10px] font-bold shrink-0 font-display">
                          {s.duration || "2 hours"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarPreview;
