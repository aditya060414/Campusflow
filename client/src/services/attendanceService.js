import api from "./api";

/**
 * Attendance API service.
 * Sends x-student-id header (from mock login localStorage)
 * since the app uses a simple student_id / name auth — no JWT.
 */

const getHeaders = () => {
  try {
    const student = JSON.parse(localStorage.getItem("student") || "{}");
    const id = student?.student_id || "";
    return id ? { "x-student-id": id } : {};
  } catch {
    return {};
  }
};

// ── Timetable ──────────────────────────────────────────────────────────────

export const fetchTimetable = () =>
  api.get("/attendance/timetable", { headers: getHeaders() });

export const createTimetable = (timetable) =>
  api.post("/attendance/timetable", timetable, { headers: getHeaders() });

export const updateTimetable = (timetable) =>
  api.put("/attendance/timetable", timetable, { headers: getHeaders() });

// ── Daily Attendance ───────────────────────────────────────────────────────

export const markAttendance = (date, records) =>
  api.post("/attendance/mark", { date, records }, { headers: getHeaders() });

export const editAttendance = (date, records) =>
  api.put("/attendance/mark", { date, records }, { headers: getHeaders() });

export const fetchAttendanceByDate = (date) =>
  api.get(`/attendance/date/${date}`, { headers: getHeaders() });

// ── Summary ────────────────────────────────────────────────────────────────

export const fetchSummary = () =>
  api.get("/attendance/summary", { headers: getHeaders() });

export const fetchHistory = () =>
  api.get("/attendance/history", { headers: getHeaders() });
