import React, { useState, useEffect } from "react";
import { Calendar, Sparkles } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

// Import sub-components
import DeadlineStats from "../components/deadlines/DeadlineStats";
import UpcomingDeadlineList from "../components/deadlines/UpcomingDeadlineList";
import CreateDeadlineModal from "../components/deadlines/CreateDeadlineModal";
import AiPlannerPanel from "../components/deadlines/AiPlannerPanel";
import CalendarPreview from "../components/deadlines/CalendarPreview";
import ReminderSettings from "../components/deadlines/ReminderSettings";
import DeadlineTimeline from "../components/deadlines/DeadlineTimeline";
import TodayScheduleCard from "../components/deadlines/TodayScheduleCard";

/**
 * Main Deadline Manager portal coordinating active lists,
 * state changes, local storage persistency, and LLM study generation.
 * Refactored to align with a premium, grid-aligned, space-consistent SaaS dashboard.
 */
export const DeadlineManager = () => {
  const [deadlines, setDeadlines] = useState([]);
  const [selectedDeadlineId, setSelectedDeadlineId] = useState(null);
  const [generatedPlans, setGeneratedPlans] = useState({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState(null);

  // Helper to calculate days remaining dynamically
  const calculateDaysRemaining = (targetDateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDateStr);
    target.setHours(0, 0, 0, 0);

    const diffTime = target - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Load data on mount
  useEffect(() => {
    const saved = localStorage.getItem("cf_deadlines_v2");

    if (saved) {
      const parsed = JSON.parse(saved);
      const updated = parsed.map((d) => ({
        ...d,
        daysRemaining: calculateDaysRemaining(d.date),
      }));
      setDeadlines(updated);

      // Load plans
      const plans = {};
      updated.forEach((d) => {
        const planSaved = localStorage.getItem(`plan_v2_${d.id}`);
        if (planSaved) {
          plans[d.id] = JSON.parse(planSaved);
        }
      });
      setGeneratedPlans(plans);

      if (updated.length > 0 && !selectedDeadlineId) {
        setSelectedDeadlineId(updated[0].id);
      }
    } else {
      // Default initial mock milestones with categories
      const today = new Date();

      const d1 = new Date();
      d1.setDate(today.getDate() + 3);
      const d2 = new Date();
      d2.setDate(today.getDate() + 8);
      const d3 = new Date();
      d3.setDate(today.getDate() - 2);

      const defaultList = [
        {
          id: "dl-1",
          title: "Implement CPU Scheduler",
          subject: "OPERATING SYSTEMS",
          description:
            "Develop the round-robin and priority scheduling simulator in C++ and write a analysis report.",
          date: d1.toISOString().split("T")[0],
          priority: "High",
          hoursPerDay: 3.0,
          reminderTime: "08:00",
          completed: false,
          daysRemaining: 3,
          progress: 33,
          type: "Project",
        },
        {
          id: "dl-2",
          title: "Database Normalization Exam",
          subject: "DATABASE SYSTEMS",
          description:
            "Prepare for the mid-semester test covering 3NF, BCNF, relational algebra, and B+ trees.",
          date: d2.toISOString().split("T")[0],
          priority: "Medium",
          hoursPerDay: 2.0,
          reminderTime: "09:30",
          completed: false,
          daysRemaining: 8,
          progress: 0,
          type: "Exam",
        },
        {
          id: "dl-3",
          title: "SQL Lab Assignment 3",
          subject: "DATABASE SYSTEMS",
          description:
            "Write aggregate queries, joins, and subqueries for the university registrar schema.",
          date: d3.toISOString().split("T")[0],
          priority: "Low",
          hoursPerDay: 1.0,
          reminderTime: "18:00",
          completed: true,
          daysRemaining: -2,
          progress: 100,
          type: "Assignment",
        },
      ];

      setDeadlines(defaultList);
      localStorage.setItem("cf_deadlines_v2", JSON.stringify(defaultList));
      setSelectedDeadlineId(defaultList[0].id);

      // Create initial mock plan object for default-1 to make it demo-ready
      const initialPlanData = {
        estimatedHours: 9,
        riskLevel: "medium",
        recommendation:
          "Allocate 3 hours daily for OS logic. Focus on the queue structures, and reserve the final day for Gantt analysis.",
        studyPlan: [
          {
            date: today.toISOString().split("T")[0],
            topic: "Review CPU scheduling formulas",
            duration: "3 hours",
            completed: true,
          },
          {
            date: new Date(today.getTime() + 86400000)
              .toISOString()
              .split("T")[0],
            topic: "Code CPU queue structures",
            duration: "3 hours",
            completed: false,
          },
          {
            date: new Date(today.getTime() + 172800000)
              .toISOString()
              .split("T")[0],
            topic: "Finalize Gantt charts and submit",
            duration: "3 hours",
            completed: false,
          },
        ],
      };

      setGeneratedPlans({ "dl-1": initialPlanData });
      localStorage.setItem("plan_v2_dl-1", JSON.stringify(initialPlanData));
    }
  }, []);

  const saveDeadlines = (updatedList) => {
    setDeadlines(updatedList);
    localStorage.setItem("cf_deadlines_v2", JSON.stringify(updatedList));
  };

  // Handlers
  const handleCreateOrUpdate = (data) => {
    if (editingDeadline) {
      // Edit mode
      const updated = deadlines.map((d) => {
        if (d.id === editingDeadline.id) {
          return {
            ...d,
            ...data,
            daysRemaining: calculateDaysRemaining(data.date),
          };
        }
        return d;
      });
      saveDeadlines(updated);
      setEditingDeadline(null);
      toast.success("Deadline updated successfully.");
    } else {
      // Create mode
      const newItem = {
        id: `dl-${Date.now()}`,
        ...data,
        completed: false,
        daysRemaining: calculateDaysRemaining(data.date),
        progress: 0,
      };
      const updated = [newItem, ...deadlines];
      saveDeadlines(updated);
      setSelectedDeadlineId(newItem.id);
      toast.success("New deadline created.");
    }
  };

  const handleToggleComplete = (id) => {
    const updated = deadlines.map((d) => {
      if (d.id === id) {
        const nextCompleted = !d.completed;
        return {
          ...d,
          completed: nextCompleted,
          progress: nextCompleted ? 100 : 0,
        };
      }
      return d;
    });
    saveDeadlines(updated);
    toast.success("Status updated.");
  };

  const handleDelete = (id) => {
    const updated = deadlines.filter((d) => d.id !== id);
    saveDeadlines(updated);
    if (selectedDeadlineId === id) {
      setSelectedDeadlineId(updated.length > 0 ? updated[0].id : null);
    }
    localStorage.removeItem(`plan_v2_${id}`);
    toast.success("Deadline deleted.");
  };

  const handleGeneratePlan = (id, planData) => {
    // Save full plan object (estimatedHours, riskLevel, recommendation, studyPlan)
    const updatedPlans = { ...generatedPlans, [id]: planData };
    setGeneratedPlans(updatedPlans);
    localStorage.setItem(`plan_v2_${id}`, JSON.stringify(planData));

    // Update progress of this deadline to match completed sessions
    const studyPlan =
      planData.studyPlan || (Array.isArray(planData) ? planData : []);
    const total = studyPlan.length;
    const completed = studyPlan.filter((p) => p.completed).length;
    const nextProgress = total > 0 ? Math.round((completed / total) * 100) : 0;

    const updatedDeadlines = deadlines.map((d) => {
      if (d.id === id) {
        return {
          ...d,
          progress: nextProgress,
          completed: nextProgress === 100 ? true : d.completed,
        };
      }
      return d;
    });
    saveDeadlines(updatedDeadlines);
  };

  const handleToggleSessionComplete = (id, sessionIndex, nextState) => {
    const planData = generatedPlans[id];
    if (!planData) return;

    let updatedPlanData;
    let studyPlan;

    if (Array.isArray(planData)) {
      studyPlan = planData.map((p, idx) => {
        if (idx === sessionIndex) {
          return { ...p, completed: nextState };
        }
        return p;
      });
      updatedPlanData = studyPlan;
    } else {
      studyPlan = (planData.studyPlan || []).map((p, idx) => {
        if (idx === sessionIndex) {
          return { ...p, completed: nextState };
        }
        return p;
      });
      updatedPlanData = {
        ...planData,
        studyPlan,
      };
    }

    const updatedPlans = { ...generatedPlans, [id]: updatedPlanData };
    setGeneratedPlans(updatedPlans);
    localStorage.setItem(`plan_v2_${id}`, JSON.stringify(updatedPlanData));

    // Update progress
    const total = studyPlan.length;
    const completed = studyPlan.filter((p) => p.completed).length;
    const nextProgress = total > 0 ? Math.round((completed / total) * 100) : 0;

    const updatedDeadlines = deadlines.map((d) => {
      if (d.id === id) {
        return {
          ...d,
          progress: nextProgress,
          completed: nextProgress === 100 ? true : d.completed,
        };
      }
      return d;
    });
    saveDeadlines(updatedDeadlines);
  };

  const selectedDeadline = deadlines.find((d) => d.id === selectedDeadlineId);

  return (
    <div className="w-full space-y-6 pb-12 animate-fade-in relative z-10 font-body">
      {/* 1. Hero Section (Brutalist panel header) */}
      <div className="bg-panel border border-border rounded-lg p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2 text-primary font-bold text-[12px] uppercase tracking-wider font-display">
              <Sparkles className="w-4 h-4 stroke-[1.75]" />
              AI Planning Copilot
            </div>
            <h1 className="font-display text-[28px] sm:text-[38px] lg:text-[48px] font-bold text-txt tracking-tight leading-tight">
              Smart Deadline Manager
            </h1>
            <p className="text-[14px] sm:text-[15px] text-muted mt-2 max-w-2xl font-body leading-relaxed">
              Never miss assignments, exams, projects, or submissions again. Build optimized study schedules automatically using real-time AI workload distribution.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setEditingDeadline(null);
                setIsCreateModalOpen(true);
              }}
              className="bg-primary text-white border border-primary rounded-[4px] px-5 py-2.5 text-[14px] font-bold hover:bg-[#1D4ED8] transition-colors duration-150 font-display"
            >
              Create Deadline
            </button>
            <button
              onClick={() => {
                if (selectedDeadlineId) {
                  const panelBtn = document.getElementById(
                    "ai-planner-generate-btn",
                  );
                  if (panelBtn) panelBtn.click();
                } else {
                  toast.error("Please select a deadline to plan first.");
                }
              }}
              className="bg-transparent text-txt border border-border hover:bg-panel2 rounded-[4px] px-5 py-2.5 text-[14px] font-bold transition-colors duration-150 font-display"
            >
              Generate AI Plan
            </button>
          </div>
        </div>
      </div>

      {deadlines.length === 0 ? (
        /* Empty State */
        <div className="py-16 flex flex-col items-center justify-center text-center p-6 bg-panel border border-border rounded-lg max-w-xl mx-auto space-y-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Calendar className="w-8 h-8 stroke-[1.75]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-[18px] font-bold text-txt font-display">
              No deadlines added yet
            </h3>
            <p className="text-[14px] text-muted max-w-sm leading-relaxed">
              Create your first deadline and let AI build your study schedule, calculate risk levels, and send notifications.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingDeadline(null);
              setIsCreateModalOpen(true);
            }}
            className="bg-primary text-white border border-primary rounded-[4px] px-5 py-2.5 text-[14px] font-bold hover:bg-[#1D4ED8] transition-colors duration-150 font-display"
          >
            Create Deadline
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 2. Statistics Row */}
          <DeadlineStats
            deadlines={deadlines}
            generatedPlans={generatedPlans}
          />

          {/* 3. Split Grid (Upcoming Deadlines: 55% / AI Planner: 45%) */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 items-start">
            <UpcomingDeadlineList
              deadlines={deadlines}
              selectedDeadlineId={selectedDeadlineId}
              onSelect={setSelectedDeadlineId}
              onToggleComplete={handleToggleComplete}
              onEdit={(d) => {
                setEditingDeadline(d);
                setIsCreateModalOpen(true);
              }}
              onDelete={handleDelete}
            />

            <AiPlannerPanel
              selectedDeadline={selectedDeadline}
              onGeneratePlan={handleGeneratePlan}
              generatedPlan={
                selectedDeadline ? generatedPlans[selectedDeadline.id] : null
              }
              onToggleSessionComplete={handleToggleSessionComplete}
            />
          </div>

          {/* 4. Today's AI Schedule & Calendar Section */}
          <div className="space-y-6">
            <TodayScheduleCard />

            <CalendarPreview
              deadlines={deadlines}
              studySessions={Object.values(generatedPlans || {})
                .map((p) => p.studyPlan || (Array.isArray(p) ? p : []))
                .flat()
                .filter(Boolean)}
              onOpenCreateModal={() => {
                setEditingDeadline(null);
                setIsCreateModalOpen(true);
              }}
            />
          </div>

          {/* 5. Timeline & Integrations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DeadlineTimeline deadlines={deadlines} />
            <ReminderSettings />
          </div>
        </div>
      )}

      {/* Create/Edit Modal Overlay */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <CreateDeadlineModal
            isOpen={isCreateModalOpen}
            onClose={() => {
              setIsCreateModalOpen(false);
              setEditingDeadline(null);
            }}
            onCreate={handleCreateOrUpdate}
            editingDeadline={editingDeadline}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeadlineManager;
