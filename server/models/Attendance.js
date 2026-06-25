const mongoose = require("mongoose");

/**
 * AttendanceRecord — present/absent for one subject on one day
 */
const RecordSchema = new mongoose.Schema({
  subject: { type: String, required: true, trim: true },
  status:  { type: String, enum: ["present", "absent"], required: true },
}, { _id: false });

/**
 * DayAttendance — all subject records for one calendar date
 */
const DayAttendanceSchema = new mongoose.Schema({
  studentId: { type: String, required: true, index: true },
  date:      { type: String, required: true },   // "YYYY-MM-DD"
  dayKey:    { type: String, required: true },   // "mon"|"tue"…
  records:   { type: [RecordSchema], required: true },
  editedAt:  { type: Date, default: null },
}, { timestamps: true });

// Unique per student per date
DayAttendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("DayAttendance", DayAttendanceSchema);
