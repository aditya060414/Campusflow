import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  Upload,
  BookOpen,
  Activity,
  Brain,
  Database,
  Cpu,
  Clock,
  ArrowRight,
  TrendingUp,
  Flame,
  LineChart,
  Calendar,
  CheckSquare,
  Settings
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

/**
 * CampusFlow Dashboard / AI Command Center page.
 * Implements a premium, Linear-inspired brutalist layout where all sections
 * are visually connected in a single cohesive panel using thin 1px borders.
 */
export const Dashboard = () => {
  const { student } = useAuth();
  const navigate = useNavigate();

  // Metrics states
  const [metrics, setMetrics] = useState({
    notesCount: 0,
    flashcardsCount: 0,
    quizzesCount: 0,
    activeDeadlines: 0,
    plannedStudyHours: 0,
    upcomingExams: 0,
    completedSessions: 0,
    nextDeadline: null
  });

  // Load metrics dynamically from localStorage on mount
  useEffect(() => {
    const notesCount = parseInt(localStorage.getItem("cf_notes_count") || "0", 10);
    const flashcardsCount = parseInt(localStorage.getItem("cf_flashcards_count") || "0", 10);
    const quizzesCount = parseInt(localStorage.getItem("cf_quizzes_count") || "0", 10);
    
    // Load deadline metrics dynamically
    const savedDeadlines = localStorage.getItem("cf_deadlines_v2");
    const deadlines = savedDeadlines ? JSON.parse(savedDeadlines) : [];
    
    const activeDeadlines = deadlines.filter((d) => !d.completed).length;
    
    // Upcoming Exams count (either of type 'Exam', or has 'exam' in title/subject, or priority 'High' and incomplete)
    const upcomingExams = deadlines.filter((d) => 
      !d.completed && 
      (d.priority === "High" || 
       (d.type && d.type.toLowerCase() === "exam") || 
       d.title.toLowerCase().includes("exam") || 
       d.subject.toLowerCase().includes("exam"))
    ).length;
    
    let plannedStudyHours = 0;
    let completedSessions = 0;
    
    deadlines.forEach((d) => {
      const planSaved = localStorage.getItem(`plan_v2_${d.id}`);
      if (planSaved) {
        const planData = JSON.parse(planSaved);
        const sessions = Array.isArray(planData)
          ? planData
          : (planData && planData.studyPlan ? planData.studyPlan : []);

        sessions.forEach((session) => {
          // Parse duration (e.g. "2 hours" or "1 hour" or number)
          const durationMatch = session.duration ? session.duration.match(/\d+/) : null;
          const hours = durationMatch ? parseInt(durationMatch[0], 10) : (session.hours || 2);
          plannedStudyHours += hours;
          if (session.completed) {
            completedSessions += 1;
          }
        });
      }
    });
    
    // Find next upcoming deadline (incomplete, days remaining >= 0, sorted by days remaining)
    const activeList = deadlines
      .filter((d) => !d.completed && d.daysRemaining >= 0)
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
    const nextDeadline = activeList.length > 0 ? activeList[0] : null;
    
    setMetrics({
      notesCount,
      flashcardsCount,
      quizzesCount,
      activeDeadlines,
      plannedStudyHours,
      upcomingExams,
      completedSessions,
      nextDeadline
    });
  }, []);

  return (
    <div className="bg-panel border border-border rounded-lg overflow-hidden font-body transition-colors duration-150">
      
      {/* 1. Hero Section (Brutalist panel header) */}
      <div className="border-b border-border p-6 sm:p-8 bg-panel">
        <h1 className="font-display text-[28px] sm:text-[38px] lg:text-[48px] font-bold text-txt tracking-tight leading-tight">
          CampusFlow AI Command Center
        </h1>
        <p className="text-[14px] sm:text-[15px] text-muted mt-2 max-w-2xl font-body leading-relaxed">
          Your academic co-pilot for notes, deadlines, quizzes, notices and learning. Access RAG search and automated roadmap generation.
        </p>
        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={() => navigate("/dashboard/study-buddy?tab=notes")}
            className="bg-primary text-white border border-primary rounded-[4px] px-5 py-2.5 text-[14px] font-bold hover:bg-[#1D4ED8] transition-colors duration-150"
          >
            Upload Notes
          </button>
          <button
            onClick={() => navigate("/dashboard/study-buddy?tab=ask")}
            className="bg-transparent text-primary border border-primary/45 rounded-[4px] px-5 py-2.5 text-[14px] font-bold hover:bg-primary/10 transition-colors duration-150"
          >
            Start Studying
          </button>
        </div>
      </div>

      {/* 2. Statistics Grid (Thin 1px shared borders via gap background trick) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-border gap-[1px] border-b border-border">
        <div className="bg-panel px-6 py-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1 font-display">Notes Indexed</p>
          <p className="font-display text-[28px] font-bold text-txt">{metrics.notesCount}</p>
        </div>
        <div className="bg-panel px-6 py-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1 font-display">Flashcards</p>
          <p className="font-display text-[28px] font-bold text-txt">{metrics.flashcardsCount}</p>
        </div>
        <div className="bg-panel px-6 py-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1 font-display">Quizzes</p>
          <p className="font-display text-[28px] font-bold text-txt">{metrics.quizzesCount}</p>
        </div>
        <div className="bg-panel px-6 py-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1 font-display">Active Targets</p>
          <p className="font-display text-[28px] font-bold text-txt">{metrics.activeDeadlines}</p>
        </div>
      </div>

      {/* 3. Telemetry Status Ribbon */}
      <div className="bg-panel2 px-6 py-3 flex items-center gap-4.5 flex-wrap text-[12px] border-b border-border text-muted">
        <div className="flex items-center gap-2 shrink-0">
          <span className="h-2 w-2 rounded-full bg-success"></span>
          <span>RAG Matrix: <span className="font-semibold text-txt">Active</span></span>
        </div>
        <span className="hidden sm:inline text-border/60">|</span>
        <div className="flex items-center gap-2">
          <span>Notes Ingested: <span className="font-semibold text-primary">{metrics.notesCount}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <span>Flashcards: <span className="font-semibold text-primary">{metrics.flashcardsCount}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <span>Quizzes: <span className="font-semibold text-primary">{metrics.quizzesCount}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <span>Planned Study: <span className="font-semibold text-txt">{metrics.plannedStudyHours}h</span></span>
        </div>
        <div className="flex items-center gap-2">
          <span>Upcoming Exams: <span className="font-semibold text-danger">{metrics.upcomingExams}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <span>Completed Sessions: <span className="font-semibold text-success">{metrics.completedSessions}</span></span>
        </div>
      </div>

      {/* 4. Information Cards Grid (Snaps to 12-column grid, shared borders) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 bg-border gap-[1px] border-b border-border">
        
        {/* Card A: AI Status */}
        <div className="bg-panel p-6 lg:col-span-4 flex flex-col justify-between min-h-[190px]">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-bold text-txt font-display uppercase tracking-wider">AI Status</h3>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-success/10 text-success text-[10px] font-bold border border-success/20 font-display">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success"></span>
                </span>
                <span>Online</span>
              </div>
            </div>
            <p className="font-display text-[32px] font-bold text-txt mt-4">
              {124 + metrics.notesCount}
            </p>
            <p className="text-[12px] text-muted mt-1 font-body">Notes Indexed & Parsed</p>
          </div>
          <div className="pt-4 border-t border-border mt-6 flex justify-between text-[12px] text-muted font-body shrink-0">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 stroke-[1.75]" /> Model: Llama-3.1
            </span>
            <span>Health: 99.9%</span>
          </div>
        </div>

        {/* Card B: Next Target Focus */}
        <div 
          onClick={() => navigate("/dashboard/deadlines")} 
          className="bg-panel p-6 lg:col-span-4 flex flex-col justify-between min-h-[190px] cursor-pointer hover:bg-panel2 transition-colors duration-150 group"
        >
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-bold text-txt font-display uppercase tracking-wider">
                {metrics.nextDeadline ? "Next Target Focus" : "Today's Focus"}
              </h3>
              <Database className="w-4.5 h-4.5 text-primary stroke-[1.75]" />
            </div>
            {metrics.nextDeadline ? (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[15px] font-bold text-txt block truncate max-w-[70%] font-display">
                    {metrics.nextDeadline.title}
                  </span>
                  <span className={`px-2 py-0.5 rounded-[4px] text-[9px] font-bold tracking-wider uppercase shrink-0 ${
                    metrics.nextDeadline.priority === "High" 
                      ? "bg-danger/10 text-danger border border-danger/20" 
                      : metrics.nextDeadline.priority === "Medium"
                      ? "bg-warning/10 text-warning border border-warning/20"
                      : "bg-success/10 text-success border border-success/20"
                  }`}>
                    {metrics.nextDeadline.priority}
                  </span>
                </div>
                <p className="text-[12px] text-muted block truncate font-body">
                  {metrics.nextDeadline.subject} • {metrics.nextDeadline.daysRemaining} days left
                </p>
                {/* Progress bar */}
                <div className="space-y-1.5 mt-3">
                  <div className="flex justify-between text-[11px] font-bold font-display">
                    <span className="text-muted">Milestone Progress</span>
                    <span className="text-primary">{metrics.nextDeadline.progress}%</span>
                  </div>
                  <div className="w-full bg-border h-1.5 rounded-[2px] overflow-hidden">
                    <div className="bg-primary h-full transition-all duration-150" style={{ width: `${metrics.nextDeadline.progress}%` }}></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-1">
                <span className="text-[15px] font-bold text-txt block font-display">
                  No Active Deadlines
                </span>
                <span className="text-[12px] text-muted block font-body">
                  Create a deadline to build your study roadmap.
                </span>
              </div>
            )}
          </div>
          <div className="pt-4 border-t border-border mt-6 flex justify-between items-center text-[12px] text-muted font-body shrink-0">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 stroke-[1.75]" /> Tracking Enabled
            </span>
            <span className="text-primary group-hover:underline flex items-center gap-0.5 font-semibold">
              Open Manager <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Card C: AI Tip of the Day */}
        <div className="bg-panel p-6 lg:col-span-4 sm:col-span-2 lg:col-span-4 flex flex-col justify-between min-h-[190px]">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-bold text-warning font-display flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-4.5 h-4.5 text-warning stroke-[1.75]" />
                AI Mentor Tip
              </h3>
              <Flame className="w-4.5 h-4.5 text-warning animate-pulse stroke-[1.75]" />
            </div>
            <p className="text-[14px] text-txt font-medium italic leading-relaxed mt-4 font-body">
              "Review Deadlock Prevention today. Estimated revision time: 20 minutes."
            </p>
          </div>
          <div className="pt-4 border-t border-border mt-6 flex items-center justify-between text-[12px] text-muted font-body shrink-0">
            <span>Coaching Priority: High</span>
            <span className="text-warning font-bold uppercase tracking-wider text-[10px]">OS Personalized</span>
          </div>
        </div>

      </div>

      {/* 5. Quick Actions (Unified 5-column panel, shared borders) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 bg-border gap-[1px]">
        
        {/* Study Buddy */}
        <div 
          onClick={() => navigate("/dashboard/study-buddy")} 
          className="bg-panel flex items-center justify-between gap-3 px-5 py-4.5 hover:bg-panel2 cursor-pointer group transition-colors duration-150"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary rounded-[4px] border border-primary/20 flex-shrink-0">
              <Brain className="w-4.5 h-4.5 stroke-[1.75]" />
            </div>
            <span className="text-[14px] font-medium text-txt font-body">Study Buddy</span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted group-hover:text-txt group-hover:translate-x-0.5 transition-all duration-150" />
        </div>

        {/* Notice Analyzer */}
        <div 
          onClick={() => navigate("/dashboard/notice-analyzer")} 
          className="bg-panel flex items-center justify-between gap-3 px-5 py-4.5 hover:bg-panel2 cursor-pointer group transition-colors duration-150"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary rounded-[4px] border border-primary/20 flex-shrink-0">
              <LineChart className="w-4.5 h-4.5 stroke-[1.75]" />
            </div>
            <span className="text-[14px] font-medium text-txt font-body">Notice Analyzer</span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted group-hover:text-txt group-hover:translate-x-0.5 transition-all duration-150" />
        </div>

        {/* Deadline Manager */}
        <div 
          onClick={() => navigate("/dashboard/deadlines")} 
          className="bg-panel flex items-center justify-between gap-3 px-5 py-4.5 hover:bg-panel2 cursor-pointer group transition-colors duration-150"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary rounded-[4px] border border-primary/20 flex-shrink-0">
              <Calendar className="w-4.5 h-4.5 stroke-[1.75]" />
            </div>
            <span className="text-[14px] font-medium text-txt font-body">Deadline Manager</span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted group-hover:text-txt group-hover:translate-x-0.5 transition-all duration-150" />
        </div>

        {/* Attendance */}
        <div 
          onClick={() => navigate("/dashboard/attendance")} 
          className="bg-panel flex items-center justify-between gap-3 px-5 py-4.5 hover:bg-panel2 cursor-pointer group transition-colors duration-150"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary rounded-[4px] border border-primary/20 flex-shrink-0">
              <CheckSquare className="w-4.5 h-4.5 stroke-[1.75]" />
            </div>
            <span className="text-[14px] font-medium text-txt font-body">Attendance</span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted group-hover:text-txt group-hover:translate-x-0.5 transition-all duration-150" />
        </div>

        {/* Settings (Disabled) */}
        <div className="bg-panel flex items-center justify-between gap-3 px-5 py-4.5 text-muted/35 cursor-not-allowed select-none sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-border text-muted/30 rounded-[4px] flex-shrink-0 bg-transparent border border-border">
              <Settings className="w-4.5 h-4.5 stroke-[1.75]" />
            </div>
            <span className="text-[14px] font-medium font-body">Settings</span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
