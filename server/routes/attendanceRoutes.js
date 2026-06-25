const express = require("express");
const router = express.Router();
const {
  getTimetable,
  createTimetable,
  updateTimetable,
  markAttendance,
  editAttendance,
  getAttendanceByDate,
  getHistory,
  getSummary,
  getAllAtRisk,
} = require("../controllers/attendanceController");


// =========================================================================
// LIGHTWEIGHT AUTH MIDDLEWARE
// The Login page stores { student_id, name } only (no JWT).
// We identify users via the x-student-id header sent by the frontend.
// =========================================================================

const requireStudentId = (req, res, next) => {
  const studentId =
    req.headers["x-student-id"] || req.body?.studentId || req.query?.studentId;

  if (!studentId || !String(studentId).trim()) {
    return res.status(401).json({
      success: false,
      message: "x-student-id header is required.",
    });
  }

  // Attach to req.user so controller logic stays unchanged
  req.user = { id: String(studentId).trim() };
  next();
};

// =========================================================================
// TIMETABLE ROUTES
// =========================================================================

/** GET /api/attendance/timetable */
router.get("/timetable", requireStudentId, getTimetable);

/** POST /api/attendance/timetable — create (first time) */
router.post("/timetable", requireStudentId, createTimetable);

/** PUT /api/attendance/timetable — edit / replace */
router.put("/timetable", requireStudentId, updateTimetable);

// =========================================================================
// DAILY ATTENDANCE ROUTES
// =========================================================================

/** POST /api/attendance/mark — submit today's attendance */
router.post("/mark", requireStudentId, markAttendance);

/** PUT /api/attendance/mark — edit attendance for a past date */
router.put("/mark", requireStudentId, editAttendance);

/** GET /api/attendance/date/:date — view attendance for a specific date */
router.get("/date/:date", requireStudentId, getAttendanceByDate);

/** GET /api/attendance/history — all marked days (for all-days view) */
router.get("/history", requireStudentId, getHistory);

// =========================================================================
// SUMMARY ROUTES
// =========================================================================

/** GET /api/attendance/summary — per-subject stats + classesNeeded */
router.get("/summary", requireStudentId, getSummary);

/**
 * GET /api/attendance/all-at-risk
 * Internal route for n8n weekly WhatsApp alerts — no auth required.
 */
router.get("/all-at-risk", getAllAtRisk);

module.exports = router;
