import React, { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import {
  UploadCloud,
  FileText,
  BookOpen,
  Loader2,
  FileCode,
  Image as ImageIcon,
  Trash2,
  CheckCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Plus,
} from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import ragService from "../../services/ragService";

export const NotesUpload = ({ onIngestionSuccess }) => {
  const { student } = useAuth();

  // Active mode: 'file' | 'paste'
  const [uploadMode, setUploadMode] = useState("file");

  // Form states
  const [subject, setSubject] = useState("");
  const [notesText, setNotesText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);

  // Success data state for rendering the Success Card
  const [successData, setSuccessData] = useState(null);

  // Validation errors
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  // Drag handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    const ext = file.name.split(".").pop().toLowerCase();
    const supported = ["pdf", "txt", "png", "jpg", "jpeg"];

    if (!supported.includes(ext)) {
      toast.error(
        `Unsupported file type '.${ext}'. Please upload PDF, TXT, or PNG/JPG images.`,
      );
      return;
    }

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit.");
      return;
    }

    setSelectedFile(file);
    setErrors((prev) => ({ ...prev, file: null }));
    toast.success(`Selected file: ${file.name}`);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validateForm = () => {
    const newErrors = {};
    if (!subject.trim()) {
      newErrors.subject = "Subject name is required";
    } else if (subject.trim().length < 2) {
      newErrors.subject = "Subject name must be at least 2 characters";
    }

    if (uploadMode === "paste") {
      if (!notesText.trim()) {
        newErrors.notes = "Lecture notes content is required";
      } else if (notesText.trim().length < 30) {
        newErrors.notes =
          "Notes must be at least 30 characters to create vector embeddings";
      }
    } else {
      if (!selectedFile) {
        newErrors.file = "Please upload a lecture notes file";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please correct the validation errors.");
      return;
    }

    setLoading(true);
    const loadingToastId = toast.loading(
      uploadMode === "paste"
        ? "AI is vectorizing and indexing your notes..."
        : `Uploading ${selectedFile.name} and extracting text knowledge...`,
      { id: "upload-load" },
    );

    try {
      const cleanSubject = subject.trim().toUpperCase();
      let result;

      if (uploadMode === "paste") {
        // Classic paste text
        const response = await ragService.uploadNotes(
          student.student_id,
          cleanSubject,
          notesText.trim(),
        );
        result = {
          success: true,
          chunks_stored: response.chunks_stored,
          source_type: "text",
          filename: "Pasted Notes Content",
          detected_topics: [
            "Study Review",
            "Manual Lecture Notes",
            "Academic Summary",
          ],
        };
      } else {
        // Multipart file upload
        const response = await ragService.uploadNote(
          student.student_id,
          cleanSubject,
          selectedFile,
        );
        result = {
          success: true,
          chunks_stored: response.chunks_stored,
          source_type: response.source_type,
          filename: response.filename,
          detected_topics: response.detected_topics,
        };
      }

      toast.dismiss(loadingToastId);
      toast.success("Knowledge base successfully updated!");

      // Update state to render Success Card
      setSuccessData(result);

      // Increment global uploaded notes count in localStorage for dashboard stats
      const currentCount = parseInt(
        localStorage.getItem("cf_notes_count") || "0",
        10,
      );
      localStorage.setItem("cf_notes_count", (currentCount + 1).toString());
    } catch (error) {
      toast.dismiss(loadingToastId);
      console.error("Notes upload error:", error);

      // Extract a human-readable error message
      let errorMessage = "Failed to process lecture notes.";
      if (error.response && error.response.data) {
        errorMessage =
          error.response.data.message ||
          error.response.data.detail ||
          errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStartStudying = () => {
    // Notify parent of success, which triggers activeTab to switch to 'ask'
    if (successData) {
      onIngestionSuccess(subject.trim().toUpperCase());
    }
  };

  const handleReset = () => {
    setSuccessData(null);
    setSubject("");
    setNotesText("");
    setSelectedFile(null);
  };

  const getFileIcon = (file) => {
    if (!file) return <UploadCloud className="h-10 w-10 text-zinc-400" />;
    const ext = file.name.split(".").pop().toLowerCase();
    if (ext === "pdf") return <FileText className="h-10 w-10 text-red-500" />;
    if (ext === "txt") return <FileCode className="h-10 w-10 text-blue-500" />;
    return <ImageIcon className="h-10 w-10 text-emerald-500" />;
  };

  const getSourceTypeLabel = (type) => {
    switch (type) {
      case "pdf":
        return "PDF Document";
      case "image":
        return "OCR Extracted Image";
      case "txt":
        return "Plain Text File";
      case "text":
      default:
        return "Pasted Content";
    }
  };

  // =====================================================================
  // RENDER SUCCESS CARD
  // =====================================================================
  if (successData) {
    return (
      <div className="p-6 bg-panel border border-border rounded-lg max-w-xl mx-auto space-y-6 animate-fade-in font-body">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-[18px] sm:text-[20px] font-bold text-txt font-display">
              Knowledge Indexed
            </h2>
            <p className="text-[14px] text-muted mt-1">
              Your materials have been vectorized and stored in the vector database.
            </p>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="p-4 rounded-[4px] bg-panel2 border border-border grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted block font-display">
              Source File
            </span>
            <span className="text-[13px] font-bold text-txt block truncate">
              {successData.filename}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted block font-display">
              Source Format
            </span>
            <span className="text-[13px] font-bold text-txt block">
              {getSourceTypeLabel(successData.source_type)}
            </span>
          </div>
          <div className="space-y-1 col-span-2 pt-2 border-t border-border">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted block font-display">
              Vector Chunks Stored
            </span>
            <span className="text-[20px] font-bold text-primary block font-display">
              {successData.chunks_stored}{" "}
              <span className="text-[12px] text-muted font-normal font-body">
                chunks indexed
              </span>
            </span>
          </div>
        </div>

        {/* AI Detected Topics */}
        <div className="space-y-3">
          <h3 className="text-[12px] font-bold text-muted tracking-widest uppercase flex items-center gap-1.5 font-display">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            AI Detected Topics
          </h3>

          <div className="flex flex-wrap gap-2">
            {successData.detected_topics.map((topic, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-[4px] bg-primary/10 text-primary border border-primary/20 text-xs font-bold font-display uppercase tracking-wider"
              >
                • {topic}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-border flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleStartStudying}
            className="flex-1 flex justify-center items-center gap-2 bg-primary text-white border border-primary rounded-[4px] px-5 py-2.5 text-[14px] font-bold hover:bg-[#1D4ED8] transition-colors duration-150 font-display"
          >
            Ready for Questions
            <ArrowRight className="w-4.5 h-4.5" />
          </button>

          <button
            onClick={handleReset}
            className="bg-transparent text-txt border border-border hover:bg-panel2 rounded-[4px] px-5 py-2.5 text-[14px] font-bold transition-colors duration-150 font-display"
          >
            Upload More
          </button>
        </div>
      </div>
    );
  }

  // =====================================================================
  // RENDER UPLOAD INPUT FORM
  // =====================================================================
  return (
    <div className="p-6 bg-panel border border-border rounded-lg max-w-2xl mx-auto font-body">
      {/* Description Panel */}
      <div className="flex items-start gap-4 mb-6 border-b border-border pb-5">
        <div className="p-3 bg-primary/10 text-primary border border-primary/20 rounded-[4px] shrink-0">
          <UploadCloud className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-[18px] sm:text-[20px] font-bold text-txt font-display">
            Knowledge Base Upload
          </h2>
          <p className="text-[14px] text-muted leading-relaxed">
            Vectorize documents, images (OCR), or text notes. The AI study engine splits, embeds, and indexes them for real-time Q&A.
          </p>
        </div>
      </div>

      {/* Upload mode Selector */}
      <div className="flex p-1 bg-panel2 border border-border rounded-[4px] mb-5">
        <button
          type="button"
          onClick={() => {
            setUploadMode("file");
            setErrors({});
          }}
          className={`flex-1 py-1.5 text-xs sm:text-sm font-bold rounded-[4px] transition-colors duration-150 font-display ${
            uploadMode === "file"
              ? "bg-panel text-txt border border-border"
              : "text-muted hover:text-txt"
          }`}
        >
          📄 Drag & Drop Files
        </button>
        <button
          type="button"
          onClick={() => {
            setUploadMode("paste");
            setErrors({});
          }}
          className={`flex-1 py-1.5 text-xs sm:text-sm font-bold rounded-[4px] transition-colors duration-150 font-display ${
            uploadMode === "paste"
              ? "bg-panel text-txt border border-border"
              : "text-muted hover:text-txt"
          }`}
        >
          📝 Paste Text Notes
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Subject Input (Required for both) */}
        <div>
          <label
            htmlFor="subject"
            className="block text-[12px] font-bold text-muted tracking-widest uppercase mb-1.5 flex items-center gap-1.5 font-display"
          >
            <BookOpen className="h-4 w-4 text-primary" />
            Subject Name
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              if (errors.subject)
                setErrors((prev) => ({ ...prev, subject: null }));
            }}
            disabled={loading}
            className={`block w-full px-3 py-2 rounded-[4px] border bg-panel text-txt placeholder-muted focus:outline-none focus:border-primary transition-colors text-[14px] font-body ${
              errors.subject ? "border-red-500 focus:border-red-500" : "border-border"
            }`}
            placeholder="e.g., OPERATING SYSTEMS"
          />
          {errors.subject && (
            <p className="text-xs text-red-500 mt-1.5 font-display">{errors.subject}</p>
          )}
        </div>

        {/* Dynamic Mode Area */}
        {uploadMode === "file" ? (
          /* File Upload Zone */
          <div className="space-y-2">
            <label className="block text-[12px] font-bold text-muted tracking-widest uppercase mb-1.5 flex items-center gap-1.5 font-display">
              <UploadCloud className="h-4 w-4 text-primary" />
              Upload Study Document / Image
            </label>

            {!selectedFile ? (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
                className={`border border-dashed rounded-[4px] p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-3 ${
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-border bg-panel hover:border-primary"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,.txt,.png,.jpg,.jpeg"
                  className="hidden"
                />

                <UploadCloud className="h-10 w-10 text-muted" />

                <div className="space-y-1">
                  <p className="text-[14px] font-bold text-txt">
                    Drag & Drop Files Here
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    or click to browse your computer
                  </p>
                </div>

                <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-full border border-zinc-200/50 dark:border-zinc-800/50 mt-1 uppercase tracking-wide">
                  PDF • PNG • JPG • TXT (Max 10MB)
                </div>
              </div>
            ) : (
              /* Selected File Display */
              <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/45 animate-fade-in">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200/30 dark:border-zinc-800/40 shrink-0">
                    {getFileIcon(selectedFile)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={removeFile}
                  disabled={loading}
                  className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors shrink-0 disabled:opacity-50"
                  title="Remove File"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}

            {errors.file && (
              <p className="text-xs text-red-500 mt-1">{errors.file}</p>
            )}
          </div>
        ) : (
          /* Paste Text Notes Area */
          <div>
            <label
              htmlFor="notes"
              className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 tracking-wider uppercase mb-1.5 flex items-center gap-1.5 font-heading"
            >
              <FileText className="h-4 w-4 text-sky-500" />
              Lecture Notes Content
            </label>
            <textarea
              id="notes"
              value={notesText}
              onChange={(e) => {
                setNotesText(e.target.value);
                if (errors.notes)
                  setErrors((prev) => ({ ...prev, notes: null }));
              }}
              disabled={loading}
              rows={8}
              className={`block w-full p-4 rounded-xl text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all duration-200 resize-none glass-input ${
                errors.notes ? "border-red-500 focus:ring-red-500" : ""
              }`}
              placeholder="Paste your lecture notes, textbook chapters, or summary sheets here (min. 30 characters)..."
            />
            {errors.notes && (
              <p className="text-xs text-red-500 mt-1.5">{errors.notes}</p>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:opacity-95 shadow-md shadow-sky-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-heading"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Vectorizing & Extracting Knowledge...
            </>
          ) : (
            <>
              <UploadCloud className="h-5 w-5 animate-pulse" />
              Upload and Process notes
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default NotesUpload;
