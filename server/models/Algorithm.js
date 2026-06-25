const mongoose = require("mongoose");

const algorithmSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  pseudoCode: { type: String },
  spaceComplexity: { type: String },
  bestTime: { type: String },
  worstTime: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Algorithm", algorithmSchema);
