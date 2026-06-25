import React from "react";
import ReactMarkdown from "react-markdown";
import {
  Sparkles,
  HelpCircle,
  BookOpen,
  Brain,
  RefreshCw,
  Terminal,
} from "lucide-react";

export const ChatMessage = ({
  question,
  answer,
  answerSource,
  sources,
  timestamp,
  loading,
}) => {
  const getSourceBadge = (source) => {
    const s = source || "general";
    switch (s) {
      case "notes":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-[4px] bg-panel2 text-primary border border-border text-[10px] font-bold font-heading tracking-wide uppercase">
            📚 Notes Based
          </span>
        );
      case "hybrid":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-[4px] bg-panel2 text-txt border border-border text-[10px] font-bold font-heading tracking-wide uppercase">
            🔄 Hybrid Answer
          </span>
        );
      case "general":
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-[4px] bg-panel2 text-muted border border-border text-[10px] font-bold font-heading tracking-wide uppercase">
            🧠 General Knowledge
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-2">
      {/* 1. Student Question */}
      <div className="flex items-start gap-4">
        <div className="h-9 w-9 rounded-[4px] bg-panel2 border border-border flex items-center justify-center text-muted shrink-0">
          <HelpCircle className="w-4.5 h-4.5" />
        </div>
        <div className="flex-1 space-y-1 pt-1.5">
          <h4 className="text-xs font-bold text-muted uppercase tracking-wider font-heading">
            Your Question
          </h4>
          <p className="text-base font-semibold text-txt leading-relaxed">
            {question}
          </p>
        </div>
        <span className="text-[10px] text-muted font-semibold pt-2">
          {timestamp}
        </span>
      </div>

      {/* 2. AI Response */}
      <div className="flex items-start gap-4 border-b border-border pb-6">
        <div className="h-9 w-9 rounded-[4px] bg-panel2 border border-border flex items-center justify-center text-primary shrink-0">
          <Sparkles className="w-4.5 h-4.5" />
        </div>

        <div className="flex-1 space-y-3 pt-1">
          <div className="flex items-center justify-between gap-4 w-full">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider font-heading flex items-center gap-1">
              AI Tutor Response
            </h4>
            {!loading && getSourceBadge(answerSource)}
          </div>

          {loading ? (
            <div className="flex items-center gap-2.5 py-4 text-muted">
              <LoaderSpinner />
              <span className="text-xs font-medium animate-pulse">
                Formulating complete answer from vector context...
              </span>
            </div>
          ) : (
            /* Rich Markdown Formatting Container */
            <div className="prose prose-zinc dark:prose-invert max-w-none text-sm leading-relaxed text-txt space-y-4 font-normal">
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => (
                    <h1
                      className="text-lg font-bold font-heading text-txt mt-4 mb-2 border-b border-border pb-1"
                      {...props}
                    />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2
                      className="text-base font-bold font-heading text-txt mt-3 mb-1.5"
                      {...props}
                    />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3
                      className="text-sm font-bold font-heading text-txt mt-2 mb-1"
                      {...props}
                    />
                  ),
                  p: ({ node, ...props }) => (
                    <p
                      className="mb-3 leading-relaxed text-txt"
                      {...props}
                    />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc pl-5 space-y-1 mb-3" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol
                      className="list-decimal pl-5 space-y-1 mb-3"
                      {...props}
                    />
                  ),
                  li: ({ node, ...props }) => (
                    <li
                      className="text-txt"
                      {...props}
                    />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote
                      className="border-l-4 border-primary bg-panel2 pl-4 py-1.5 pr-2 rounded-r-[4px] italic my-3 text-muted"
                      {...props}
                    />
                  ),
                  code: ({ node, inline, className, children, ...props }) => {
                    return (
                      <code
                        className="px-1.5 py-0.5 rounded-[4px] bg-panel2 text-primary border border-border font-mono text-xs font-semibold"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  pre: ({ node, ...props }) => (
                    <pre
                      className="p-4 rounded-[4px] bg-panel border border-border font-mono text-xs text-txt overflow-x-auto my-4 relative flex flex-col gap-2"
                      {...props}
                    />
                  ),
                  table: ({ node, ...props }) => (
                    <div className="overflow-x-auto my-4 rounded-[4px] border border-border">
                      <table
                        className="min-w-full divide-y divide-border text-xs text-left"
                        {...props}
                      />
                    </div>
                  ),
                  th: ({ node, ...props }) => (
                    <th
                      className="px-4 py-3 bg-panel2 text-txt font-bold uppercase tracking-wider"
                      {...props}
                    />
                  ),
                  td: ({ node, ...props }) => (
                    <td
                      className="px-4 py-3 border-t border-border text-muted"
                      {...props}
                    />
                  ),
                }}
              >
                {answer}
              </ReactMarkdown>
            </div>
          )}

          {/* Source Citation Footer */}
          {!loading && (
            <div className="flex items-center justify-between pt-2 text-[10px] text-muted font-semibold border-t border-border mt-2">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                Cited Sources:{" "}
                <strong className="text-txt">
                  {sources} context chunks
                </strong>
              </span>
              <span>{timestamp}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const LoaderSpinner = () => (
  <span className="flex h-4 w-4 relative shrink-0">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
    <span className="relative inline-flex rounded-full h-4 w-4 bg-primary flex items-center justify-center">
      <RefreshCw className="w-2.5 h-2.5 text-white animate-spin" />
    </span>
  </span>
);

export default ChatMessage;
