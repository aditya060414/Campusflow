import api from "./api";

/**
 * Service layer to interact with the CampusFlow backend API,
 * which proxies requests to the Python FastAPI RAG microservice.
 */
const ragService = {
  /**
   * Upload and ingest notes into the RAG system (Paste Text).
   */
  uploadNotes: async (student_id, subject, notes) => {
    const response = await api.post("/rag/ingest", {
      student_id,
      subject,
      notes,
    });
    return response.data;
  },

  /**
   * Upload a note file (PDF, TXT, Image) for multi-format knowledge ingestion.
   */
  uploadNote: async (student_id, subject, file) => {
    const formData = new FormData();
    formData.append("student_id", student_id);
    formData.append("subject", subject);
    formData.append("file", file);

    const response = await api.post("/rag/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Analyze an academic notice and extract a structured summary, deadlines, tasks, and priority.
   */
  analyzeNotice: async (notice_text) => {
    const response = await api.post("/rag/notice/analyze", {
      notice_text,
    });
    return response.data;
  },

  // =====================================================================
  // NEW MULTI-SUBJECT SYNCHRONIZED ENDPOINTS
  // =====================================================================

  /**
   * Get all subjects for a student.
   */
  getSubjects: async (student_id) => {
    const response = await api.get("/rag/subjects", {
      params: { student_id }
    });
    return response.data;
  },

  /**
   * Get summary for a specific subject.
   */
  getSubjectSummary: async (student_id, subjectId) => {
    const response = await api.get(`/rag/subjects/${subjectId}/summary`, {
      params: { student_id }
    });
    return response.data;
  },

  /**
   * Get chat history for a specific subject.
   */
  getSubjectChat: async (student_id, subjectId) => {
    const response = await api.get(`/rag/subjects/${subjectId}/chat`, {
      params: { student_id }
    });
    return response.data;
  },

  /**
   * Get flashcards for a specific subject.
   */
  getSubjectFlashcards: async (student_id, subjectId) => {
    const response = await api.get(`/rag/subjects/${subjectId}/flashcards`, {
      params: { student_id }
    });
    return response.data;
  },

  /**
   * Get quizzes for a specific subject.
   */
  getSubjectQuizzes: async (student_id, subjectId) => {
    const response = await api.get(`/rag/subjects/${subjectId}/quizzes`, {
      params: { student_id }
    });
    return response.data;
  },

  /**
   * Send a message to a subject-specific chat.
   */
  sendChatMessage: async (student_id, subjectId, question) => {
    const response = await api.post("/rag/chat", {
      student_id,
      subjectId,
      question
    });
    return response.data;
  },

  /**
   * Generate and cache subject summary.
   */
  generateSummary: async (student_id, subjectId) => {
    const response = await api.post("/rag/generate-summary", {
      student_id,
      subjectId
    });
    return response.data;
  },

  /**
   * Generate and cache subject flashcards.
   */
  generateFlashcards: async (student_id, subjectId) => {
    const response = await api.post("/rag/generate-flashcards", {
      student_id,
      subjectId
    });
    return response.data;
  },

  /**
   * Generate and cache subject quiz.
   */
  generateQuiz: async (student_id, subjectId) => {
    const response = await api.post("/rag/generate-quiz", {
      student_id,
      subjectId
    });
    return response.data;
  },

  // Legacy compatibility bindings
  askQuestion: async (student_id, question) => {
    const response = await api.post("/rag/ask", {
      student_id,
      question,
    });
    return response.data;
  },
};

export default ragService;
