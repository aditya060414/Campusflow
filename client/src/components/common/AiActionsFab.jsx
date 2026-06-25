import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Copy, CheckSquare, FileSearch, MessageSquare, X } from "lucide-react";

export const AiActionsFab = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const actions = [
    {
      name: "Generate Flashcards",
      icon: Copy,
      color: "from-amber-500 to-orange-600",
      onClick: () => {
        navigate("/dashboard/study-buddy?tab=flashcards");
        setIsOpen(false);
      },
    },
    {
      name: "Generate Quiz",
      icon: CheckSquare,
      color: "from-emerald-500 to-teal-600",
      onClick: () => {
        navigate("/dashboard/study-buddy?tab=quiz");
        setIsOpen(false);
      },
    },
    {
      name: "Analyze Notice",
      icon: FileSearch,
      color: "from-blue-500 to-indigo-600",
      onClick: () => {
        navigate("/dashboard/notice-analyzer");
        setIsOpen(false);
      },
    },
    {
      name: "Go to Study Buddy",
      icon: MessageSquare,
      color: "from-purple-500 to-pink-600",
      onClick: () => {
        navigate("/dashboard/study-buddy?tab=ask");
        setIsOpen(false);
      },
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={menuRef}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 mb-2 w-64 rounded-2xl overflow-hidden shadow-2xl glass-panel p-3 border border-zinc-200/30 dark:border-zinc-800/40"
          >
            <div className="px-3 py-2 border-b border-zinc-200/50 dark:border-zinc-800/50 mb-2">
              <h3 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 tracking-wider uppercase flex items-center gap-1.5 font-heading">
                <Sparkles className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
                AI Actions
              </h3>
            </div>
            <div className="space-y-1">
              {actions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={idx}
                    whileHover={{ x: 4, backgroundColor: "rgba(14,165,233,0.08)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={action.onClick}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium text-zinc-700 hover:text-sky-600 dark:text-zinc-300 dark:hover:text-sky-400 transition-colors"
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${action.color} text-white shadow-md`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{action.name}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(14, 165, 233, 0.4)" }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-sky-500/20 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all z-50 group"
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        )}
        <span className="font-heading tracking-wide">
          {isOpen ? "Close" : "AI Actions"}
        </span>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-200 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-300"></span>
        </span>
      </motion.button>
    </div>
  );
};

export default AiActionsFab;
