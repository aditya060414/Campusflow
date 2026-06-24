import React from "react";
import { BookOpen } from "lucide-react";

/**
 * SubjectSelector dropdown component to select the active subject scope
 * for RAG operations (Ask AI, Flashcards, Quiz).
 */
export const SubjectSelector = ({ subjects, activeSubject, onChange }) => {
  if (!subjects || subjects.length === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-3 py-2 rounded-lg border border-amber-250 dark:border-amber-900/30 font-medium">
        <span>No subjects uploaded yet. Go to "Notes Upload" first!</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="subject-select"
        className="text-xs sm:text-sm font-medium text-gray-500 dark:text-slate-400 flex items-center gap-1.5"
      >
        <BookOpen className="h-4 w-4 text-primary dark:text-primary-400" />
        Subject:
      </label>
      <select
        id="subject-select"
        value={activeSubject}
        onChange={(e) => onChange(e.target.value)}
        className="block w-40 sm:w-48 text-xs sm:text-sm py-2 px-3 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
      >
        {subjects.map((subject) => (
          <option key={subject} value={subject}>
            {subject}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SubjectSelector;
