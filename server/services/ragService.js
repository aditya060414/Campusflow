const axios = require("axios");

// Retrieve RAG Microservice URL from environment
const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || "http://localhost:8001";

/**
 * Handles axios communication errors and returns detailed, friendly messages.
 */
const handleAxiosError = (error, operationName) => {
  if (error.code === "ECONNREFUSED") {
    const err = new Error(
      `Connection to Python RAG service refused. Please verify that the FastAPI microservice is running at ${RAG_SERVICE_URL}.`
    );
    err.status = 502; // Bad Gateway
    throw err;
  }
  
  if (error.response && error.response.data) {
    const detail = error.response.data.detail || error.response.data.message;
    const err = new Error(detail || `RAG service error during ${operationName}`);
    err.status = error.response.status;
    throw err;
  }
  
  const err = new Error(`Failed to communicate with RAG service: ${error.message}`);
  err.status = 500;
  throw err;
};

/**
 * Service proxy layer connecting the Express backend to the FastAPI RAG service.
 */
const ragService = {
  /**
   * Ingest notes text.
   */
  ingestNotes: async (student_id, subject, notes) => {
    try {
      const response = await axios.post(`${RAG_SERVICE_URL}/ingest`, {
        student_id,
        subject,
        notes,
      });
      return response.data;
    } catch (error) {
      handleAxiosError(error, "notes ingestion");
    }
  },

  /**
   * Ask question from notes.
   */
  askQuestion: async (student_id, question) => {
    try {
      const response = await axios.post(`${RAG_SERVICE_URL}/ask`, {
        student_id,
        question,
      });
      return response.data;
    } catch (error) {
      handleAxiosError(error, "answering question");
    }
  },

  /**
   * Generate 10 flashcards.
   */
  generateFlashcards: async (student_id, subject) => {
    try {
      const response = await axios.post(`${RAG_SERVICE_URL}/flashcards`, {
        student_id,
        subject,
      });
      return response.data;
    } catch (error) {
      handleAxiosError(error, "generating flashcards");
    }
  },

  /**
   * Generate 10 MCQ quiz questions.
   */
  generateQuiz: async (student_id, subject) => {
    try {
      const response = await axios.post(`${RAG_SERVICE_URL}/quiz`, {
        student_id,
        subject,
      });
      return response.data;
    } catch (error) {
      handleAxiosError(error, "generating quiz");
    }
  },

  /**
   * Analyze academic circular/notice.
   */
  analyzeNotice: async (notice_text) => {
    try {
      const response = await axios.post(`${RAG_SERVICE_URL}/notice/analyze`, {
        notice_text,
      });
      return response.data;
    } catch (error) {
      handleAxiosError(error, "analyzing notice");
    }
  },
};

module.exports = ragService;
