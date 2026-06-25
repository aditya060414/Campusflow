const ragService = require("../services/ragService");
const subjectStore = require("../services/subjectStore");

/**
 * Controller to handle all CampusFlow RAG operations.
 * Coordinates with the service proxy layer and subject persistence store.
 */
const ragController = {
  /**
   * Ingest student lecture notes.
   * Path: POST /api/rag/ingest
   */
  ingestNotes: async (req, res, next) => {
    console.log("===> IngestNotes called with:", req.body);
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
      const cleanStudentId = student_id.trim();
      const cleanSubjectName = subject.trim();
      const subjectId = cleanSubjectName.toUpperCase();

      const data = await ragService.ingestNotes(
        cleanStudentId,
        cleanSubjectName,
        notes.trim()
      );

      // Register the subject in the local store
      subjectStore.saveSubject(cleanStudentId, {
        id: subjectId,
        name: cleanSubjectName,
        uploadStatus: "completed",
        vectorizationStatus: "ready",
        uploadedFiles: ["Pasted Notes"]
      });

      // Clear previous chat history for this subject
      subjectStore.clearChat(cleanStudentId, subjectId);

      // Automatically trigger and cache notes summary in the background
      try {
        const sumResult = await ragService.generateSummary(cleanStudentId, subjectId);
        subjectStore.saveSubject(cleanStudentId, {
          id: subjectId,
          summary: sumResult.summary
        });
      } catch (sumErr) {
        console.error("Auto summary generation failed:", sumErr.message);
      }

      return res.json({
        subjectId,
        subjectName: cleanSubjectName,
        indexedChunks: data.chunks_stored,
        chunks_stored: data.chunks_stored,
        status: "ready",
        success: true,
        source_type: "text",
        filename: "Pasted Notes Content",
        detected_topics: ["Study Review", "Manual Lecture Notes", "Academic Summary"]
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Upload a note file (PDF, TXT, Image) for multi-format knowledge ingestion.
   * Path: POST /api/rag/upload
   */
  uploadNote: async (req, res, next) => {
    const { student_id, subject } = req.body;
    const file = req.file;

    // Validation
    if (!student_id || !student_id.trim()) {
      return res.status(400).json({ success: false, message: "student_id is required." });
    }
    if (!subject || !subject.trim()) {
      return res.status(400).json({ success: false, message: "subject is required." });
    }
    if (!file) {
      return res.status(400).json({ success: false, message: "file is required." });
    }

    try {
      const cleanStudentId = student_id.trim();
      const cleanSubjectName = subject.trim();
      const subjectId = cleanSubjectName.toUpperCase();

      const data = await ragService.uploadNote(
        cleanStudentId,
        cleanSubjectName,
        file
      );

      // Register the subject in the local store
      subjectStore.saveSubject(cleanStudentId, {
        id: subjectId,
        name: cleanSubjectName,
        uploadStatus: "completed",
        vectorizationStatus: "ready",
        uploadedFiles: [file.originalname]
      });

      // Clear previous chat history for this subject
      subjectStore.clearChat(cleanStudentId, subjectId);

      // Automatically trigger and cache notes summary in the background
      try {
        const sumResult = await ragService.generateSummary(cleanStudentId, subjectId);
        subjectStore.saveSubject(cleanStudentId, {
          id: subjectId,
          summary: sumResult.summary
        });
      } catch (sumErr) {
        console.error("Auto summary generation failed:", sumErr.message);
      }

      return res.json({
        subjectId,
        subjectName: cleanSubjectName,
        indexedChunks: data.chunks_stored,
        chunks_stored: data.chunks_stored,
        status: "ready",
        success: true,
        source_type: data.source_type,
        filename: data.filename,
        detected_topics: data.detected_topics
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all subjects for a student.
   * Path: GET /api/rag/subjects
   */
  getSubjects: async (req, res, next) => {
    const { student_id } = req.query;
    if (!student_id) {
      return res.status(400).json({ success: false, message: "student_id query parameter is required." });
    }
    try {
      const subjects = subjectStore.getSubjects(student_id.trim());
      return res.json(subjects);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get a specific subject by ID.
   * Path: GET /api/rag/subjects/:id
   */
  getSubjectById: async (req, res, next) => {
    const { student_id } = req.query;
    const { id } = req.params;
    if (!student_id) {
      return res.status(400).json({ success: false, message: "student_id query parameter is required." });
    }
    try {
      const subject = subjectStore.getSubject(student_id.trim(), id.toUpperCase());
      if (!subject) {
        return res.status(404).json({ success: false, message: "Subject not found." });
      }
      return res.json(subject);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get summary for a subject.
   * Path: GET /api/rag/subjects/:id/summary
   */
  getSubjectSummary: async (req, res, next) => {
    const { student_id } = req.query;
    const { id } = req.params;
    if (!student_id) {
      return res.status(400).json({ success: false, message: "student_id query parameter is required." });
    }
    try {
      const cleanStudentId = student_id.trim();
      const subjectId = id.toUpperCase();
      
      const subject = subjectStore.getSubject(cleanStudentId, subjectId);
      if (!subject) {
        return res.status(404).json({ success: false, message: "Subject not found." });
      }

      // If summary is missing, generate it on the fly and cache it
      if (!subject.summary) {
        try {
          const sumResult = await ragService.generateSummary(cleanStudentId, subjectId);
          subject.summary = sumResult.summary;
          subjectStore.saveSubject(cleanStudentId, { id: subjectId, summary: subject.summary });
        } catch (sumErr) {
          console.error("Deferred summary generation failed:", sumErr.message);
        }
      }

      return res.json({ summary: subject.summary || "No summary available for this subject." });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get chat history for a subject.
   * Path: GET /api/rag/subjects/:id/chat
   */
  getSubjectChat: async (req, res, next) => {
    const { student_id } = req.query;
    const { id } = req.params;
    if (!student_id) {
      return res.status(400).json({ success: false, message: "student_id query parameter is required." });
    }
    try {
      const subject = subjectStore.getSubject(student_id.trim(), id.toUpperCase());
      return res.json(subject ? subject.chatHistory || [] : []);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get flashcards for a subject.
   * Path: GET /api/rag/subjects/:id/flashcards
   */
  getSubjectFlashcards: async (req, res, next) => {
    const { student_id } = req.query;
    const { id } = req.params;
    if (!student_id) {
      return res.status(400).json({ success: false, message: "student_id query parameter is required." });
    }
    try {
      const subject = subjectStore.getSubject(student_id.trim(), id.toUpperCase());
      return res.json(subject ? subject.flashcards || [] : []);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get quizzes for a subject.
   * Path: GET /api/rag/subjects/:id/quizzes
   */
  getSubjectQuizzes: async (req, res, next) => {
    const { student_id } = req.query;
    const { id } = req.params;
    if (!student_id) {
      return res.status(400).json({ success: false, message: "student_id query parameter is required." });
    }
    try {
      const subject = subjectStore.getSubject(student_id.trim(), id.toUpperCase());
      return res.json(subject ? subject.quizzes || [] : []);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Post a new chat question.
   * Path: POST /api/rag/chat
   */
  postChat: async (req, res, next) => {
    const { student_id, subjectId, question } = req.body;

    if (!student_id || !student_id.trim()) {
      return res.status(400).json({ success: false, message: "student_id is required." });
    }
    if (!subjectId || !subjectId.trim()) {
      return res.status(400).json({ success: false, message: "subjectId is required." });
    }
    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: "question is required." });
    }

    try {
      const cleanStudentId = student_id.trim();
      const normalizedSubjectId = subjectId.trim().toUpperCase();

      const data = await ragService.askQuestion(
        cleanStudentId,
        question.trim(),
        normalizedSubjectId
      );

      // Save to local subject chat history
      subjectStore.addChatMessage(
        cleanStudentId,
        normalizedSubjectId,
        question.trim(),
        data.answer,
        data.answerSource,
        data.sources
      );

      return res.json({
        answer: data.answer,
        answerSource: data.answerSource,
        sources: data.sources
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Generate and cache subject summary.
   * Path: POST /api/rag/generate-summary
   */
  generateSummary: async (req, res, next) => {
    const { student_id, subjectId } = req.body;

    if (!student_id || !student_id.trim()) {
      return res.status(400).json({ success: false, message: "student_id is required." });
    }
    if (!subjectId || !subjectId.trim()) {
      return res.status(400).json({ success: false, message: "subjectId is required." });
    }

    try {
      const cleanStudentId = student_id.trim();
      const normalizedSubjectId = subjectId.trim().toUpperCase();

      const data = await ragService.generateSummary(cleanStudentId, normalizedSubjectId);

      subjectStore.saveSubject(cleanStudentId, {
        id: normalizedSubjectId,
        summary: data.summary
      });

      return res.json(data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Generate and cache study flashcards.
   * Path: POST /api/rag/generate-flashcards
   */
  generateFlashcards: async (req, res, next) => {
    const { student_id, subjectId } = req.body;

    if (!student_id || !student_id.trim()) {
      return res.status(400).json({ success: false, message: "student_id is required." });
    }
    if (!subjectId || !subjectId.trim()) {
      return res.status(400).json({ success: false, message: "subjectId is required." });
    }

    try {
      const cleanStudentId = student_id.trim();
      const normalizedSubjectId = subjectId.trim().toUpperCase();

      const data = await ragService.generateFlashcards(cleanStudentId, normalizedSubjectId);

      subjectStore.saveSubject(cleanStudentId, {
        id: normalizedSubjectId,
        flashcards: data
      });

      return res.json(data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Generate and cache multiple choice quiz.
   * Path: POST /api/rag/generate-quiz
   */
  generateQuiz: async (req, res, next) => {
    const { student_id, subjectId } = req.body;

    if (!student_id || !student_id.trim()) {
      return res.status(400).json({ success: false, message: "student_id is required." });
    }
    if (!subjectId || !subjectId.trim()) {
      return res.status(400).json({ success: false, message: "subjectId is required." });
    }

    try {
      const cleanStudentId = student_id.trim();
      const normalizedSubjectId = subjectId.trim().toUpperCase();

      const data = await ragService.generateQuiz(cleanStudentId, normalizedSubjectId);

      subjectStore.saveSubject(cleanStudentId, {
        id: normalizedSubjectId,
        quizzes: data
      });

      return res.json(data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Ask a general question (deprecating but kept for compatibility).
   * Path: POST /api/rag/ask
   */
  askQuestion: async (req, res, next) => {
    const { student_id, question } = req.body;

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
