/**
 * SkillProfile Model
 * 
 * Computed summary of a student's current skill level.
 * Updated incrementally as the student makes submissions.
 * One document per user.
 */

const mongoose = require('mongoose');

// Progress for a single language or topic
const skillEntrySchema = new mongoose.Schema(
  {
    // The skill name (e.g. "python", "Arrays", "Loops")
    name: { type: String, required: true },
    // Number of problems attempted that involve this skill
    attempted: { type: Number, default: 0 },
    // Number of problems solved correctly  
    solved: { type: Number, default: 0 },
    // Number of errors made in this skill area
    errorCount: { type: Number, default: 0 },
  },
  { _id: false }
);

// Breakdown of each error type the student has made
const errorPatternSchema = new mongoose.Schema(
  {
    errorType: { type: String, required: true },
    count: { type: Number, default: 0 },
    // Number of times the student successfully corrected this mistake
    correctedCount: { type: Number, default: 0 },
    lastSeen: { type: Date, default: Date.now },
    lastCorrectedDate: { type: Date, default: null },
    // Number of distinct problems this error appeared in
    distinctProblems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
  },
  { _id: false }
);

const skillProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    // Per-language stats
    languages: [skillEntrySchema],
    // Per-topic stats (Arrays, Strings, Loops, etc.)
    topics: [skillEntrySchema],
    // Recurring error patterns
    errorPatterns: [errorPatternSchema],
    // Overall stats
    totalSolved: { type: Number, default: 0 },
    totalAttempts: { type: Number, default: 0 },
    // Accuracy = totalSolved / totalAttempts (as a percentage)
    accuracy: { type: Number, default: 0 },
    // Current consecutive day learning streak
    streak: { type: Number, default: 0 },
    // Date of most recent activity
    lastActiveDate: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SkillProfile', skillProfileSchema);
