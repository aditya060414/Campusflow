import React from "react";
import { toast } from "react-hot-toast";
import { Sparkles, Copy, Loader2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useStudyBuddy } from "../../context/StudyBuddyContext";
import FlashcardItem from "./FlashcardItem";
import EmptyState from "../common/EmptyState";

/**
 * Flashcards component.
 * Integrates with RAG service to generate exactly 10 flashcards
 * and displays them in a responsive, interactive grid.
 */
export const Flashcards = ({ subject }) => {
  const { student } = useAuth();
  const {
    flashcards,
    loading,
    triggerGenerateFlashcards
  } = useStudyBuddy();

  // Active flashcard list for the selected subject
  const flashcardsList = flashcards[subject] || [];

  // If no subject is active
  if (!subject) {
    return (
      <EmptyState
        title="No study subjects found"
        description="You need to upload and process lecture notes before you can generate flashcards. Head over to the 'Notes Upload' tab to get started!"
      />
    );
  }

  const handleGenerate = async () => {
    toast.loading("AI is digesting your notes and composing flashcards...", { id: "fc-load" });
    await triggerGenerateFlashcards(student.student_id);
    toast.dismiss("fc-load");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-panel2 border border-border rounded-lg">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-txt flex items-center gap-1.5">
            <Copy className="h-4 w-4 text-primary" />
            Subject Flashcards: <span className="text-primary">{subject}</span>
          </h3>
          <p className="text-xs text-muted">
            Generate customized revision flashcards based directly on your uploaded notes.
          </p>
        </div>

        {flashcardsList.length > 0 && (
          <button
            onClick={handleGenerate}
            disabled={loading.flashcards}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-primary border border-primary hover:bg-[#1D4ED8] rounded-[4px] transition-colors duration-150 disabled:opacity-45 disabled:cursor-not-allowed"
          >
            {loading.flashcards ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Regenerate Cards
              </>
            )}
          </button>
        )}
      </div>

      {/* Main Display Area */}
      {loading.flashcards && flashcardsList.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-80 bg-panel border border-border rounded-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-[4px] bg-panel2 text-primary mb-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <h3 className="text-sm font-bold text-txt">
            Analyzing notes...
          </h3>
          <p className="text-xs text-muted max-w-xs text-center mt-1 leading-relaxed">
            The AI Study Buddy is extracting key concepts from your **{subject}** notes to create study cards.
          </p>
        </div>
      ) : flashcardsList.length === 0 ? (
        <div className="p-12 bg-panel border border-border rounded-lg flex flex-col items-center justify-center text-center">
          <div className="p-3 bg-panel2 text-muted rounded-[4px] mb-4">
            <Copy className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-txt">
            Generate revision flashcards
          </h3>
          <p className="text-xs sm:text-sm text-muted max-w-md mt-1.5 leading-relaxed">
            Quickly test your retention of **{subject}**. Click below to generate exactly 10 premium study cards directly from your uploaded content.
          </p>
          <button
            onClick={handleGenerate}
            disabled={loading.flashcards}
            className="mt-6 flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-primary border border-primary hover:bg-[#1D4ED8] rounded-[4px] transition-colors duration-150"
          >
            <Sparkles className="h-4 w-4" />
            Generate 10 Flashcards
          </button>
        </div>
      ) : (
        /* Flashcards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {flashcardsList.map((card, idx) => (
            <FlashcardItem
              key={idx}
              index={idx}
              question={card.question}
              answer={card.answer}
              difficulty={card.difficulty}
            />
          ))}
        </div>
      )}

    </div>
  );
};

export default Flashcards;
