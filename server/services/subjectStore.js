const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data");
const DATA_FILE = path.join(DATA_DIR, "subjects.json");

/**
 * Ensures that the data directory and subjects JSON file exist.
 */
function ensureStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({}, null, 2), "utf8");
  }
}

/**
 * Reads the entire subjects database from the JSON file.
 * Keyed by studentId, then by subjectId.
 */
function readData() {
  try {
    ensureStorage();
    const content = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(content || "{}");
  } catch (error) {
    console.error("Failed to read subjects file:", error);
    return {};
  }
}

/**
 * Writes the subjects database to the JSON file.
 */
function writeData(data) {
  try {
    ensureStorage();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Failed to write subjects file:", error);
  }
}

const subjectStore = {
  /**
   * Get all subjects for a student.
   * @param {string} studentId
   * @returns {Array} List of subjects
   */
  getSubjects: (studentId) => {
    const data = readData();
    const studentData = data[studentId] || {};
    return Object.values(studentData);
  },

  /**
   * Get a specific subject for a student.
   * @param {string} studentId
   * @param {string} subjectId
   * @returns {Object|null} The subject object or null
   */
  getSubject: (studentId, subjectId) => {
    const data = readData();
    const studentData = data[studentId] || {};
    return studentData[subjectId] || null;
  },

  /**
   * Save or update a subject.
   * @param {string} studentId
   * @param {Object} subjectData
   */
  saveSubject: (studentId, subjectData) => {
    const data = readData();
    if (!data[studentId]) {
      data[studentId] = {};
    }
    const subjectId = subjectData.id;
    
    // Merge existing subject data to preserve summaries, chats, etc., if not explicitly overwritten
    const existing = data[studentId][subjectId] || {
      id: subjectId,
      name: subjectData.name || subjectId,
      uploadStatus: "completed",
      vectorizationStatus: "ready",
      uploadedFiles: [],
      summary: "",
      chatHistory: [],
      flashcards: [],
      quizzes: [],
      metadata: {}
    };

    const updated = {
      ...existing,
      ...subjectData,
      // Ensure arrays don't get accidentally overwritten with undefined
      uploadedFiles: subjectData.uploadedFiles || existing.uploadedFiles,
      summary: subjectData.summary !== undefined ? subjectData.summary : existing.summary,
      chatHistory: subjectData.chatHistory || existing.chatHistory,
      flashcards: subjectData.flashcards || existing.flashcards,
      quizzes: subjectData.quizzes || existing.quizzes,
      metadata: { ...existing.metadata, ...(subjectData.metadata || {}) }
    };

    data[studentId][subjectId] = updated;
    writeData(data);
    return updated;
  },

  /**
   * Appends a message to a subject's chat history.
   */
  addChatMessage: (studentId, subjectId, question, answer, answerSource, sources) => {
    const data = readData();
    if (!data[studentId] || !data[studentId][subjectId]) {
      throw new Error(`Subject ${subjectId} not found for student ${studentId}`);
    }

    const subject = data[studentId][subjectId];
    if (!subject.chatHistory) {
      subject.chatHistory = [];
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    subject.chatHistory.push({
      question,
      answer,
      answerSource,
      sources,
      timestamp,
      loading: false
    });

    // Limit to last 20 messages for consistency
    if (subject.chatHistory.length > 20) {
      subject.chatHistory = subject.chatHistory.slice(-20);
    }

    writeData(data);
    return subject.chatHistory;
  },

  /**
   * Clears the chat history of a subject.
   */
  clearChat: (studentId, subjectId) => {
    const data = readData();
    if (data[studentId] && data[studentId][subjectId]) {
      data[studentId][subjectId].chatHistory = [];
      writeData(data);
    }
  }
};

module.exports = subjectStore;
