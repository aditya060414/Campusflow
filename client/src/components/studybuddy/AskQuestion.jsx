import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { MessageSquare, Send, BookOpen, Loader2, Sparkles } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import ragService from "../../services/ragService";
import EmptyState from "../common/EmptyState";

/**
 * AskQuestion component.
 * Provides a conversational RAG chat card interface.
 * Queries student notes and displays responses with source citations.
 */
export const AskQuestion = ({ subject }) => {
  const { student } = useAuth();
  
  // Local input query state
  const [query, setQuery] = useState("");
  
  // Chat dialogue history
  const [chatHistory, setChatHistory] = useState([]);

  // API hook integration
  const { loading, execute: queryRAG } = useApi(ragService.askQuestion);

  // If no subject is selected (e.g. no notes have been uploaded yet)
  if (!subject) {
    return (
      <EmptyState
        title="No study subjects found"
        description="You need to upload and process lecture notes before you can ask questions. Head over to the 'Notes Upload' tab to get started!"
      />
    );
  }

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error("Please enter a question.");
      return;
    }
    if (query.trim().length < 5) {
      toast.error("Your question must be at least 5 characters.");
      return;
    }

    const currentQuery = query.trim();
    setQuery(""); // Clear input early for clean chat UX

    // Call RAG API
    const result = await queryRAG(student.student_id, currentQuery);
    
    if (result.success) {
      // Append Q&A transaction to history
      setChatHistory((prev) => [
        ...prev,
        {
          question: currentQuery,
          answer: result.data.answer,
          sources: result.data.sources,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      toast.success("AI Study Buddy responded!");
    } else {
      // Restore query if API failed
      setQuery(currentQuery);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Subject Badge Banner */}
      <div className="flex items-center gap-2 px-4 py-2 bg-sky-50 dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-sky-800 dark:text-sky-400">
        <BookOpen className="h-4 w-4 shrink-0" />
        <span>You are asking questions based on your notes for: <span className="font-bold">{subject}</span></span>
      </div>

      {/* Conversation Area */}
      <div className="bg-white dark:bg-slate-950 border border-gray-255 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col h-[500px] overflow-hidden">
        
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-gray-150 dark:border-slate-800 flex items-center gap-2 bg-gray-50/50 dark:bg-slate-950/25">
          <MessageSquare className="h-5 w-5 text-primary dark:text-primary-400" />
          <span className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
            AI Study Partner
          </span>
        </div>

        {/* Dialogue Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-gray-50/20 dark:bg-slate-900/10">
          {chatHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="p-3 bg-primary/5 text-primary dark:bg-primary-900/20 dark:text-primary-400 rounded-2xl mb-4 animate-bounce">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Start your study session!
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-450 max-w-sm mt-1">
                Ask anything about **{subject}**. The AI will scan your vectorized notes and formulate answers supported strictly by your text.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {chatHistory.map((chat, idx) => (
                <div key={idx} className="space-y-4 animate-fade-in">
                  
                  {/* Student Question Bubble */}
                  <div className="flex justify-end">
                    <div className="max-w-[85%] bg-primary text-white rounded-2xl rounded-tr-none px-4 py-3 text-sm shadow-sm">
                      <p className="leading-relaxed">{chat.question}</p>
                      <span className="text-[10px] text-sky-100 block text-right mt-1.5 font-medium">
                        {chat.timestamp}
                      </span>
                    </div>
                  </div>

                  {/* AI Response Bubble */}
                  <div className="flex justify-start">
                    <div className="max-w-[85%] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 text-sm shadow-sm space-y-2.5">
                      <div className="flex items-center gap-1.5 text-xs text-primary dark:text-primary-400 font-semibold">
                        <Sparkles className="h-4 w-4" />
                        <span>AI Mentor</span>
                      </div>
                      
                      <p className="text-gray-850 dark:text-slate-205 leading-relaxed whitespace-pre-line">
                        {chat.answer}
                      </p>

                      {/* Source Citation Badge */}
                      <div className="flex items-center justify-between border-t border-gray-100 dark:border-slate-800 pt-2 text-[10px] text-gray-400">
                        <span>Sources cited: <strong className="text-gray-600 dark:text-slate-300">{chat.sources} context chunks</strong></span>
                        <span>{chat.timestamp}</span>
                      </div>
                    </div>
                  </div>

                </div>
              ))}
              
              {/* Show loader inside chat stream while executing */}
              {loading && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 text-sm shadow-sm flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-xs text-gray-500">Searching notes and generating answer...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Query Input Bar */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <form onSubmit={handleAsk} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
              placeholder={`Ask a question about ${subject}...`}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-4 rounded-lg bg-primary hover:bg-primary-600 text-white flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-primary/15"
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
