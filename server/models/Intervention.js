/**
 * Intervention Model
 *
 * Stores student responses to targeted mini-challenges for recurring mistake patterns.
 * Keyed per (userId, mistakeCategory) globally — one record per mistake type.
 * Session-scoping (one popup per session) is enforced in the service layer
 * using the sessionShown array, which is a lightweight log of sessions
 * where the intervention was already triggered.
 */

const mongoose = require('mongoose');

const sessionShownSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attempt',
      required: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
    },
    shownAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const interventionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    mistakeCategory: {
      type: String,
      required: true,
      index: true,
    },
    challengeId: {
      type: String,
      required: true,
    },
    firstAttemptCorrect: {
      type: Boolean,
      default: false,
    },
    improvementCheckCorrect: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['NEW', 'PRACTICING', 'IMPROVING', 'UNDERSTOOD'],
      default: 'NEW',
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    lastInterventionDate: {
      type: Date,
      default: Date.now,
    },
    // Sessions where this intervention was already shown (prevents re-trigger per session)
    sessionShown: {
      type: [sessionShownSchema],
      default: [],
    },
    // Metrics tracking future run performance after intervention
    futureRunsChecked: {
      type: Number,
      default: 0,
    },
    futureRunsClean: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Compound index so we can efficiently look up by user + category
interventionSchema.index({ userId: 1, mistakeCategory: 1 }, { unique: true });

module.exports = mongoose.model('Intervention', interventionSchema);
