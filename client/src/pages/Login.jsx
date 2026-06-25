import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { GraduationCap, ArrowRight, User, Hash } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

/**
 * Login page for CampusFlow.
 * Enforces mock login and captures student credentials
 * with client-side form validation.
 */
export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  
  // Validation error states
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!studentId.trim()) {
      newErrors.studentId = "Student ID is required";
    } else if (studentId.trim().length < 2) {
      newErrors.studentId = "Student ID must be at least 2 characters";
    }

    if (!name.trim()) {
      newErrors.name = "Full Name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Full Name must be at least 2 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please correct the errors in the form.");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate minor network delay for premium loader experience
    setTimeout(() => {
      try {
        login({
          student_id: studentId.trim(),
          name: name.trim(),
        });
        toast.success(`Welcome back, ${name.trim()}!`);
        navigate("/dashboard");
      } catch (err) {
        toast.error(err.message || "Login failed");
      } finally {
        setIsSubmitting(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg text-txt transition-colors duration-300 px-4 sm:px-6 lg:px-8">
      
      {/* Visual background accents */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/2 right-0 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-panel rounded-2xl border border-border shadow-xl p-8 transition-colors duration-300">
        
        {/* Branding & Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 mb-4">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-txt">
            Campus<span className="text-primary">Flow</span>
          </h1>
          <p className="text-sm text-muted mt-1">
            Access your AI Study Buddy & RAG tools
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Student ID Field */}
          <div>
            <label htmlFor="studentId" className="block text-sm font-medium text-slate-300 mb-1.5">
              Student ID
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                <Hash className="h-5 w-5" />
              </div>
              <input
                id="studentId"
                type="text"
                value={studentId}
                onChange={(e) => {
                  setStudentId(e.target.value);
                  if (errors.studentId) setErrors((prev) => ({ ...prev, studentId: null }));
                }}
                className={`block w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm bg-bg text-txt placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                  errors.studentId
                    ? "border-red-500 focus:ring-red-500"
                    : "border-border focus:ring-primary"
                }`}
                placeholder="e.g., student_123"
              />
            </div>
            {errors.studentId && (
              <p className="text-xs text-red-500 mt-1.5">{errors.studentId}</p>
            )}
          </div>

          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1.5">
              Full Name
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                <User className="h-5 w-5" />
              </div>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                }}
                className={`block w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm bg-bg text-txt placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                  errors.name
                    ? "border-red-500 focus:ring-red-500"
                    : "border-border focus:ring-primary"
                }`}
                placeholder="e.g., John Doe"
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-500 mt-1.5">{errors.name}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 shadow-md shadow-primary/20 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                {/* Embedded Inline Mini-Spinner */}
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Enter Dashboard
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            )}
          </button>

        </form>

        {/* Footer Info */}
        <div className="mt-8 text-center border-t border-border pt-6">
          <p className="text-xs text-muted">
            For development, enter any Student ID and Name.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
