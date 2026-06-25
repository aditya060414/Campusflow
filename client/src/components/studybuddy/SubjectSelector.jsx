import React from "react";
import { BookOpen } from "lucide-react";

/**
 * SubjectSelector dropdown component to select the active subject scope
 * for RAG operations (Ask AI, Flashcards, Quiz).
 */
export const SubjectSelector = ({ subjects, activeSubject, onChange }) => {
  if (!subjects || subjects.length === 0) {
    return (
      <div className="flex items-center gap-2 text-[11px] text-primary bg-primary/10 px-3 py-1.5 rounded-[4px] border border-primary/20 font-bold uppercase tracking-wider font-display">
        <span>No subjects uploaded yet. Go to "Notes Upload" first!</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 font-body">
      <label
        htmlFor="subject-select"
        className="text-[12px] font-bold text-muted uppercase tracking-widest font-display flex items-center gap-1.5"
      >
        <BookOpen className="h-4 w-4 text-primary stroke-[1.75]" />
        Subject:
      </label>
      <select
        id="subject-select"
        value={activeSubject || ""}
        onChange={(e) => onChange(e.target.value)}
        className="block w-40 sm:w-48 text-[13px] py-1.5 px-3 rounded-[4px] border border-border bg-panel text-txt focus:outline-none focus:border-primary transition-colors duration-150"
      >
        {subjects.map((subject) => (
          <option key={subject.id} value={subject.id}>
            {subject.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SubjectSelector;
