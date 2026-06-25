const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();
const ragController = require("../controllers/ragController");

// Ingest lecture notes (Paste): POST /api/rag/ingest
router.post("/ingest", ragController.ingestNotes);

// Ask question from notes (Legacy / Compatibility): POST /api/rag/ask
router.post("/ask", ragController.askQuestion);

// Analyze academic notices: POST /api/rag/notice/analyze
router.post("/notice/analyze", ragController.analyzeNotice);

// Upload notes in multiple formats (File): POST /api/rag/upload
router.post("/upload", upload.single("file"), ragController.uploadNote);

// =====================================================================
// MULTI-SUBJECT SYNCHRONIZED RAG ENDPOINTS
// =====================================================================

// Get all subjects: GET /api/rag/subjects
router.get("/subjects", ragController.getSubjects);

// Get specific subject metadata: GET /api/rag/subjects/:id
router.get("/subjects/:id", ragController.getSubjectById);

// Get subject summary: GET /api/rag/subjects/:id/summary
router.get("/subjects/:id/summary", ragController.getSubjectSummary);

// Get subject chat history: GET /api/rag/subjects/:id/chat
router.get("/subjects/:id/chat", ragController.getSubjectChat);

// Get subject flashcards: GET /api/rag/subjects/:id/flashcards
router.get("/subjects/:id/flashcards", ragController.getSubjectFlashcards);

// Get subject quizzes: GET /api/rag/subjects/:id/quizzes
router.get("/subjects/:id/quizzes", ragController.getSubjectQuizzes);

// Send message to subject chat: POST /api/rag/chat
router.post("/chat", ragController.postChat);

// Generate subject summary: POST /api/rag/generate-summary
router.post("/generate-summary", ragController.generateSummary);

// Generate subject flashcards: POST /api/rag/generate-flashcards
router.post("/generate-flashcards", ragController.generateFlashcards);

// Generate subject quiz: POST /api/rag/generate-quiz
router.post("/generate-quiz", ragController.generateQuiz);

module.exports = router;
