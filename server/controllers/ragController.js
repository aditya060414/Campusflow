const ragService = require("../services/ragService");

/**
 * Controller to handle all CampusFlow RAG operations.
 * Validates request parameters and coordinates with the service proxy layer.
 */
const ragController = {
  /**
   * Ingest student lecture notes.
   * Path: POST /api/rag/ingest
   */
  ingestNotes: async (req, res, next) => {
    const { student_id, subject, notes } = req.body;

    // Validation
    if (!student_id || !student_id.trim()) {
      return res.status(400).json({ success: false, message: "student_id is required." });
    }
    if (!subject || !subject.trim()) {
      return res.status(400).json({ success: false, message: "subject is required." });
    }
    if (!notes || !notes.trim()) {
      return res.status(400).json({ success: false, message: "notes content is required." });
    }

    try {
      const data = await ragService.ingestNotes(
        student_id.trim(),
        subject.trim(),
        notes.trim()
      );
      return res.json(data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Ask a question based on notes.
   * Path: POST /api/rag/ask
   */
  askQuestion: async (req, res, next) => {
    const { student_id, question } = req.body;

    // Validation
    if (!student_id || !student_id.trim()) {
      return res.status(400).json({ success: false, message: "student_id is required." });
    }
    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: "question is required." });
    }

    try {
      const data = await ragService.askQuestion(student_id.trim(), question.trim());
      return res.json(data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Generate study flashcards.
   * Path: POST /api/rag/flashcards
   */
  generateFlashcards: async (req, res, next) => {
    const { student_id, subject } = req.body;

    // Validation
    if (!student_id || !student_id.trim()) {
      return res.status(400).json({ success: false, message: "student_id is required." });
    }
    if (!subject || !subject.trim()) {
      return res.status(400).json({ success: false, message: "subject is required." });
    }

    try {
      const data = await ragService.generateFlashcards(student_id.trim(), subject.trim());
      return res.json(data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Generate multiple choice quiz.
   * Path: POST /api/rag/quiz
   */
  generateQuiz: async (req, res, next) => {
    const { student_id, subject } = req.body;

    // Validation
    if (!student_id || !student_id.trim()) {
      return res.status(400).json({ success: false, message: "student_id is required." });
    }
    if (!subject || !subject.trim()) {
      return res.status(400).json({ success: false, message: "subject is required." });
    }

    try {
      const data = await ragService.generateQuiz(student_id.trim(), subject.trim());
      return res.json(data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Analyze an academic circular/notice.
   * Path: POST /api/rag/notice/analyze
   */
  analyzeNotice: async (req, res, next) => {
    const { notice_text } = req.body;

    // Validation
    if (!notice_text || !notice_text.trim()) {
      return res.status(400).json({ success: false, message: "notice_text is required." });
    }

    try {
      const data = await ragService.analyzeNotice(notice_text.trim());
      return res.json(data);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = ragController;
