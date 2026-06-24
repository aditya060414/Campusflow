import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { UploadCloud, FileText, BookOpen, Loader2 } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import ragService from "../../services/ragService";

/**
 * NotesUpload component.
 * Facilitates note submission, splitting, and vector ingestion into the RAG backend.
 * Features full client-side validation and loading indicators.
 */
export const NotesUpload = ({ onIngestionSuccess }) => {
  const { student } = useAuth();

  // Form states
  const [subject, setSubject] = useState("");
  const [notes, setNotes] = useState("");
  
  // Validation errors
  const [errors, setErrors] = useState({});

  // API hook integration
  const { loading, execute: runUpload } = useApi(ragService.uploadNotes);

  const validateForm = () => {
    const newErrors = {};
    if (!subject.trim()) {
      newErrors.subject = "Subject name is required";
    } else if (subject.trim().length < 2) {
      newErrors.subject = "Subject name must be at least 2 characters";
    }

    if (!notes.trim()) {
      newErrors.notes = "Lecture notes content is required";
    } else if (notes.trim().length < 30) {
      newErrors.notes = "Notes must be at least 30 characters to create vector embeddings";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please correct the form validation errors.");
      return;
    }

    // Call API using execute
    const result = await runUpload(
      student.student_id,
      subject.trim().toUpperCase(), // Store subject in clean uppercase
      notes.trim()
    );

    if (result.success) {
      toast.success(
        `Successfully split notes into ${result.data.chunks_stored} vector chunks!`
      );
      // Callback to update parent subject catalog
      onIngestionSuccess(subject.trim().toUpperCase());
      
      // Clear form inputs
      setSubject("");
      setNotes("");
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-950 border border-gray-255 dark:border-slate-800 rounded-2xl shadow-sm transition-all duration-300 max-w-3xl mx-auto">
      
      {/* Description Panel */}
      <div className="flex items-start gap-4 mb-6 border-b border-gray-100 dark:border-slate-900 pb-5">
        <div className="p-3 bg-sky-50 text-sky-600 dark:bg-sky-950/30 dark:text-sky-400 rounded-xl shrink-0">
          <UploadCloud className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
            Upload Lecture Notes
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
            Input notes or textbook excerpts. The AI Study Buddy will partition the text into semantic vectors, generate embeddings, and store them in the collection.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Subject input */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-primary dark:text-primary-400" />
            Subject Name
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              if (errors.subject) setErrors((prev) => ({ ...prev, subject: null }));
            }}
            disabled={loading}
            className={`block w-full px-4 py-2.5 rounded-lg border text-sm bg-white dark:bg-slate-900 text-gray-950 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
              errors.subject
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-200 dark:border-slate-800 focus:ring-primary"
            }`}
            placeholder="e.g., OPERATING SYSTEMS"
          />
          {errors.subject && (
            <p className="text-xs text-red-500 mt-1.5">{errors.subject}</p>
          )}
        </div>

        {/* Notes text area */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-primary dark:text-primary-400" />
            Lecture Notes Content
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              if (errors.notes) setErrors((prev) => ({ ...prev, notes: null }));
            }}
            disabled={loading}
            rows={10}
            className={`block w-full p-4 rounded-lg border text-sm bg-white dark:bg-slate-900 text-gray-950 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none ${
              errors.notes
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-200 dark:border-slate-800 focus:ring-primary"
            }`}
            placeholder="Paste your lecture notes, textbook chapters, or summary sheets here (min. 30 characters)..."
          />
          {errors.notes && (
            <p className="text-xs text-red-500 mt-1.5">{errors.notes}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-slate-950 transition-all duration-200 shadow-md shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Vectorizing & Ingesting Notes...
            </>
          ) : (
            <>
              <UploadCloud className="h-5 w-5" />
              Upload and Process Notes
            </>
          )}
        </button>

      </form>
    </div>
  );
};

export default NotesUpload;
