import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import {
  MessageSquare,
  Send,
  BookOpen,
  Loader2,
  Sparkles,
  Maximize2,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useStudyBuddy } from "../../context/StudyBuddyContext";
import EmptyState from "../common/EmptyState";
import QuickActionChips from "./QuickActionChips";

export const AskQuestion = ({ subject }) => {
  const { student } = useAuth();
  const navigate = useNavigate();

  const { chats, summaries, loading, sendChatMessage, triggerGenerateSummary } =
    useStudyBuddy();

  // Local input query state
  const [query, setQuery] = useState("");

  // Collapsible summary panel state
  const [isSummaryOpen, setIsSummaryOpen] = useState(true);

  const messagesEndRef = useRef(null);

  // Active chat history for the selected subject from context
  const chatHistory = chats[subject] || [];
  const summary = summaries[subject] || "";

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, loading.chat]);

  // If no subject is active
  if (!subject) {
    return (
      <EmptyState
        title="No study subjects found"
        description="You need to upload and process lecture notes before you can ask questions. Head over to the 'Notes Upload' tab to get started!"
      />
    );
  }

  const handleAsk = async (textToSend) => {
    const currentQuery = (textToSend || query).trim();
    if (!currentQuery) return;

    if (currentQuery.length < 5) {
      toast.error("Your question must be at least 5 characters.");
      return;
    }

    setQuery(""); // Clear input early for clean chat UX

    // Call centralized context chat action
    await sendChatMessage(student.student_id, currentQuery);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleAsk();
  };

  const handleTabSwitch = (targetTab) => {
    navigate(`/dashboard/study-buddy?tab=${targetTab}`);
  };

  const handleGenerateSummaryClick = () => {
    toast.loading(
      "AI is analyzing subject notes to generate a study summary...",
      { id: "sum-load" },
    );
    triggerGenerateSummary(student.student_id).finally(() => {
      toast.dismiss("sum-load");
    });
  };

  // Helper to render source badges
  const renderSourceBadge = (source) => {
    const s = source || "general";
    switch (s) {
      case "hybrid":
        return (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] bg-purple-500/10 text-purple-500 border border-purple-500/20 text-[9px] font-bold uppercase tracking-wider font-display">
            🔄 Hybrid Answer
          </span>
        );
      case "notes":
        return (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] bg-primary/10 text-primary border border-primary/20 text-[9px] font-bold uppercase tracking-wider font-display">
            📚 Notes Based
          </span>
        );
      case "general":
      default:
        return (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] bg-panel2 text-muted border border-border text-[9px] font-bold uppercase tracking-wider font-display">
            🧠 General Knowledge
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-6 animate-fade-in font-body">
      {/* Subject Badge Banner */}
      <div className="flex items-center justify-between gap-4 p-3.5 bg-panel2 border border-border rounded-[4px] text-xs sm:text-sm text-txt">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen className="h-4 w-4 shrink-0 text-primary" />
          <span className="truncate">
            Target Knowledge Base:{" "}
            <span className="font-bold text-primary font-display">
              {subject}
            </span>
          </span>
        </div>
        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-[4px] border border-primary/20 uppercase shrink-0 tracking-wider font-display">
          Vectorized
        </span>
      </div>

      {/* 📖 Premium Collapsible Academic Summary Panel */}
      <div className="bg-panel border border-border rounded-lg overflow-hidden transition-all duration-200">
        <button
          onClick={() => setIsSummaryOpen(!isSummaryOpen)}
          className="w-full flex items-center justify-between px-5 py-3.5 bg-panel hover:bg-panel2 transition-colors border-b border-border"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-xs sm:text-sm font-bold text-txt font-display">
              Academic Summary of {subject}
            </span>
          </div>
          {isSummaryOpen ? (
            <ChevronUp className="w-4.5 h-4.5 text-muted" />
          ) : (
            <ChevronDown className="w-4.5 h-4.5 text-muted" />
          )}
        </button>

        {isSummaryOpen && (
          <div className="p-5 animate-fade-in space-y-4">
            {loading.summary ? (
              <div className="flex items-center gap-2 py-4 text-muted">
                <Loader2 className="h-4.5 w-4.5 animate-spin text-primary" />
                <span className="text-xs font-medium animate-pulse">
                  Formulating study summary from lecture notes...
                </span>
              </div>
            ) : summary ? (
              <div className="prose prose-invert prose-sm max-w-none text-txt max-h-56 overflow-y-auto pr-2 scrollbar-thin">
                <ReactMarkdown>{summary}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <p className="text-xs text-muted">
                  No summary cached for this subject notes yet. Click below to compose one.
                </p>
                <button
                  onClick={handleGenerateSummaryClick}
                  className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-[4px] px-3 py-1.5 text-xs font-bold transition-all font-display"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate Subject Summary
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Conversation Area */}
      <div className="bg-panel border border-border rounded-lg flex flex-col h-[480px] overflow-hidden relative">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-panel">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <span className="font-bold text-sm sm:text-base text-txt font-display">
              AI Study Mentor
            </span>
          </div>

          {/* Maximize Expand button */}
          <button
            type="button"
            onClick={() =>
              navigate(`/dashboard/study-buddy/fullscreen?subject=${subject}`)
            }
            className="p-2 rounded-[4px] hover:bg-panel2 text-muted hover:text-txt transition-colors border border-transparent hover:border-border"
            title="Open Full Screen Workspace"
          >
            <Maximize2 className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Dialogue Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-panel2">
          {chatHistory.length === 0 ? (
            /* Centered Empty State */
            <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center space-y-5 animate-fade-in">
              <div className="p-4 bg-primary/10 text-primary rounded-[4px] border border-primary/20">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold text-txt font-display tracking-tight">
                  Ask anything from your notes...
                </h3>
                <p className="text-xs sm:text-sm text-muted leading-relaxed font-normal">
                  The AI mentor is ready. Ask questions, request summaries, or request study material generated directly from your vector index.
                </p>
              </div>

              <div className="pt-2">
                <span className="text-[10px] font-bold text-muted tracking-wider uppercase block mb-3 font-display">
                  Quick Actions
                </span>
                <QuickActionChips
                  onChipClick={handleAsk}
                  onTabSwitch={handleTabSwitch}
                />
              </div>
            </div>
          ) : (
            /* Chat messages */
            <div className="space-y-6">
              {chatHistory.map((chat, idx) => (
                <div key={idx} className="space-y-4 animate-fade-in">
                  {/* Student Question Bubble */}
                  <div className="flex justify-end">
                    <div className="max-w-[80%] bg-primary text-white rounded-lg rounded-tr-none px-4 py-3 text-[14px] leading-relaxed font-medium">
                      <p>{chat.question}</p>
                      <span className="text-[9px] text-white/80 block text-right mt-1.5 font-semibold font-display">
                        {chat.timestamp}
                      </span>
                    </div>
                  </div>

                  {/* AI Response Bubble */}
                  <div className="flex justify-start">
                    <div className="max-w-[85%] bg-panel border border-border rounded-lg rounded-tl-none px-4 py-3 text-[14px] space-y-3 relative">
                      <div className="flex items-center justify-between gap-4 w-full border-b border-border pb-2.5">
                        <div className="flex items-center gap-1.5 text-xs text-primary font-bold font-display">
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>AI Mentor</span>
                        </div>
                        {!chat.loading && renderSourceBadge(chat.answerSource)}
                      </div>

                      {chat.loading ? (
                        <div className="flex items-center gap-2 py-2 text-muted">
                          <Loader2 className="h-4.5 w-4.5 animate-spin text-primary" />
                          <span className="text-xs font-medium animate-pulse">
                            Searching vector database and composing answer...
                          </span>
                        </div>
                      ) : (
                        <div className="text-txt leading-relaxed whitespace-pre-line text-[14px]">
                          {chat.answer}
                        </div>
                      )}

                      {/* Source Citation Badge */}
                      {!chat.loading && (
                        <div className="flex items-center justify-between border-t border-border pt-2 text-[9px] text-muted font-bold font-display">
                          <span>
                            Cited:{" "}
                            <strong className="text-txt">
                              {chat.sources} context chunks
                            </strong>
                          </span>
                          <span>{chat.timestamp}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {loading.chat &&
                chatHistory[chatHistory.length - 1]?.loading === false && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] bg-panel border border-border rounded-lg rounded-tl-none px-4 py-3 text-[14px] space-y-3">
                      <div className="flex items-center gap-2 py-2 text-muted">
                        <Loader2 className="h-4.5 w-4.5 animate-spin text-primary" />
                        <span className="text-xs font-medium animate-pulse">
                          AI Study Mentor is typing...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Query Input Bar */}
        <div className="p-4 border-t border-border bg-panel space-y-3">
          {chatHistory.length > 0 && (
            <div className="flex items-center gap-2 animate-fade-in overflow-x-auto pb-1">
              <QuickActionChips
                onChipClick={handleAsk}
                onTabSwitch={handleTabSwitch}
              />
            </div>
          )}

          <form
            onSubmit={handleFormSubmit}
            className="flex gap-2 relative items-center"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading.chat}
              placeholder={`Ask anything about ${subject}...`}
              className="flex-1 px-4 py-2.5 rounded-[4px] border border-border bg-panel text-txt placeholder-muted text-[14px] focus:outline-none focus:border-primary transition-colors duration-150"
            />
            <button
              type="submit"
              disabled={loading.chat || !query.trim()}
              className="px-4 py-2.5 rounded-[4px] bg-primary border border-primary text-white hover:bg-[#1D4ED8] transition-colors duration-150 flex items-center justify-center disabled:opacity-45 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AskQuestion;
