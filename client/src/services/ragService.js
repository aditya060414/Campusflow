import api from "./api";

/**
 * Service layer to interact with the CampusFlow backend API,
 * which proxies requests to the Python FastAPI RAG microservice.
 */
const ragService = {
  /**
   * Upload and ingest notes into the RAG system.
   * @param {string} student_id - Unique student ID.
   * @param {string} subject - Subject name.
   * @param {string} notes - Full text of the lecture notes.
   * @returns {Promise<Object>} Status and number of chunks stored.
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
   * Ask a question based on the student's ingested notes.
   * @param {string} student_id - Unique student ID.
   * @param {string} question - Question text.
   * @returns {Promise<Object>} The generated answer and source chunks used.
   */
  askQuestion: async (student_id, question) => {
    const response = await api.post("/rag/ask", {
      student_id,
      question,
    });
    return response.data;
  },

  /**
   * Generate exactly 10 flashcards from the notes of a specific subject.
   * @param {string} student_id - Unique student ID.
   * @param {string} subject - Subject name.
   * @returns {Promise<Array>} Array of 10 flashcard items.
   */
  generateFlashcards: async (student_id, subject) => {
    const response = await api.post("/rag/flashcards", {
      student_id,
      subject,
    });
    return response.data;
  },

  /**
   * Generate exactly 10 MCQs from the notes of a specific subject.
   * @param {string} student_id - Unique student ID.
   * @param {string} subject - Subject name.
   * @returns {Promise<Array>} Array of 10 quiz items.
   */
  generateQuiz: async (student_id, subject) => {
    const response = await api.post("/rag/quiz", {
      student_id,
      subject,
    });
    return response.data;
  },

  /**
   * Analyze an academic notice and extract a structured summary, deadlines, tasks, and priority.
   * @param {string} notice_text - The raw text of the notice.
   * @returns {Promise<Object>} Structured notice analysis response.
   */
  analyzeNotice: async (notice_text) => {
    const response = await api.post("/rag/notice/analyze", {
      notice_text,
    });
    return response.data;
  },
};

export default ragService;
