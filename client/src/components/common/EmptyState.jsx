import React from "react";
import { AlertCircle } from "lucide-react";

/**
 * Reusable EmptyState component to display clean, visual notices
 * when no data is loaded or features are uninitialized.
 */
export const EmptyState = ({ title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-950 border border-gray-255 dark:border-slate-800 rounded-2xl shadow-sm text-center max-w-lg mx-auto animate-fade-in">
      <div className="p-4 bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 rounded-full mb-4">
        <AlertCircle className="h-8 w-8 shrink-0" />
      </div>
      <h3 className="text-base font-bold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 max-w-md mt-2 leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default EmptyState;
