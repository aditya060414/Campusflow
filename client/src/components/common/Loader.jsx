import React from "react";
import { Loader2 } from "lucide-react";

/**
 * Reusable animated Loader spinner with message support,
 * aligning with both light and dark themes.
 */
export const Loader = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary dark:text-primary-400" />
      <p className="text-sm font-medium text-gray-500 dark:text-slate-400 animate-pulse">
        {message}
      </p>
    </div>
  );
};

export default Loader;
