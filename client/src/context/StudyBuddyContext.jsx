import React, { createContext, useContext, useState, useCallback } from "react";
import ragService from "../services/ragService";
import { toast } from "react-hot-toast";

const StudyBuddyContext = createContext(null);

export const StudyBuddyProvider = ({ children }) => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [summaries, setSummaries] = useState({});
  const [chats, setChats] = useState({});
  const [flashcards, setFlashcards] = useState({});
  const [quizzes, setQuizzes] = useState({});

  // Loading states
  const [loading, setLoading] = useState({
    subjects: false,
    summary: false,
    chat: false,
    flashcards: false,
    quiz: false,
  });

  const updateLoading = useCallback((key, val) => {
    setLoading((prev) => ({ ...prev, [key]: val }));
  }, []);

  /**
   * Fetches all subjects for a student.
   */
  const fetchSubjects = useCallback(async (studentId, autoSelectId = null) => {
    if (!studentId) return;
    updateLoading("subjects", true);
    try {
      const data = await ragService.getSubjects(studentId);
      setSubjects(data);
      
      // Handle automatic selection
      if (autoSelectId) {
        const matched = data.find(s => s.id === autoSelectId.toUpperCase());
        if (matched) {
          setSelectedSubject(matched.id);
          await loadAllSubjectData(studentId, matched.id);
        }
      } else if (data.length > 0 && !selectedSubject) {
        setSelectedSubject(data[0].id);
        await loadAllSubjectData(studentId, data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
      toast.error("Failed to load study subjects.");
    } finally {
      updateLoading("subjects", false);
    }
  }, [selectedSubject, updateLoading]);

  /**
   * Helper to load all data for a selected subject.
   */
  const loadAllSubjectData = async (studentId, subjectId) => {
    if (!studentId || !subjectId) return;
    
    // Fetch summary
    updateLoading("summary", true);
    try {
      const sumResult = await ragService.getSubjectSummary(studentId, subjectId);
      setSummaries((prev) => ({ ...prev, [subjectId]: sumResult.summary }));
    } catch (err) {
      console.error("Failed to load summary:", err);
    } finally {
      updateLoading("summary", false);
    }

    // Fetch chat history
    updateLoading("chat", true);
    try {
      const chatResult = await ragService.getSubjectChat(studentId, subjectId);
      setChats((prev) => ({ ...prev, [subjectId]: chatResult }));
    } catch (err) {
      console.error("Failed to load chat:", err);
    } finally {
      updateLoading("chat", false);
    }

    // Fetch flashcards
    updateLoading("flashcards", true);
    try {
      const fcResult = await ragService.getSubjectFlashcards(studentId, subjectId);
      setFlashcards((prev) => ({ ...prev, [subjectId]: fcResult }));
    } catch (err) {
      console.error("Failed to load flashcards:", err);
    } finally {
      updateLoading("flashcards", false);
    }

    // Fetch quizzes
    updateLoading("quiz", true);
    try {
      const quizResult = await ragService.getSubjectQuizzes(studentId, subjectId);
      setQuizzes((prev) => ({ ...prev, [subjectId]: quizResult }));
    } catch (err) {
      console.error("Failed to load quizzes:", err);
    } finally {
      updateLoading("quiz", false);
    }
  };

  /**
   * Explicitly select a subject and load its associated data.
   */
  const selectSubject = useCallback(async (studentId, subjectId) => {
    if (!studentId || !subjectId) return;
    setSelectedSubject(subjectId);
    await loadAllSubjectData(studentId, subjectId);
  }, []);

  /**
   * Sends a message to the active subject's chat and saves the response.
   */
  const sendChatMessage = useCallback(async (studentId, question) => {
    if (!studentId || !selectedSubject || !question.trim()) return null;
    
    // Add temporary user message to local state instantly
    const userMsg = {
      question: question.trim(),
      answer: null,
      loading: true,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    
    setChats((prev) => ({
      ...prev,
      [selectedSubject]: [...(prev[selectedSubject] || []), userMsg]
    }));

    updateLoading("chat", true);
    try {
      const result = await ragService.sendChatMessage(studentId, selectedSubject, question.trim());
      
      // Update the temporary message with the real answer
      setChats((prev) => {
        const currentList = prev[selectedSubject] || [];
        const updatedList = [...currentList];
        const idx = updatedList.findIndex(m => m.question === question.trim() && m.loading);
        if (idx !== -1) {
          updatedList[idx] = {
            ...updatedList[idx],
            answer: result.answer,
            answerSource: result.answerSource,
            sources: result.sources,
            loading: false
          };
        }
        return { ...prev, [selectedSubject]: updatedList };
      });
      return { success: true, data: result };
    } catch (err) {
      console.error("Chat error:", err);
      // Remove the failed message
      setChats((prev) => ({
        ...prev,
        [selectedSubject]: (prev[selectedSubject] || []).filter(m => !(m.question === question.trim() && m.loading))
      }));
      toast.error("Failed to get answer from AI mentor.");
      return { success: false, error: err };
    } finally {
      updateLoading("chat", false);
    }
  }, [selectedSubject, updateLoading]);

  /**
   * Explicitly triggers summary generation.
   */
  const triggerGenerateSummary = useCallback(async (studentId) => {
    if (!studentId || !selectedSubject) return;
    updateLoading("summary", true);
    try {
      const result = await ragService.generateSummary(studentId, selectedSubject);
      setSummaries((prev) => ({ ...prev, [selectedSubject]: result.summary }));
      toast.success("Summary generated successfully!");
    } catch (err) {
      console.error("Summary generation error:", err);
      toast.error("Failed to generate summary.");
    } finally {
      updateLoading("summary", false);
    }
  }, [selectedSubject, updateLoading]);

  /**
   * Explicitly triggers flashcard generation.
   */
  const triggerGenerateFlashcards = useCallback(async (studentId) => {
    if (!studentId || !selectedSubject) return;
    updateLoading("flashcards", true);
    try {
      const result = await ragService.generateFlashcards(studentId, selectedSubject);
      setFlashcards((prev) => ({ ...prev, [selectedSubject]: result }));
      toast.success("Generated 10 flashcards!");
    } catch (err) {
      console.error("Flashcard generation error:", err);
      toast.error("Failed to generate flashcards.");
    } finally {
      updateLoading("flashcards", false);
    }
  }, [selectedSubject, updateLoading]);

  /**
   * Explicitly triggers quiz generation.
   */
  const triggerGenerateQuiz = useCallback(async (studentId) => {
    if (!studentId || !selectedSubject) return;
    updateLoading("quiz", true);
    try {
      const result = await ragService.generateQuiz(studentId, selectedSubject);
      setQuizzes((prev) => ({ ...prev, [selectedSubject]: result }));
      toast.success("Mock quiz generated!");
    } catch (err) {
      console.error("Quiz generation error:", err);
      toast.error("Failed to generate quiz.");
    } finally {
      updateLoading("quiz", false);
    }
  }, [selectedSubject, updateLoading]);

  return (
    <StudyBuddyContext.Provider
      value={{
        subjects,
        selectedSubject,
        summaries,
        chats,
        flashcards,
        quizzes,
        loading,
        fetchSubjects,
        selectSubject,
        sendChatMessage,
        triggerGenerateSummary,
        triggerGenerateFlashcards,
        triggerGenerateQuiz,
      }}
    >
      {children}
    </StudyBuddyContext.Provider>
  );
};

export const useStudyBuddy = () => {
  const context = useContext(StudyBuddyContext);
  if (!context) {
    throw new Error("useStudyBuddy must be used within a StudyBuddyProvider");
  }
  return context;
};
