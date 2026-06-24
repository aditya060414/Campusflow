const express = require("express");
const router = express.Router();
const ragController = require("../controllers/ragController");

// Ingest lecture notes: POST /api/rag/ingest
router.post("/ingest", ragController.ingestNotes);

// Ask question from notes: POST /api/rag/ask
router.post("/ask", ragController.askQuestion);

// Generate 10 flashcards: POST /api/rag/flashcards
router.post("/flashcards", ragController.generateFlashcards);

// Generate 10 MCQs: POST /api/rag/quiz
router.post("/quiz", ragController.generateQuiz);

// Analyze academic notices: POST /api/rag/notice/analyze
router.post("/notice/analyze", ragController.analyzeNotice);

module.exports = router;
