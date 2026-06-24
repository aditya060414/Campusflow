import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Copy,
  CheckCircle,
  GraduationCap,
  ClipboardList,
  Clock,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

/**
 * Dashboard page showing quick metrics (dynamically updated
 * from localStorage) and navigation shortcuts to key features.
 */
export const Dashboard = () => {
  const { student } = useAuth();
  const navigate = useNavigate();

  // Metrics states
  const [metrics, setMetrics] = useState({
    notesCount: 0,
    flashcardsCount: 0,
    quizzesCount: 0,
  });

  // Load metrics dynamically from localStorage on mount
  useEffect(() => {
    const notesCount = parseInt(localStorage.getItem("cf_notes_count") || "0", 10);
    const flashcardsCount = parseInt(localStorage.getItem("cf_flashcards_count") || "0", 10);
    const quizzesCount = parseInt(localStorage.getItem("cf_quizzes_count") || "0", 10);
    
    setMetrics({
      notesCount,
      flashcardsCount,
      quizzesCount,
    });
  }, []);

  // Quick stats definitions
  const stats = [
    {
      label: "Notes Uploaded",
      value: metrics.notesCount,
      description: "Lecture notes split and vectorized",
      icon: FileText,
      color: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border-blue-100 dark:border-blue-900/50",
    },
    {
      label: "Flashcards Generated",
      value: metrics.flashcardsCount,
      description: "Study flashcards created by AI",
      icon: Copy,
      color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50",
    },
    {
      label: "Quizzes Completed",
      value: metrics.quizzesCount,
      description: "Mock MCQ tests finished",
      icon: CheckCircle,
      color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50",
    },
  ];

  // Feature cards definitions
  const tools = [
    {
      name: "AI Study Buddy",
      description: "Upload lecture notes, ask questions, generate flashcards, and run mock quizzes from your notes.",
      icon: GraduationCap,
      path: "/dashboard/study-buddy",
      color: "border-sky-200 hover:border-sky-400 dark:border-slate-800 dark:hover:border-sky-500/50",
      iconBg: "bg-sky-50 text-sky-600 dark:bg-sky-950/55 dark:text-sky-400",
    },
    {
      name: "Notice Analyzer",
      description: "Paste complex university notices to instantly extract summaries, deadlines, tasks, and priority levels.",
      icon: ClipboardList,
      path: "/dashboard/notice-analyzer",
      color: "border-violet-200 hover:border-violet-400 dark:border-slate-800 dark:hover:border-violet-500/50",
      iconBg: "bg-violet-50 text-violet-600 dark:bg-violet-950/55 dark:text-violet-400",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 bg-gradient-to-r from-primary-50 to-sky-50/20 dark:from-slate-950 dark:to-slate-900/10 rounded-2xl border border-gray-250 dark:border-slate-800 transition-colors duration-300">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Welcome back, {student?.name || "Student"}!
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-slate-400 mt-1">
            Here is a quick overview of your academic preparation stats for today.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-gray-600 dark:text-slate-300 shadow-sm">
          <Clock className="h-4 w-4 text-primary dark:text-primary-400" />
          <span>Active Session ID: <span className="font-semibold">{student?.student_id}</span></span>
        </div>
      </div>

      {/* 2. Quick Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="p-6 bg-white dark:bg-slate-950 border border-gray-250 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl border ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>+100%</span>
                </div>
              </div>
              
              <div className="mt-4">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {stat.value}
                </span>
                <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 mt-1">
                  {stat.label}
                </h3>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">
                  {stat.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Primary Feature Portals */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white px-1">
          Study Buddy Toolbox
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.name}
                onClick={() => navigate(tool.path)}
                className={`p-6 bg-white dark:bg-slate-950 border rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 group ${tool.color}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-4 rounded-xl ${tool.iconBg} transition-all duration-300 group-hover:scale-110`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary-400 transition-colors duration-200">
                        {tool.name}
                      </h3>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary dark:group-hover:text-primary-400 transition-all duration-250 group-hover:translate-x-1" />
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Tips / Hackathon Demo Note Card */}
      <div className="p-6 bg-blue-50/50 dark:bg-slate-950 border border-blue-200 dark:border-slate-800 rounded-2xl">
        <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-400 flex items-center gap-2">
          💡 Demo Fast-Track Tip
        </h3>
        <p className="text-xs sm:text-sm text-blue-700 dark:text-slate-400 mt-2 leading-relaxed">
          Navigate to the **Study Buddy** tab on the left. Ingest some notes for a subject (e.g. subject: **OS**), then use the **Ask AI**, **Flashcards**, and **Quiz** tabs to immediately generate assets dynamically from those notes!
        </p>
      </div>

    </div>
  );
};

export default Dashboard;
