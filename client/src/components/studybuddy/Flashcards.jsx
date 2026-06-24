import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Sparkles, Copy, Loader2 } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import ragService from "../../services/ragService";
import FlashcardItem from "./FlashcardItem";
import EmptyState from "../common/EmptyState";

/**
 * Flashcards component.
 * Integrates with RAG service to generate exactly 10 flashcards
 * and displays them in a responsive, interactive grid.
 */
export const Flashcards = ({ subject }) => {
  const { student } = useAuth();
  
  // Flashcards state
  const [flashcardsList, setFlashcardsList] = useState([]);

  // API hook integration
  const { loading, execute: fetchFlashcards } = useApi(ragService.generateFlashcards);

  // Clear list if subject changes to ensure they generate for the new subject
  useEffect(() => {
    setFlashcardsList([]);
  }, [subject]);

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
    
    const result = await fetchFlashcards(student.student_id, subject);
    
    toast.dismiss("fc-load");

    if (result.success) {
      setFlashcardsList(result.data);
      toast.success("Successfully generated 10 interactive flashcards!");
      
      // Update global dashboard statistics
      const currentCount = parseInt(localStorage.getItem("cf_flashcards_count") || "0", 10);
      localStorage.setItem("cf_flashcards_count", (currentCount + 10).toString());
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
            <Copy className="h-4 w-4 text-primary dark:text-primary-400" />
            Subject Flashcards: <span className="text-primary dark:text-primary-400">{subject}</span>
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Generate customized revision flashcards based directly on your uploaded notes.
          </p>
        </div>

        {flashcardsList.length > 0 && (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-600 rounded-lg shadow-md shadow-primary/10 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? (
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
      {loading && flashcardsList.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-80 bg-white dark:bg-slate-950 border border-gray-255 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Analyzing notes...
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 max-w-xs text-center mt-1 leading-relaxed">
            The AI Study Buddy is extracting key concepts from your **{subject}** notes to create study cards.
          </p>
        </div>
      ) : flashcardsList.length === 0 ? (
        <div className="p-12 bg-white dark:bg-slate-950 border border-gray-255 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center">
          <div className="p-3 bg-gray-50 dark:bg-slate-900 text-gray-400 dark:text-slate-600 rounded-2xl mb-4">
            <Copy className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Generate revision flashcards
          </h3>
          <p className="text-xs sm:text-sm text-gray-550 dark:text-slate-400 max-w-md mt-1.5 leading-relaxed">
            Quickly test your retention of **{subject}**. Click below to generate exactly 10 premium 3D study cards directly from your uploaded content.
          </p>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="mt-6 flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-600 rounded-lg shadow-lg shadow-primary/15 transition-all duration-200"
          >
            <Sparkles className="h-4 w-4" />
            Generate 10 Flashcards
          </button>
        </div>
      ) : (
        /* Flashcards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {flashcardsList.map((card, idx) => (
            <FlashcardItem
              key={idx}
              index={idx}
              question={card.question}
              answer={card.answer}
            />
          ))}
        </div>
      )}

    </div>
  );
};

export default Flashcards;
