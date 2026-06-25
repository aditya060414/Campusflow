import React from "react";
import { AlertCircle } from "lucide-react";

/**
 * Reusable EmptyState component to display clean, visual notices
 * when no data is loaded or features are uninitialized.
 */
export const EmptyState = ({ title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-panel border border-border rounded-2xl shadow-sm text-center max-w-lg mx-auto animate-fade-in glass-card">
      <div className="p-4 bg-amber-950/30 text-amber-400 rounded-full mb-4">
        <AlertCircle className="h-8 w-8 shrink-0" />
      </div>
      <h3 className="text-base font-bold text-txt">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-muted max-w-md mt-2 leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default EmptyState;
