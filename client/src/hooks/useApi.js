import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";

/**
 * Reusable hook to handle async API operations with unified loading, error, and data states.
 * Automatically displays a toast notification on failure.
 * 
 * @param {Function} apiFunc - The async function that makes the API request.
 * @returns {Object} An object containing data, loading, error, execute function, and reset helper.
 */
export const useApi = (apiFunc) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiFunc(...args);
        setData(result);
        setLoading(false);
        return { success: true, data: result };
      } catch (err) {
        console.error("API hook execution error:", err);
        
        // Extract a human-readable error message
        let errorMessage = "Something went wrong. Please try again.";
        if (err.response && err.response.data) {
          errorMessage = err.response.data.message || err.response.data.detail || errorMessage;
        } else if (err.message) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        setLoading(false);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [apiFunc]
  );

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    setData,
  };
};

export default useApi;
