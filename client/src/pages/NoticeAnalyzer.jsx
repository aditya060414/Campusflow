import React, { useState } from "react";
import { toast } from "react-hot-toast";
import {
  ClipboardList,
  AlertTriangle,
  Calendar,
  CheckSquare,
  FileText,
  Send,
  Loader2,
  Clock
} from "lucide-react";
import { useApi } from "../hooks/useApi";
import ragService from "../services/ragService";
import Loader from "../components/common/Loader";

/**
 * NoticeAnalyzer Page.
 * Pastes notices, analyzes them using RAG, and displays
 * structured summaries, tasks, dates, and priorities.
 */
export const NoticeAnalyzer = () => {
  const [noticeText, setNoticeText] = useState("");
  const [validationError, setValidationError] = useState("");

  // Hook up useApi for RAG notice analysis
  const {
    data: analysis,
    loading,
    execute: runAnalysis,
    reset: resetAnalysis
  } = useApi(ragService.analyzeNotice);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setValidationError("");

    // Form validation
    if (!noticeText.trim()) {
      setValidationError("Notice text cannot be empty.");
      toast.error("Notice text cannot be empty.");
      return;
    }
    if (noticeText.trim().length < 20) {
      setValidationError("Notice text must be at least 20 characters to analyze.");
      toast.error("Notice text is too short to analyze.");
      return;
    }

    const res = await runAnalysis(noticeText.trim());
    if (res.success) {
      toast.success("Notice analyzed successfully!");
    }
  };

  // Helper to resolve priority badge colors
  const getPriorityBadge = (priority) => {
    const p = (priority || "medium").toLowerCase();
    switch (p) {
      case "high":
        return "bg-red-50 text-red-750 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50 animate-pulse";
      case "medium":
        return "bg-amber-50 text-amber-750 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50";
      case "low":
        default:
        return "bg-emerald-50 text-emerald-750 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 dark:border-slate-800 pb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600 text-white">
          <ClipboardList className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Academic Notice Analyzer
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
            Paste notices, syllabi notifications, or circulars to instantly extract action items and deadlines.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Input Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-white dark:bg-slate-950 border border-gray-255 dark:border-slate-800 rounded-2xl shadow-sm">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
              Paste Notice Text
            </h2>
            
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div>
                <textarea
                  value={noticeText}
                  onChange={(e) => {
                    setNoticeText(e.target.value);
                    if (validationError) setValidationError("");
                  }}
                  disabled={loading}
                  rows={10}
                  className={`block w-full p-4 rounded-lg border text-sm bg-white dark:bg-slate-900 text-gray-950 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none ${
                    validationError
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-200 dark:border-slate-800 focus:ring-primary"
                  }`}
                  placeholder="Paste the raw announcement or notice copy here..."
                />
                {validationError && (
                  <p className="text-xs text-red-500 mt-1.5">{validationError}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-slate-950 transition-all duration-200 shadow-md shadow-primary/10 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing Notice...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Analyze Circular
                    </>
                  )}
                </button>

                {analysis && (
                  <button
                    type="button"
                    onClick={() => {
                      setNoticeText("");
                      resetAnalysis();
                    }}
                    disabled={loading}
                    className="py-2.5 px-4 rounded-lg text-sm font-medium border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors duration-200"
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Analysis Output Panel */}
        <div className="lg:col-span-7">
          {loading && (
            <div className="flex h-64 items-center justify-center bg-white dark:bg-slate-950 border border-gray-255 dark:border-slate-800 rounded-2xl shadow-sm">
              <Loader message="Analyzing notice text and extracting tasks..." />
            </div>
          )}

          {!loading && !analysis && (
            <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-slate-950 border border-gray-255 dark:border-slate-800 rounded-2xl shadow-sm text-center p-6">
              <div className="p-3 bg-gray-50 dark:bg-slate-900 text-gray-400 dark:text-slate-600 rounded-xl mb-4">
                <ClipboardList className="h-8 w-8" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                No active analysis
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 max-w-sm mt-1">
                Paste a university circular on the left and click "Analyze Circular" to view the structured AI output.
              </p>
            </div>
          )}

          {!loading && analysis && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Executive Summary Card */}
              <div className="p-6 bg-white dark:bg-slate-950 border border-gray-255 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary dark:text-primary-400" />
                    Notice Summary
                  </h3>
                  
                  {/* Priority Badge */}
                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getPriorityBadge(analysis.priority)}`}>
                    Priority: {(analysis.priority || "medium").toUpperCase()}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                  {analysis.summary || "No summary provided."}
                </p>
              </div>

              {/* Grid: Deadlines and Action Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Important Dates */}
                <div className="p-6 bg-white dark:bg-slate-950 border border-gray-255 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-slate-900 pb-3">
                    <Calendar className="h-4 w-4 text-amber-500" />
                    Important Dates
                  </h3>
                  
                  {analysis.important_dates && analysis.important_dates.length > 0 ? (
                    <ul className="space-y-2.5">
                      {analysis.important_dates.map((date, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-600 dark:text-slate-300">
                          <Clock className="h-4 w-4 text-gray-400 dark:text-slate-500 shrink-0 mt-0.5" />
                          <span>{date}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-400 dark:text-slate-500 italic">
                      No specific dates mentioned.
                    </p>
                  )}
                </div>

                {/* Action Items */}
                <div className="p-6 bg-white dark:bg-slate-950 border border-gray-255 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-slate-900 pb-3">
                    <CheckSquare className="h-4 w-4 text-emerald-500" />
                    Your Action Items
                  </h3>
                  
                  {analysis.action_items && analysis.action_items.length > 0 ? (
                    <ul className="space-y-2.5">
                      {analysis.action_items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-600 dark:text-slate-300">
                          <span className="flex h-5 w-5 items-center justify-center rounded border border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400 font-semibold text-xs shrink-0 mt-0.5">
                            ✓
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-400 dark:text-slate-500 italic">
                      No action items extracted.
                    </p>
                  )}
                </div>

              </div>

              {/* Action Prompt */}
              {analysis.priority === "high" && (
                <div className="flex gap-3 p-4 bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl">
                  <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed">
                    **Action Required:** This notice is flagged with **High Priority**. Please review the action items and dates above immediately to ensure you do not miss these academic commitments.
                  </p>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default NoticeAnalyzer;
