import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Sparkles, CheckSquare, Loader2, Award, RefreshCw, Eye } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import ragService from "../../services/ragService";
import QuizCard from "./QuizCard";
import EmptyState from "../common/EmptyState";

/**
 * QuizGenerator component.
 * Connects with the backend to generate a 10-question MCQ quiz.
 * Tracks responses, calculates scores, and provides custom feedback.
 */
export const QuizGenerator = ({ subject }) => {
  const { student } = useAuth();

  // Quiz state managers
  const [quizList, setQuizList] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showAnswers, setShowAnswers] = useState(false);
  const [score, setScore] = useState(0);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // API hook integration
  const { loading, execute: fetchQuiz } = useApi(ragService.generateQuiz);

  const handleReset = () => {
    setSelectedAnswers({});
    setShowAnswers(false);
    setQuizSubmitted(false);
    setScore(0);
  };

  // Clear states if subject changes
  useEffect(() => {
    handleReset();
    setQuizList([]);
  }, [subject]);

  // If no subject is active
  if (!subject) {
    return (
      <EmptyState
        title="No study subjects found"
        description="You need to upload and process lecture notes before you can generate a mock quiz. Head over to the 'Notes Upload' tab to get started!"
      />
    );
  }

  const handleGenerate = async () => {
    handleReset();
    toast.loading("AI is generating 10 mock exam questions...", { id: "quiz-load" });
    
    const result = await fetchQuiz(student.student_id, subject);
    
    toast.dismiss("quiz-load");

    if (result.success) {
      setQuizList(result.data);
      toast.success("Quiz generated! Test your knowledge.");
    }
  };

  const handleSelectOption = (qIdx, optionLetter) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIdx]: optionLetter,
    }));
  };

  const handleSubmit = () => {
    // Calculate final score
    let correctCount = 0;
    quizList.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) {
        correctCount += 1;
      }
    });

    setScore(correctCount);
    setShowAnswers(true);
    setQuizSubmitted(true);

    toast.success(`Quiz submitted! You scored ${correctCount}/10`);

    // Increment global dashboard statistics
    const currentCount = parseInt(localStorage.getItem("cf_quizzes_count") || "0", 10);
    localStorage.setItem("cf_quizzes_count", (currentCount + 1).toString());
  };



  // Get performance feedback based on score
  const getPerformanceFeedback = (score) => {
    if (score >= 9) {
      return {
        title: "Outstanding! Master Class",
        message: "You have a complete grasp of this subject. You are fully prepared for your exams! Keep maintaining this high level.",
        color: "text-emerald-800 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/25 dark:text-emerald-400 dark:border-emerald-900/50",
      };
    }
    if (score >= 7) {
      return {
        title: "Great Job! Strong Prep",
        message: "You have a solid understanding of these core concepts. Just review the incorrect questions to push yourself to a perfect score!",
        color: "text-blue-800 bg-blue-50 border-blue-200 dark:bg-blue-950/25 dark:text-blue-400 dark:border-blue-900/50",
      };
    }
    if (score >= 5) {
      return {
        title: "Good Effort! Room to Grow",
        message: "You understand the basics! However, we highly recommend heading back to your notes, revising with Flashcards, and retaking the quiz to lock in the details.",
        color: "text-amber-800 bg-amber-50 border-amber-200 dark:bg-amber-950/25 dark:text-amber-400 dark:border-amber-900/50",
      };
    }
    return {
      title: "Revision Highly Recommended",
      message: "It seems some key concepts are still fuzzy. Don't worry, learning takes time! We recommend using the 'Ask AI' tab to clarify difficult topics, reading your notes, and trying again. You can do this!",
      color: "text-red-800 bg-red-50 border-red-200 dark:bg-red-950/25 dark:text-red-400 dark:border-red-900/50",
    };
  };

  const feedback = quizSubmitted ? getPerformanceFeedback(score) : null;
  const unansweredCount = quizList.length - Object.keys(selectedAnswers).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
            <CheckSquare className="h-4 w-4 text-primary dark:text-primary-400" />
            Subject Mock Quiz: <span className="text-primary dark:text-primary-400">{subject}</span>
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Generate a personalized 10-question multiple-choice exam directly from your notes.
          </p>
        </div>

        {quizList.length > 0 && (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-600 rounded-lg shadow-md shadow-primary/10 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Regenerate Quiz
              </>
            )}
          </button>
        )}
      </div>

      {/* Main Display Area */}
      {loading && quizList.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-80 bg-white dark:bg-slate-950 border border-gray-255 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Drafting mock quiz questions...
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 max-w-xs text-center mt-1 leading-relaxed">
            The AI Study Buddy is analyzing your **{subject}** notes to compose highly relevant multiple-choice questions.
          </p>
        </div>
      ) : quizList.length === 0 ? (
        <div className="p-12 bg-white dark:bg-slate-950 border border-gray-255 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center">
          <div className="p-3 bg-gray-50 dark:bg-slate-900 text-gray-400 dark:text-slate-600 rounded-2xl mb-4">
            <CheckSquare className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Start a mock exam
          </h3>
          <p className="text-xs sm:text-sm text-gray-550 dark:text-slate-400 max-w-md mt-1.5 leading-relaxed">
            Ready to test your knowledge? Click below to generate a premium 10-question multiple choice mock exam compiled exclusively from your **{subject}** notes.
          </p>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="mt-6 flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-600 rounded-lg shadow-lg shadow-primary/15 transition-all duration-200"
          >
            <Sparkles className="h-4 w-4" />
            Generate Mock Quiz
          </button>
        </div>
      ) : (
        /* Quiz Active Session */
        <div className="space-y-6">
          
          {/* Performance Feedback Panel */}
          {quizSubmitted && feedback && (
            <div className={`p-6 border rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm animate-fade-in ${feedback.color}`}>
              <div className="p-4 bg-white/20 rounded-xl shrink-0">
                <Award className="h-8 w-8 text-current" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base sm:text-lg font-bold tracking-tight">
                  {feedback.title} — You scored {score} / 10
                </h4>
                <p className="text-xs sm:text-sm leading-relaxed opacity-90">
                  {feedback.message}
                </p>
              </div>
            </div>
          )}

          {/* Quiz Cards Stream */}
          <div className="space-y-6">
            {quizList.map((item, idx) => (
              <QuizCard
                key={idx}
                index={idx}
                question={item.question}
                options={item.options}
                correctAnswer={item.answer}
                selectedOption={selectedAnswers[idx]}
                showAnswers={showAnswers}
                onSelectOption={(letter) => handleSelectOption(idx, letter)}
              />
            ))}
          </div>

          {/* Quiz Action Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm">
            {!quizSubmitted ? (
              <>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {unansweredCount > 0 
                    ? `You have ${unansweredCount} unanswered questions remaining.`
                    : "All questions answered. Ready to submit!"
                  }
                </p>
                
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md shadow-emerald-600/10 transition-all duration-200"
                >
                  <Eye className="h-4 w-4" />
                  Submit and Show Answers
                </button>
              </>
            ) : (
              <>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Quiz finished. You scored **{score}/10** ({Math.round((score/10)*100)}%).
                </p>
                
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-primary hover:bg-gray-50 dark:hover:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg transition-all duration-200"
                >
                  <RefreshCw className="h-4 w-4 animate-spin-slow" />
                  Retake Quiz (Reset Answers)
                </button>
              </>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default QuizGenerator;
