import React, { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useStudyBuddy } from "../context/StudyBuddyContext";
import FullscreenChat from "../components/studybuddy/FullscreenChat";
import EmptyState from "../components/common/EmptyState";

export const StudyBuddyFullscreen = () => {
  const [searchParams] = useSearchParams();
  const { student } = useAuth();
  
  const {
    subjects,
    selectedSubject,
    fetchSubjects
  } = useStudyBuddy();

  // Load subjects on mount and set target subject from query param
  useEffect(() => {
    if (student?.student_id) {
      const subjectParam = searchParams.get("subject");
      const targetSubjectId = subjectParam ? decodeURIComponent(subjectParam).toUpperCase() : null;
      
      fetchSubjects(student.student_id, targetSubjectId);
    }
  }, [student, fetchSubjects, searchParams]);

  // Loading state if subjects are still fetching
  if (subjects.length === 0 && !selectedSubject) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center text-txt select-none">
        <div className="flex items-center gap-2">
          <LoaderSpinner />
          <span className="text-sm font-semibold animate-pulse">Loading Workspace...</span>
        </div>
      </div>
    );
  }

  // If no notes are uploaded yet, render empty state with a return button
  if (subjects.length === 0 || !selectedSubject) {
    return (
      <div className="min-h-screen bg-bg text-txt flex flex-col items-center justify-center p-6 select-none relative">
        <div className="max-w-md w-full relative z-10">
          <EmptyState
            title="Knowledge Base Empty"
            description="You need to ingest notes or textbooks for at least one subject before launching the distraction-free workspace."
          />
          
          <div className="mt-6 text-center">
            <Link
              to="/dashboard/study-buddy?tab=notes"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[4px] bg-primary border border-primary text-white hover:bg-[#1D4ED8] font-bold text-sm transition-colors duration-150"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Upload Notes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-txt">
      <FullscreenChat subject={selectedSubject} />
    </div>
  );
};

const LoaderSpinner = () => (
  <span className="flex h-5 w-5 relative shrink-0">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
    <span className="relative inline-flex rounded-full h-5 w-5 bg-primary"></span>
  </span>
);

export default StudyBuddyFullscreen;
