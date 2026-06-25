/**
 * Attendance Controller
 * Uses MongoDB (via Mongoose) when MONGO_URI is set; falls back to
 * in-memory Maps so the module works even without a DB connection.
 */

const mongoose = require("mongoose");
const TimetableModel = require("../models/Timetable");
const AttendanceModel = require("../models/Attendance");

const DAYS = ["mon","tue","wed","thu","fri","sat"];

// ── Fallback in-memory stores (used when MongoDB is not connected) ──────────
const _tt  = new Map(); // studentId → timetable object
const _att = new Map(); // studentId → [ { date, dayKey, records } ]

const dbReady = () =>
  mongoose.connection.readyState === 1; // 1 = connected

// ═══════════════════════════════════════════════════════════
// TIMETABLE
// ═══════════════════════════════════════════════════════════

/** GET /api/attendance/timetable */
const getTimetable = async (req, res) => {
  const sid = req.user.id;
  try {
    if (dbReady()) {
      const doc = await TimetableModel.findOne({ studentId: sid }).lean();
      return res.json({ success: true, timetable: doc ? _stripMeta(doc) : null });
    }
    return res.json({ success: true, timetable: _tt.get(sid) || null });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/** POST /api/attendance/timetable — create */
const createTimetable = async (req, res) => {
  const sid = req.user.id;
  const tt  = _buildTT(req.body);
  if (!tt) return res.status(400).json({ success: false, message: "Invalid timetable. Add at least one subject." });

  try {
    if (dbReady()) {
      const exists = await TimetableModel.findOne({ studentId: sid });
      if (exists) return res.status(400).json({ success: false, message: "Timetable already exists. Use PUT to update." });
      const doc = await TimetableModel.create({ studentId: sid, ...tt });
      return res.status(201).json({ success: true, message: "Timetable created.", timetable: _stripMeta(doc.toObject()) });
    }
    if (_tt.has(sid)) return res.status(400).json({ success: false, message: "Timetable already exists. Use PUT to update." });
    _tt.set(sid, tt);
    return res.status(201).json({ success: true, message: "Timetable created.", timetable: tt });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/** PUT /api/attendance/timetable — update/upsert */
const updateTimetable = async (req, res) => {
  const sid = req.user.id;
  const tt  = _buildTT(req.body);
  if (!tt) return res.status(400).json({ success: false, message: "Invalid timetable." });

  try {
    if (dbReady()) {
      const doc = await TimetableModel.findOneAndUpdate(
        { studentId: sid },
        { ...tt },
        { new: true, upsert: true }
      );
      return res.json({ success: true, message: "Timetable updated.", timetable: _stripMeta(doc.toObject()) });
    }
    _tt.set(sid, tt);
    return res.json({ success: true, message: "Timetable updated.", timetable: tt });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ═══════════════════════════════════════════════════════════
// DAILY ATTENDANCE
// ═══════════════════════════════════════════════════════════

/** POST /api/attendance/mark */
const markAttendance = async (req, res) => {
  const sid = req.user.id;
  const { date, dayKey, records } = req.body;

  const err = _validateMark(date, records);
  if (err) return res.status(400).json({ success: false, message: err });

  try {
    if (dbReady()) {
      const exists = await AttendanceModel.findOne({ studentId: sid, date });
      if (exists) return res.status(409).json({ success: false, message: "Already marked. Use PUT to edit.", alreadyMarked: true, existing: exists });
      const doc = await AttendanceModel.create({ studentId: sid, date, dayKey: dayKey || "", records: _cleanRecords(records) });
      return res.status(201).json({ success: true, message: "Attendance marked.", entry: doc });
    }
    // In-memory
    const list = _att.get(sid) || [];
    if (list.find(a => a.date === date)) return res.status(409).json({ success: false, message: "Already marked.", alreadyMarked: true });
    const entry = { date, dayKey: dayKey || "", records: _cleanRecords(records), markedAt: new Date().toISOString() };
    list.push(entry);
    _att.set(sid, list);
    return res.status(201).json({ success: true, message: "Attendance marked.", entry });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/** PUT /api/attendance/mark — edit a past date */
const editAttendance = async (req, res) => {
  const sid = req.user.id;
  const { date, dayKey, records } = req.body;

  const err = _validateMark(date, records);
  if (err) return res.status(400).json({ success: false, message: err });

  try {
    if (dbReady()) {
      const doc = await AttendanceModel.findOneAndUpdate(
        { studentId: sid, date },
        { records: _cleanRecords(records), dayKey: dayKey || "", editedAt: new Date() },
        { new: true, upsert: true }
      );
      return res.json({ success: true, message: "Attendance updated.", entry: doc });
    }
    const list = _att.get(sid) || [];
    const idx  = list.findIndex(a => a.date === date);
    const entry = { date, dayKey: dayKey||"", records: _cleanRecords(records), markedAt: idx !== -1 ? list[idx].markedAt : new Date().toISOString(), editedAt: new Date().toISOString() };
    if (idx !== -1) list[idx] = entry; else list.push(entry);
    _att.set(sid, list);
    return res.json({ success: true, message: "Attendance updated.", entry });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/attendance/date/:date */
const getAttendanceByDate = async (req, res) => {
  const sid  = req.user.id;
  const { date } = req.params;
  try {
    if (dbReady()) {
      const doc = await AttendanceModel.findOne({ studentId: sid, date }).lean();
      return res.json({ success: true, entry: doc || null });
    }
    const list  = _att.get(sid) || [];
    return res.json({ success: true, entry: list.find(a => a.date === date) || null });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/attendance/history — all marked days */
const getHistory = async (req, res) => {
  const sid = req.user.id;
  try {
    if (dbReady()) {
      const docs = await AttendanceModel.find({ studentId: sid }).sort({ date: -1 }).lean();
      return res.json({ success: true, history: docs });
    }
    const list = (_att.get(sid) || []).slice().sort((a,b)=>b.date.localeCompare(a.date));
    return res.json({ success: true, history: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ═══════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════

/** GET /api/attendance/summary */
const getSummary = async (req, res) => {
  const sid = req.user.id;
  try {
    let records = [];
    if (dbReady()) {
      records = await AttendanceModel.find({ studentId: sid }).lean();
    } else {
      records = _att.get(sid) || [];
    }
    return res.json({ success: true, summary: _computeSummary(records) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/attendance/all-at-risk — internal for n8n */
const getAllAtRisk = async (req, res) => {
  try {
    const atRisk = [];
    if (dbReady()) {
      const studentIds = await AttendanceModel.distinct("studentId");
      for (const sid of studentIds) {
        const records = await AttendanceModel.find({ studentId: sid }).lean();
        _computeSummary(records).forEach(s => {
          if (s.percentage < 85) atRisk.push({ studentId: sid, ...s });
        });
      }
    } else {
      for (const [sid, records] of _att.entries()) {
        _computeSummary(records).forEach(s => {
          if (s.percentage < 85) atRisk.push({ studentId: sid, ...s });
        });
      }
    }
    return res.json({ success: true, atRisk });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

const _buildTT = (body) => {
  if (!body || typeof body !== "object") return null;
  const tt = {};
  let any = false;
  for (const d of DAYS) {
    const arr = Array.isArray(body[d]) ? body[d] : [];
    tt[d] = arr.filter(c=>c.subject?.trim()).map(c=>({ subject:c.subject.trim(), start:c.start||"", end:c.end||"" }));
    if (tt[d].length) any = true;
  }
  return any ? tt : null;
};

const _validateMark = (date, records) => {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return "date must be YYYY-MM-DD.";
  if (!Array.isArray(records) || records.length === 0) return "records[] is required.";
  for (const r of records) {
    if (!r.subject || !["present","absent"].includes(r.status)) return `Invalid record: ${JSON.stringify(r)}`;
  }
  return null;
};

const _cleanRecords = (records) => records.map(r=>({ subject:r.subject.trim(), status:r.status }));

const _stripMeta = (obj) => {
  const { _id, __v, studentId, createdAt, updatedAt, ...rest } = obj;
  return rest;
};

const _computeSummary = (dayRecords) => {
  const map = {};
  for (const day of dayRecords) {
    for (const r of (day.records||[])) {
      if (!map[r.subject]) map[r.subject] = { total:0, present:0 };
      map[r.subject].total++;
      if (r.status === "present") map[r.subject].present++;
    }
  }
  return Object.entries(map).map(([subject,s])=>{
    const pct = s.total ? Math.round((s.present/s.total)*100) : 0;
    const needed = pct >= 75 ? 0 : Math.ceil((0.75*s.total - s.present)/0.25);
    return { subject, total:s.total, present:s.present, absent:s.total-s.present, percentage:pct, classesNeeded:needed };
  });
};

module.exports = { getTimetable, createTimetable, updateTimetable, markAttendance, editAttendance, getAttendanceByDate, getHistory, getSummary, getAllAtRisk };
