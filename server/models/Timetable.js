const mongoose = require("mongoose");

/**
 * ClassSlot — a single class entry within a day
 */
const ClassSlotSchema = new mongoose.Schema({
  subject: { type: String, required: true, trim: true },
  start:   { type: String, default: "" },
  end:     { type: String, default: "" },
}, { _id: false });

/**
 * Timetable — one per student, keyed by studentId
 * Stores Mon–Sat class schedules.
 */
const TimetableSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true, index: true },
  mon: { type: [ClassSlotSchema], default: [] },
  tue: { type: [ClassSlotSchema], default: [] },
  wed: { type: [ClassSlotSchema], default: [] },
  thu: { type: [ClassSlotSchema], default: [] },
  fri: { type: [ClassSlotSchema], default: [] },
  sat: { type: [ClassSlotSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model("Timetable", TimetableSchema);
