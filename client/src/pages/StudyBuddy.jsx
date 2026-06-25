import React, { useState, useEffect } from "react";
import {
  FileText,
  MessageSquare,
  Copy,
  CheckSquare,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useStudyBuddy } from "../context/StudyBuddyContext";

// Import custom components
import NotesUpload from "../components/studybuddy/NotesUpload";
import AskQuestion from "../components/studybuddy/AskQuestion";
import Flashcards from "../components/studybuddy/Flashcards";
import QuizGenerator from "../components/studybuddy/QuizGenerator";
import SubjectSelector from "../components/studybuddy/SubjectSelector";

/**
 * Main StudyBuddy container coordinating the tabbed workspace
 * and active subject scopes for all RAG microservice actions.
 */
export const StudyBuddy = () => {
  const { student } = useAuth();
  const { subjects, selectedSubject, selectSubject, fetchSubjects } =
    useStudyBuddy();

  // Tabs: 'notes' | 'ask' | 'flashcards' | 'quiz'
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (["notes", "ask", "flashcards", "quiz"].includes(tabParam)) {
      return tabParam;
    }
    return "notes";
  });

  // Fetch subjects on mount
  useEffect(() => {
    if (student?.student_id) {
      const params = new URLSearchParams(window.location.search);
      const subjectParam = params.get("subject");
      const targetSubjectId = subjectParam
        ? decodeURIComponent(subjectParam).toUpperCase()
        : null;

      fetchSubjects(student.student_id, targetSubjectId);
    }
  }, [student, fetchSubjects]);

  // Monitor search params to switch tabs dynamically
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (tabParam && ["notes", "ask", "flashcards", "quiz"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [window.location.search]);

  // Callback when a new note is successfully ingested
  const handleNoteIngested = (newSubjectId) => {
    if (student?.student_id) {
      // Refresh subject list and automatically select the new subject
      fetchSubjects(student.student_id, newSubjectId);
    }

    // Auto switch to Ask AI tab to let them interact with it immediately
    setActiveTab("ask");
  };

  const tabs = [
    { id: "notes", name: "Notes Upload", icon: FileText },
    { id: "ask", name: "Ask AI", icon: MessageSquare },
    { id: "flashcards", name: "Flashcards", icon: Copy },
    { id: "quiz", name: "Mock Quiz", icon: CheckSquare },
  ];

  return (
    <div className="w-full space-y-6 pb-12 animate-fade-in font-body">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[4px] bg-primary/10 text-primary border border-primary/20">
            <GraduationCap className="h-5 w-5 stroke-[1.75]" />
          </div>
          <div>
            <h1 className="font-display text-[28px] sm:text-[38px] lg:text-[48px] font-bold text-txt tracking-tight leading-tight">
              AI Study Buddy
            </h1>
            <p className="text-[14px] text-muted mt-1 font-body">
              Vectorize notes, ask questions, generate flashcards, and run quizzes.
            </p>
          </div>
        </div>

        {/* Global Subject Selector (Only relevant for RAG tabs, not notes upload tab itself) */}
        {activeTab !== "notes" && (
          <SubjectSelector
            subjects={subjects}
            activeSubject={selectedSubject}
            onChange={(subjectId) =>
              selectSubject(student.student_id, subjectId)
            }
          />
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-border pb-px">
        <nav className="flex flex-wrap -mb-px gap-2" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 border-b-2 font-bold text-sm transition-colors duration-150 focus:outline-none font-display ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted hover:text-txt hover:border-border"
                }`}
              >
                <Icon className="h-4 w-4 stroke-[1.75]" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Panel Content */}
      <div className="mt-6">
        {activeTab === "notes" && (
          <NotesUpload onIngestionSuccess={handleNoteIngested} />
        )}

        {activeTab === "ask" && <AskQuestion subject={selectedSubject} />}

        {activeTab === "flashcards" && <Flashcards subject={selectedSubject} />}

        {activeTab === "quiz" && <QuizGenerator subject={selectedSubject} />}
      </div>
    </div>
  );
};

export default StudyBuddy;
