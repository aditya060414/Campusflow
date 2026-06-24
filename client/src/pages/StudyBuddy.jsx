import React, { useState, useEffect } from "react";
import { FileText, MessageSquare, Copy, CheckSquare, GraduationCap } from "lucide-react";

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
  // Tabs: 'notes' | 'ask' | 'flashcards' | 'quiz'
  const [activeTab, setActiveTab] = useState("notes");
  
  // Ingested subjects list
  const [ingestedSubjects, setIngestedSubjects] = useState([]);
  
  // Active subject selected for RAG operations
  const [activeSubject, setActiveSubject] = useState("");

  // Load ingested subjects from localStorage on mount
  useEffect(() => {
    const savedSubjects = JSON.parse(
      localStorage.getItem("cf_ingested_subjects") || "[]"
    );
    setIngestedSubjects(savedSubjects);
    if (savedSubjects.length > 0) {
      setActiveSubject(savedSubjects[0]);
    }
  }, []);

  // Callback when a new note is successfully ingested
  const handleNoteIngested = (newSubject) => {
    const savedSubjects = JSON.parse(
      localStorage.getItem("cf_ingested_subjects") || "[]"
    );
    
    if (!savedSubjects.includes(newSubject)) {
      const updated = [...savedSubjects, newSubject];
      localStorage.setItem("cf_ingested_subjects", JSON.stringify(updated));
      setIngestedSubjects(updated);
      
      // Auto-set as active subject if none was selected
      if (!activeSubject) {
        setActiveSubject(newSubject);
      }
    }
    
    // Increment global uploaded notes count in localStorage for dashboard stats
    const currentCount = parseInt(localStorage.getItem("cf_notes_count") || "0", 10);
    localStorage.setItem("cf_notes_count", (currentCount + 1).toString());
    
    // Auto switch to Ask AI tab to let them play with it immediately!
    setActiveTab("ask");
  };

  const tabs = [
    { id: "notes", name: "Notes Upload", icon: FileText },
    { id: "ask", name: "Ask AI", icon: MessageSquare },
    { id: "flashcards", name: "Flashcards", icon: Copy },
    { id: "quiz", name: "Mock Quiz", icon: CheckSquare },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              AI Study Buddy
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
              Vectorize notes, ask questions, generate flashcards, and run quizzes.
            </p>
          </div>
        </div>

        {/* Global Subject Selector (Only relevant for RAG tabs, not notes upload tab itself) */}
        {activeTab !== "notes" && (
          <SubjectSelector
            subjects={ingestedSubjects}
            activeSubject={activeSubject}
            onChange={setActiveSubject}
          />
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 dark:border-slate-800">
        <nav className="flex flex-wrap -mb-px gap-2" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium text-sm transition-all duration-200 focus:outline-none ${
                  isActive
                    ? "border-primary text-primary dark:border-primary-400 dark:text-primary-400 font-semibold"
                    : "border-transparent text-gray-500 hover:text-gray-750 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-300"
                }`}
              >
                <Icon className="h-4 w-4" />
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
        
        {activeTab === "ask" && (
          <AskQuestion subject={activeSubject} />
        )}
        
        {activeTab === "flashcards" && (
          <Flashcards subject={activeSubject} />
        )}
        
        {activeTab === "quiz" && (
          <QuizGenerator subject={activeSubject} />
        )}
      </div>

    </div>
  );
};

export default StudyBuddy;
