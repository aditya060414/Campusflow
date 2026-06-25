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
  Clock,
  Sparkles,
  Check,
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
    reset: resetAnalysis,
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
      setValidationError(
        "Notice text must be at least 20 characters to analyze.",
      );
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
        return "bg-red-950/40 text-red-400 border-red-900/50 animate-pulse";
      case "medium":
        return "bg-amber-950/40 text-amber-400 border-amber-900/50";
      case "low":
      default:
        return "bg-emerald-950/40 text-emerald-400 border-emerald-900/50";
    }
  };

  return (
    <div className="w-full space-y-6 pb-12 animate-fade-in font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[4px] bg-primary/10 text-primary border border-primary/20">
            <ClipboardList className="h-5 w-5 stroke-[1.75]" />
          </div>
          <div>
            <h1 className="font-display text-[28px] sm:text-[38px] lg:text-[48px] font-bold text-txt tracking-tight leading-tight">
              Academic Notice Analyzer
            </h1>
            <p className="text-[14px] text-muted mt-1 font-body">
              Paste notices, syllabi notifications, or circulars to instantly extract action items and deadlines.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-panel border border-border rounded-lg">
            <h2 className="text-[16px] sm:text-[18px] font-bold text-txt mb-4 font-display">
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
                  className={`block w-full p-3 rounded-[4px] border text-[14px] bg-panel text-txt placeholder-muted focus:outline-none focus:border-primary transition-colors duration-150 resize-none ${
                    validationError
                      ? "border-red-500 focus:border-red-500"
                      : "border-border"
                  }`}
                  placeholder="Paste the raw announcement or notice copy here..."
                />
                {validationError && (
                  <p className="text-xs text-red-500 mt-1.5 font-display">
                    {validationError}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-grow flex justify-center items-center gap-2 bg-primary text-white border border-primary rounded-[4px] px-5 py-2.5 text-[14px] font-bold hover:bg-[#1D4ED8] transition-colors duration-150 font-display disabled:opacity-50"
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
                    className="bg-transparent text-txt border border-border hover:bg-panel2 rounded-[4px] px-5 py-2.5 text-[14px] font-bold transition-colors duration-150 font-display"
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
            <div className="flex h-64 items-center justify-center bg-panel border border-border rounded-lg">
              <Loader message="Analyzing notice text and extracting tasks..." />
            </div>
          )}

          {!loading && !analysis && (
            <div className="flex flex-col items-center justify-center h-64 bg-panel border border-border rounded-lg text-center p-6 space-y-4">
              <div className="p-3 bg-panel2 border border-border text-muted rounded-[4px]">
                <ClipboardList className="h-8 w-8 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-[16px] sm:text-[18px] font-bold text-txt font-display">
                  No active analysis
                </h3>
                <p className="text-[14px] text-muted max-w-sm">
                  Paste a university circular on the left and click "Analyze Circular" to view the structured AI output.
                </p>
              </div>
            </div>
          )}

          {!loading && analysis && (
            <div className="space-y-6 animate-fade-in">
              {/* Executive Summary Card */}
              <div className="p-6 bg-panel border border-border rounded-lg space-y-4">
                <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
                  <h3 className="text-[16px] sm:text-[18px] font-bold text-txt flex items-center gap-2 font-display">
                    <FileText className="h-5 w-5 text-primary stroke-[1.75]" />
                    Notice Summary
                  </h3>

                  {/* Priority Badge */}
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider font-display ${getPriorityBadge(analysis.priority)}`}
                  >
                    Priority: {(analysis.priority || "medium").toUpperCase()}
                  </span>
                </div>

                <p className="text-[14px] text-txt leading-relaxed font-body">
                  {analysis.summary || "No summary provided."}
                </p>
              </div>

              {/* Estimated Reading Time and Recommended Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Reading Time */}
                <div className="p-6 bg-panel border border-border rounded-lg space-y-3">
                  <h3 className="text-[16px] sm:text-[18px] font-bold text-txt flex items-center gap-2 border-b border-border pb-3 font-display">
                    <Clock className="h-4 w-4 text-primary stroke-[1.75]" />
                    Estimated Reading Time
                  </h3>
                  <div className="flex items-baseline gap-2 mt-2 font-display">
                    <span className="text-3xl font-bold text-txt">
                      {analysis.estimated_reading_time || "1 min"}
                    </span>
                    <span className="text-xs text-muted">
                      to fully digest
                    </span>
                  </div>
                </div>

                {/* Recommended Action */}
                <div className="p-6 bg-panel border border-border rounded-lg space-y-3">
                  <h3 className="text-[16px] sm:text-[18px] font-bold text-txt flex items-center gap-2 border-b border-border pb-3 font-display">
                    <Sparkles className="h-4 w-4 text-primary stroke-[1.75]" />
                    Recommended Action
                  </h3>
                  <p className="text-[14px] text-txt font-semibold leading-relaxed mt-2 font-body">
                    {analysis.recommended_action ||
                      "Review the action items and key deadlines immediately."}
                  </p>
                </div>
              </div>

              {/* Grid: Deadlines and Action Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Important Dates */}
                <div className="p-6 bg-panel border border-border rounded-lg space-y-4">
                  <h3 className="text-[16px] sm:text-[18px] font-bold text-txt flex items-center gap-2 border-b border-border pb-3 font-display">
                    <Calendar className="h-4 w-4 text-primary stroke-[1.75]" />
                    Important Dates
                  </h3>

                  {analysis.important_dates &&
                  analysis.important_dates.length > 0 ? (
                    <ul className="space-y-2.5 font-body">
                      {analysis.important_dates.map((date, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-[14px] text-txt"
                        >
                          <Clock className="h-4 w-4 text-muted shrink-0 mt-0.5" />
                          <span>{date}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[12px] text-muted italic font-display">
                      No specific dates mentioned.
                    </p>
                  )}
                </div>

                {/* Action Items */}
                <div className="p-6 bg-panel border border-border rounded-lg space-y-4">
                  <h3 className="text-[16px] sm:text-[18px] font-bold text-txt flex items-center gap-2 border-b border-border pb-3 font-display">
                    <CheckSquare className="h-4 w-4 text-primary stroke-[1.75]" />
                    Your Action Items
                  </h3>

                  {analysis.action_items && analysis.action_items.length > 0 ? (
                    <ul className="space-y-2.5 font-body">
                      {analysis.action_items.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-[14px] text-txt"
                        >
                          <span className="flex h-5 w-5 items-center justify-center rounded border border-emerald-900/50 bg-emerald-950/30 text-[0px] shrink-0 mt-0.5">
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            ✓
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[12px] text-muted italic font-display">
                      No action items extracted.
                    </p>
                  )}
                </div>
              </div>

              {/* Action Prompt */}
              {analysis.priority === "high" && (
                <div className="flex gap-3 p-4 bg-red-950/20 border border-red-900/40 rounded-[4px] font-body">
                  <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-[13px] text-red-400 leading-relaxed">
                    <strong>Action Required:</strong> This notice is flagged with <strong>High Priority</strong>. Please review the action items and dates above immediately to ensure you do not miss these academic commitments.
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
