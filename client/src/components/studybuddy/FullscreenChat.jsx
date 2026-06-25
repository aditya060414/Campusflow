import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Menu,
  Sparkles,
  BookOpen,
  ChevronLeft,
  Loader2
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useStudyBuddy } from "../../context/StudyBuddyContext";
import ChatHistory from "./ChatHistory";
import ChatMessage from "./ChatMessage";
import QuickActionChips from "./QuickActionChips";
import { toast } from "react-hot-toast";

export const FullscreenChat = ({ subject }) => {
  const { student } = useAuth();
  const navigate = useNavigate();

  const {
    chats,
    loading,
    sendChatMessage
  } = useStudyBuddy();

  // Input query state
  const [query, setQuery] = useState("");
  
  // Mobile sidebar open state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Active chat history from centralized context
  const chatHistory = chats[subject] || [];

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, loading.chat]);

  const handleAsk = async (textToSend) => {
    const currentQuery = (textToSend || query).trim();
    if (!currentQuery) return;

    setQuery(""); // Clear input early

    // Call centralized context chat action
    await sendChatMessage(student.student_id, currentQuery);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAsk();
  };

  const handleClearHistory = () => {
    toast.error("To clear chat history, please upload new notes for this subject, which resets the conversation.");
  };

  const handleSelectQuestion = (idx) => {
    // Scrolls to the message block in the stream
    const container = chatContainerRef.current;
    if (container) {
      const elements = container.querySelectorAll(".animate-fade-in");
      if (elements && elements[idx]) {
        elements[idx].scrollIntoView({ behavior: "smooth", block: "start" });
        setIsSidebarOpen(false); // Close drawer on mobile
      }
    }
  };

  const handleClose = () => {
    navigate(`/dashboard/study-buddy?tab=ask`);
  };

  const handleTabSwitch = (targetTab) => {
    navigate(`/dashboard/study-buddy?tab=${targetTab}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex flex-col bg-bg text-txt overflow-hidden"
    >
      {/* Header Panel */}
      <header className="relative z-20 h-16 border-b border-border bg-panel px-4 sm:px-6 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-3">
          {/* Mobile Sidebar Toggle */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-[4px] hover:bg-panel2 text-muted hover:text-txt transition-colors lg:hidden shrink-0"
            title="Toggle Session History"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-[4px] bg-primary text-white flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-txt font-heading">
                AI Study Buddy
              </h1>
              <p className="text-[10px] text-muted font-semibold tracking-wide uppercase">
                Distraction-Free Workspace
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Active Subject Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-panel2 text-txt border border-border rounded-[4px] text-xs font-bold font-heading">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Subject: {subject}</span>
          </div>

          <button
            onClick={handleClose}
            className="flex items-center gap-1 px-4 py-2 text-xs font-bold text-txt hover:bg-panel2 rounded-[4px] border border-border transition-colors duration-150"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>
      </header>

      {/* Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        
        {/* A. Sidebar History (Desktop Persistent, Mobile Overlay Drawer) */}
        <div className="hidden lg:block">
          <ChatHistory
            subject={subject}
            history={chatHistory}
            onSelectQuestion={handleSelectQuestion}
            onClearHistory={handleClearHistory}
          />
        </div>

        {/* Mobile drawer backdrop */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/40 z-30 lg:hidden"
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "tween", duration: 0.2 }}
                className="fixed top-0 bottom-0 left-0 w-64 bg-panel z-40 lg:hidden border-r border-border"
              >
                <div className="h-16 flex items-center justify-between px-4 border-b border-border bg-panel">
                  <span className="text-sm font-bold text-txt font-heading">
                    Session History
                  </span>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1 rounded-[4px] text-muted hover:text-txt"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>
                <ChatHistory
                  subject={subject}
                  history={chatHistory}
                  onSelectQuestion={handleSelectQuestion}
                  onClearHistory={handleClearHistory}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* B. Main Chat Column */}
        <div className="flex-1 flex flex-col overflow-hidden bg-bg">
          
          {/* Scrollable Dialogue Area */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6"
          >
            {chatHistory.length === 0 ? (
              /* distraction-free centered prompt welcoming user */
              <div className="flex flex-col items-center justify-center min-h-[360px] text-center max-w-lg mx-auto space-y-6 animate-fade-in my-auto">
                <div className="p-4 rounded-[4px] bg-panel2 text-primary border border-border">
                  <Sparkles className="w-10 h-10" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-txt font-heading">
                    Distraction-Free Tutor Workspace
                  </h2>
                  <p className="text-xs sm:text-sm text-muted leading-relaxed font-normal">
                    You are in a dedicated workspace querying the **{subject}** notes. No widgets, no side panels, just you and your AI Mentor. Ask anything.
                  </p>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] font-bold text-muted tracking-wider uppercase block mb-3 font-heading">
                    Quick Actions
                  </span>
                  <QuickActionChips onChipClick={handleAsk} onTabSwitch={handleTabSwitch} />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {chatHistory.map((chat, idx) => (
                  <ChatMessage
                    key={idx}
                    question={chat.question}
                    answer={chat.answer}
                    answerSource={chat.answerSource}
                    sources={chat.sources}
                    timestamp={chat.timestamp}
                    loading={chat.loading}
                  />
                ))}
                
                {loading.chat && chatHistory[chatHistory.length - 1]?.loading === false && (
                  <ChatMessage
                    question="..."
                    answer=""
                    loading={true}
                    timestamp=""
                  />
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Sticky Input Bar at Bottom */}
          <div className="p-4 border-t border-border bg-panel shrink-0">
            <div className="max-w-3xl mx-auto space-y-3">
              {/* Quick Actions above input */}
              {chatHistory.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 animate-fade-in">
                  <QuickActionChips onChipClick={handleAsk} onTabSwitch={handleTabSwitch} />
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex gap-2 relative items-center">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={loading.chat}
                  placeholder={`Ask anything about your ${subject} notes...`}
                  className="flex-1 px-4 py-3 rounded-[4px] border border-border bg-panel text-txt placeholder-muted text-[14px] focus:outline-none focus:border-primary transition-colors duration-150 font-medium"
                />
                
                <button
                  type="submit"
                  disabled={loading.chat || !query.trim()}
                  className="px-5 py-3 rounded-[4px] bg-primary border border-primary text-white hover:bg-[#1D4ED8] flex items-center justify-center transition-colors duration-150 disabled:opacity-45 disabled:cursor-not-allowed shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>

        </div>

      </div>

    </motion.div>
  );
};

export default FullscreenChat;
