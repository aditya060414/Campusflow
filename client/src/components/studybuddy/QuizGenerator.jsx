import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Sparkles, CheckSquare, Loader2, Award, RefreshCw, Eye } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useStudyBuddy } from "../../context/StudyBuddyContext";
import QuizCard from "./QuizCard";
import EmptyState from "../common/EmptyState";

/**
 * QuizGenerator component.
 * Connects with the backend to generate a 10-question MCQ quiz.
 * Tracks responses, calculates scores, and provides custom feedback.
 */
export const QuizGenerator = ({ subject }) => {
  const { student } = useAuth();
  const {
    quizzes,
    loading,
    triggerGenerateQuiz
  } = useStudyBuddy();

  // Quiz state managers (answers and submissions are kept local to the session)
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showAnswers, setShowAnswers] = useState(false);
  const [score, setScore] = useState(0);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Active quiz list for the selected subject
  const quizList = quizzes[subject] || [];

  const handleReset = () => {
    setSelectedAnswers({});
    setShowAnswers(false);
    setQuizSubmitted(false);
    setScore(0);
  };

  // Reset local states if subject changes
  useEffect(() => {
    handleReset();
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
    await triggerGenerateQuiz(student.student_id);
    toast.dismiss("quiz-load");
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
        color: "border-emerald-500/40 bg-emerald-500/5 text-txt",
      };
    }
    if (score >= 7) {
      return {
        title: "Great Job! Strong Prep",
        message: "You have a solid understanding of these core concepts. Just review the incorrect questions to push yourself to a perfect score!",
        color: "border-primary/40 bg-primary/5 text-txt",
      };
    }
    if (score >= 5) {
      return {
        title: "Good Effort! Room to Grow",
        message: "You understand the basics! However, we highly recommend heading back to your notes, revising with Flashcards, and retaking the quiz to lock in the details.",
        color: "border-amber-500/40 bg-amber-500/5 text-txt",
      };
    }
    return {
      title: "Revision Highly Recommended",
      message: "It seems some key concepts are still fuzzy. Don't worry, learning takes time! We recommend using the 'Ask AI' tab to clarify difficult topics, reading your notes, and trying again. You can do this!",
      color: "border-red-500/40 bg-red-500/5 text-txt",
    };
  };

  const feedback = quizSubmitted ? getPerformanceFeedback(score) : null;
  const unansweredCount = quizList.length - Object.keys(selectedAnswers).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-panel2 border border-border rounded-lg">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-txt flex items-center gap-1.5">
            <CheckSquare className="h-4 w-4 text-primary" />
            Subject Mock Quiz: <span className="text-primary">{subject}</span>
          </h3>
          <p className="text-xs text-muted">
            Generate a personalized 10-question multiple-choice exam directly from your notes.
          </p>
        </div>

        {quizList.length > 0 && (
          <button
            onClick={handleGenerate}
            disabled={loading.quiz}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-primary border border-primary hover:bg-[#1D4ED8] rounded-[4px] transition-colors duration-150 disabled:opacity-45 disabled:cursor-not-allowed"
          >
            {loading.quiz ? (
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
      {loading.quiz && quizList.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-80 bg-panel border border-border rounded-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-[4px] bg-panel2 text-primary mb-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <h3 className="text-sm font-bold text-txt">
            Drafting mock quiz questions...
          </h3>
          <p className="text-xs text-muted max-w-xs text-center mt-1 leading-relaxed">
            The AI Study Buddy is analyzing your **{subject}** notes to compose highly relevant multiple-choice questions.
          </p>
        </div>
      ) : quizList.length === 0 ? (
        <div className="p-12 bg-panel border border-border rounded-lg flex flex-col items-center justify-center text-center">
          <div className="p-3 bg-panel2 text-muted rounded-[4px] mb-4">
            <CheckSquare className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-txt">
            Start a mock exam
          </h3>
          <p className="text-xs sm:text-sm text-muted max-w-md mt-1.5 leading-relaxed">
            Ready to test your knowledge? Click below to generate a premium 10-question multiple choice mock exam compiled exclusively from your **{subject}** notes.
          </p>
          <button
            onClick={handleGenerate}
            disabled={loading.quiz}
            className="mt-6 flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-primary border border-primary hover:bg-[#1D4ED8] rounded-[4px] transition-colors duration-150"
          >
            <Sparkles className="h-4 w-4" />
            Generate Mock Quiz
          </button>
        </div>
      ) : (
        /* Quiz Active Session */
        <div className="space-y-6 animate-fade-in">
          
          {/* Performance Feedback Panel */}
          {quizSubmitted && feedback && (
            <div className={`p-6 border rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-fade-in ${feedback.color}`}>
              <div className="p-4 bg-panel border border-border rounded-[4px] shrink-0 text-primary">
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
          <div className="space-y-4">
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
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-panel border border-border rounded-lg">
            {!quizSubmitted ? (
              <>
                <p className="text-xs text-muted">
                  {unansweredCount > 0 
                    ? `You have ${unansweredCount} unanswered questions remaining.`
                    : "All questions answered. Ready to submit!"
                  }
                </p>
                
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 border border-emerald-600 hover:bg-emerald-700 rounded-[4px] transition-colors duration-150"
                >
                  <Eye className="h-4 w-4" />
                  Submit and Show Answers
                </button>
              </>
            ) : (
              <>
                <p className="text-xs text-muted">
                  Quiz finished. You scored **{score}/10** ({Math.round((score/10)*100)}%).
                </p>
                
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-txt hover:bg-panel2 border border-border rounded-[4px] transition-colors duration-150"
                >
                  <RefreshCw className="h-4 w-4" />
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
