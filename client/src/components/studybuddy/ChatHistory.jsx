import React from "react";
import { MessageSquare, Trash2, Clock, BookOpen } from "lucide-react";

export const ChatHistory = ({ subject, history, onSelectQuestion, onClearHistory }) => {
  return (
    <div className="flex flex-col h-full bg-panel border-r border-border w-64 shrink-0 overflow-hidden select-none">
      
      {/* Subject details header */}
      <div className="p-4 border-b border-border space-y-1 bg-panel2">
        <span className="text-[9px] font-bold text-muted uppercase tracking-widest block font-heading">
          Subject Scope
        </span>
        <div className="flex items-center gap-2 text-txt">
          <BookOpen className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm font-bold truncate">{subject || "General Study"}</span>
        </div>
      </div>

      {/* History items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        <div className="flex items-center justify-between text-[10px] font-bold text-muted uppercase tracking-wider px-2">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Recent Questions
          </span>
          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-muted hover:text-red-500 transition-colors p-0.5 rounded"
              title="Clear Session History"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-8 px-4 space-y-2">
            <MessageSquare className="w-8 h-8 text-muted mx-auto" />
            <p className="text-xs text-muted leading-relaxed">
              No questions asked in this session yet.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {history.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onSelectQuestion(idx)}
                className="w-full flex items-start gap-2 px-2.5 py-2 rounded-[4px] text-left text-xs font-medium text-txt hover:text-primary hover:bg-panel2 border border-transparent hover:border-border transition-all duration-150 truncate group"
              >
                <MessageSquare className="w-3.5 h-3.5 mt-0.5 text-muted group-hover:text-primary shrink-0" />
                <span className="truncate flex-1">{item.question}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer System Info */}
      <div className="p-3 border-t border-border bg-panel2 text-center">
        <span className="text-[9px] font-semibold text-muted tracking-wide uppercase block">
          CampusFlow AI Engine v1.1
        </span>
      </div>

    </div>
  );
};

export default ChatHistory;
