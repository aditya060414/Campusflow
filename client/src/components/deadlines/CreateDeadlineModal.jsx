import React, { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

/**
 * A sleek, glassmorphic modal form that handles both creating new deadlines 
 * and updating existing milestones. Integrates custom Framer Motion transitions.
 */
export const CreateDeadlineModal = ({ isOpen, onClose, onCreate, editingDeadline }) => {
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    description: "",
    date: "",
    priority: "Medium",
    hoursPerDay: 2.0,
    reminderTime: "09:00",
    type: "Assignment"
  });

  useEffect(() => {
    if (editingDeadline) {
      setFormData({
        title: editingDeadline.title || "",
        subject: editingDeadline.subject || "",
        description: editingDeadline.description || "",
        date: editingDeadline.date || "",
        priority: editingDeadline.priority || "Medium",
        hoursPerDay: editingDeadline.hoursPerDay || 2.0,
        reminderTime: editingDeadline.reminderTime || "09:00",
        type: editingDeadline.type || "Assignment"
      });
    }
  }, [editingDeadline]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "hoursPerDay" ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.subject.trim() || !formData.date) {
      return;
    }

    onCreate(formData);
    onClose();
  };

  // Escape key overlay close listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop blur overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm"
      />

      {/* Modal Container Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-white dark:bg-zinc-950 border border-zinc-200/40 dark:border-zinc-800/60 w-full max-w-lg rounded-3xl shadow-2xl relative overflow-hidden z-10 p-6 sm:p-8 space-y-6 bg-gradient-to-br from-white via-zinc-50/50 to-indigo-50/5 dark:from-zinc-950 dark:via-zinc-900/30 dark:to-indigo-950/5 animate-fade-in"
      >
        {/* Glow corner detail */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-transparent blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-indigo-500 dark:text-indigo-400 font-bold text-[10px] uppercase tracking-wider font-heading">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              Academic Manager
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white font-heading">
              {editingDeadline ? "Edit Academic Deadline" : "Create Academic Deadline"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 dark:text-zinc-550 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form body */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-555 uppercase font-heading tracking-wider">
              Deadline Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Implement CPU Scheduler"
              required
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-sky-500/80 dark:focus:border-sky-500/80 transition-colors text-xs"
            />
          </div>

          {/* Subject & Category Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Subject */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-555 uppercase font-heading tracking-wider">
                Subject Name
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="e.g. OPERATING SYSTEMS"
                required
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-sky-500/80 dark:focus:border-sky-500/80 transition-colors text-xs"
              />
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-555 uppercase font-heading tracking-wider">
                Deadline Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 text-zinc-900 dark:text-white focus:outline-none focus:border-sky-500/80 dark:focus:border-sky-500/80 transition-colors text-xs cursor-pointer"
              >
                <option value="Assignment">Assignment</option>
                <option value="Exam">Exam</option>
                <option value="Project">Project</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-555 uppercase font-heading tracking-wider">
              Syllabus / Details (For AI topic extraction)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              placeholder="List key subtopics e.g. normal forms, index structures, transactions..."
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-sky-500/80 dark:focus:border-sky-500/80 transition-colors text-xs resize-none leading-relaxed"
            />
          </div>

          {/* Target Date & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Target Date */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-555 uppercase font-heading tracking-wider">
                Target Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 text-zinc-900 dark:text-white focus:outline-none focus:border-sky-500/80 dark:focus:border-sky-500/80 transition-colors text-xs cursor-pointer"
              />
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-555 uppercase font-heading tracking-wider">
                Priority Level
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 text-zinc-900 dark:text-white focus:outline-none focus:border-sky-500/80 dark:focus:border-sky-500/80 transition-colors text-xs cursor-pointer"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Daily Study Hours & Daily Reminder Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Daily Hours */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-555 uppercase font-heading tracking-wider">
                Study Hours / Day
              </label>
              <input
                type="number"
                name="hoursPerDay"
                value={formData.hoursPerDay}
                onChange={handleChange}
                min="0.5"
                max="12"
                step="0.5"
                required
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 text-zinc-900 dark:text-white focus:outline-none focus:border-sky-500/80 dark:focus:border-sky-500/80 transition-colors text-xs"
              />
            </div>

            {/* Daily Reminder Time */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-555 uppercase font-heading tracking-wider">
                Daily Reminder
              </label>
              <input
                type="time"
                name="reminderTime"
                value={formData.reminderTime}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 text-zinc-900 dark:text-white focus:outline-none focus:border-sky-500/80 dark:focus:border-sky-500/80 transition-colors text-xs cursor-pointer"
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            className="w-full py-3.5 mt-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-95 shadow-md shadow-indigo-500/15 transition-all font-heading"
          >
            {editingDeadline ? "Save Changes" : "Add Deadline"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateDeadlineModal;
