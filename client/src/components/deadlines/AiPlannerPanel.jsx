import React, { useState } from "react";
import { Sparkles, Play, Clock, Info } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import StudyPlanCard from "./StudyPlanCard";
import { useNavigate } from "react-router-dom";

/**
 * AI Study Planner Panel. Displays dynamic workload scores, deadline health,
 * LLM recommendations, and checklist of daily study sessions.
 * Refactored to stick to the top on desktop scroll and feature enhanced visual weight.
 */
export const AiPlannerPanel = ({
  selectedDeadline,
  onGeneratePlan,
  generatedPlan, // Can be array of sessions or full object { studyPlan, recommendation, riskLevel, estimatedHours }
  onToggleSessionComplete,
}) => {
  const navigate = useNavigate();
  const [loadingStep, setLoadingStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  // Destructure plan fields if generatedPlan is an object, or fallback if it's an array
  const hasPlanData = !!generatedPlan;
  const isPlanObject = hasPlanData && !Array.isArray(generatedPlan);

  const studySessions = isPlanObject
    ? generatedPlan.studyPlan || []
    : Array.isArray(generatedPlan)
      ? generatedPlan
      : [];

  const aiRecommendation = isPlanObject
    ? generatedPlan.recommendation
    : "Review notes and allocate study hours daily to prepare.";

  const aiRiskLevel = isPlanObject
    ? generatedPlan.riskLevel
    : selectedDeadline
      ? selectedDeadline.priority === "High"
        ? "high"
        : "medium"
      : "medium";

  const aiEstimatedHours = isPlanObject
    ? generatedPlan.estimatedHours
    : studySessions.length * (selectedDeadline?.hoursPerDay || 2);

  // 1. Calculate Workload Score
  const getWorkloadScore = () => {
    if (!selectedDeadline) return null;
    const days = selectedDeadline.daysRemaining;
    if (days <= 0) {
      return {
        text: "Heavy Workload",
        color: "text-red-500 bg-red-500/10 border-red-500/20",
      };
    }
    const hours =
      aiEstimatedHours || days * (selectedDeadline.hoursPerDay || 2);
    const dailyRatio = hours / days;

    if (dailyRatio >= 4) {
      return {
        text: "Heavy Workload",
        color: "text-red-500 bg-red-500/10 border-red-500/20",
      };
    } else if (dailyRatio >= 2) {
      return {
        text: "Moderate Workload",
        color:
          "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
      };
    }
    return {
      text: "Light Workload",
      color: "text-green-500 bg-green-500/10 border-green-500/20",
    };
  };

  const workload = getWorkloadScore();

  // 2. Calculate Health Status
  const getHealthStatus = () => {
    if (!selectedDeadline) return null;
    const { progress, daysRemaining } = selectedDeadline;
    if (progress === 100) {
      return {
        text: "On Track",
        color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      };
    }
    if (daysRemaining < 0) {
      return {
        text: "At Risk",
        color: "text-red-500 bg-red-500/10 border-red-500/20",
      };
    }
    if (daysRemaining <= 2 && progress < 40) {
      return {
        text: "At Risk",
        color: "text-red-500 bg-red-500/10 border-red-500/20",
      };
    }
    if (daysRemaining <= 5 && progress < 20) {
      return {
        text: "At Risk",
        color: "text-red-500 bg-red-500/10 border-red-500/20",
      };
    }
    if (daysRemaining <= 5 && progress < 50) {
      return {
        text: "Falling Behind",
        color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      };
    }
    return {
      text: "On Track",
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    };
  };

  const health = getHealthStatus();

  // 3. Trigger Real AI plan generation API call
  const triggerAiPlanGeneration = async () => {
    if (!selectedDeadline) return;

    setIsGenerating(true);
    setLoadingStep(1);

    // Dynamic loader sequencing (1000ms intervals)
    const timer1 = setTimeout(() => setLoadingStep(2), 1000);
    const timer2 = setTimeout(() => setLoadingStep(3), 2000);

    try {
      const authRaw = localStorage.getItem("cf_student");
      const auth = authRaw ? JSON.parse(authRaw) : null;
      const studentId = auth?.student_id || "default_student";

      const response = await axios.post(
        "http://localhost:5000/api/deadlines/generate-plan",
        {
          studentId,
          title: selectedDeadline.title,
          subject: selectedDeadline.subject,
          description: selectedDeadline.description || "",
          deadline: selectedDeadline.date,
          hoursPerDay: selectedDeadline.hoursPerDay || 2.0,
          priority: selectedDeadline.priority,
          type: selectedDeadline.type || "Assignment",
        },
      );

      clearTimeout(timer1);
      clearTimeout(timer2);

      setLoadingStep(3);
      await new Promise((resolve) => setTimeout(resolve, 300));

      const responseData = response.data;
      onGeneratePlan(selectedDeadline.id, responseData);
      toast.success("AI Study Roadmap generated successfully.");
    } catch (error) {
      console.error("AI Generation failed:", error);
      toast.error(
        error.response?.data?.message ||
          "AI failed to generate study plan. Please verify the backend is running.",
      );
    } finally {
      setIsGenerating(false);
      setLoadingStep(0);
    }
  };

  // Redirect to Study Buddy page with parameters preloaded
  const handleStartStudying = () => {
    if (!selectedDeadline) return;
    navigate(
      `/dashboard/study-buddy?tab=ask&subject=${encodeURIComponent(selectedDeadline.subject)}`,
    );
  };

  return (
    <div className="p-6 bg-panel border border-border rounded-lg relative z-10 w-full animate-fade-in lg:sticky lg:top-[96px] max-h-[700px] overflow-y-auto flex flex-col justify-between scrollbar-thin">
      {/* Header and content container */}
      <div className="space-y-6 flex-1 flex flex-col justify-between">
        {/* Panel Title */}
        <div className="flex items-center gap-2 border-b border-border pb-4 shrink-0">
          <div className="h-8 w-8 rounded-[4px] bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-[16px] sm:text-[18px] font-bold text-txt font-display">
              AI Study Planner
            </h2>
            <p className="text-[12px] text-muted">
              Intelligent copilot analyzing schedules and notes
            </p>
          </div>
        </div>

        {!selectedDeadline ? (
          /* Empty / Select State */
          <div className="py-20 text-center space-y-3 flex-1 flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-panel2 border border-border flex items-center justify-center text-muted">
              <Info className="w-6 h-6" />
            </div>
            <p className="text-[12px] text-muted max-w-[240px] mx-auto leading-relaxed font-medium">
              Select a milestone card on the left to review workload analysis or generate an AI-optimized study schedule.
            </p>
          </div>
        ) : (
          /* Copilot Active Interface */
          <div className="space-y-5 flex-1 flex flex-col justify-between mt-4">
            {/* Telemetry Grid (Workload & Health) */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="p-3 bg-panel2 border border-border rounded-[4px] space-y-1">
                <span className="text-[9px] font-bold text-muted uppercase tracking-widest block font-display">
                  Workload Score
                </span>
                <div
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider text-center inline-block ${workload.color}`}
                >
                  {workload.text}
                </div>
              </div>
              <div className="p-3 bg-panel2 border border-border rounded-[4px] space-y-1">
                <span className="text-[9px] font-bold text-muted uppercase tracking-widest block font-display">
                  Deadline Health
                </span>
                <div
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider text-center inline-block ${health.color}`}
                >
                  {health.text}
                </div>
              </div>
            </div>

            {/* AI Advisor Panel (Perplexity-like) */}
            <div className="p-4 bg-panel2 border border-border rounded-[4px] space-y-3 flex-1 flex flex-col justify-center min-h-[160px]">
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-primary uppercase tracking-widest shrink-0 font-display">
                <Sparkles className="w-3.5 h-3.5" />
                AI Recommendation
              </div>

              {isGenerating ? (
                /* Multi-step loader */
                <div className="py-6 flex flex-col items-center justify-center space-y-3 text-center flex-1">
                  <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <div className="space-y-1">
                    <p className="text-[13px] font-bold text-txt animate-pulse font-display">
                      {loadingStep === 1 && "Analyzing workload..."}
                      {loadingStep === 2 && "Estimating study effort..."}
                      {loadingStep === 3 && "Building study roadmap..."}
                    </p>
                    <p className="text-[11px] text-muted">
                      Querying RAG vector database for lecture notes...
                    </p>
                  </div>
                </div>
              ) : (
                /* Recommendation content & plan */
                <div className="space-y-3 flex-1 flex flex-col justify-between">
                  <p className="text-[13px] text-txt leading-relaxed font-medium font-body">
                    {aiRecommendation}
                  </p>

                  {/* Risk Level Alert */}
                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase shrink-0 pt-2 font-display">
                    <span>Risk Level:</span>
                    <span
                      className={`px-2 py-0.5 rounded border uppercase ${
                        aiRiskLevel === "high"
                          ? "text-red-500 bg-red-500/10 border-red-500/20"
                          : aiRiskLevel === "medium"
                            ? "text-amber-500 bg-amber-500/10 border-amber-500/20"
                            : "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                      }`}
                    >
                      {aiRiskLevel === "high"
                        ? "🔴 High Risk"
                        : aiRiskLevel === "medium"
                          ? "🟡 Medium Risk"
                          : "🟢 Low Risk"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 shrink-0">
              <button
                id="ai-planner-generate-btn"
                onClick={triggerAiPlanGeneration}
                disabled={isGenerating}
                className="w-full py-2.5 rounded-[4px] text-[14px] font-bold text-white bg-primary border border-primary hover:bg-[#1D4ED8] transition-colors duration-150 flex items-center justify-center gap-1.5 font-display disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {hasPlanData ? "Re-Generate Plan" : "Generate AI Plan"}
              </button>

              <button
                onClick={handleStartStudying}
                disabled={!hasPlanData || isGenerating}
                className="w-full py-2.5 rounded-[4px] text-[14px] font-bold border border-border bg-transparent text-txt hover:bg-panel2 transition-colors duration-150 flex items-center justify-center gap-1.5 font-display disabled:opacity-40"
              >
                <Play className="w-3 h-3 text-primary fill-primary" />
                Start Studying
              </button>
            </div>

            {/* Day-by-Day Study Checklist Roadmap */}
            {hasPlanData && !isGenerating && (
              <div className="space-y-3 pt-4 border-t border-border shrink-0">
                <span className="text-[10px] font-bold text-muted uppercase tracking-widest block px-1 font-display">
                  Study Roadmap Checklist
                </span>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                  {studySessions.map((session, idx) => (
                    <StudyPlanCard
                      key={idx}
                      session={{
                        dayNumber: idx + 1,
                        date: session.date,
                        task: session.topic || session.task,
                        hours: session.duration
                          ? parseInt(
                              session.duration.match(/\d+/)?.[0] || "2",
                              10,
                            )
                          : session.hours || 2,
                        completed: !!session.completed,
                      }}
                      onToggle={(nextState) =>
                        onToggleSessionComplete(
                          selectedDeadline.id,
                          idx,
                          nextState,
                        )
                      }
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AiPlannerPanel;
