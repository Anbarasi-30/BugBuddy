/**
 * Attempt Model
 * 
 * Tracks each debugging attempt within a problem session.
 * An attempt is created for each submission and records
 * how far the student got with hints.
 */

const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
      index: true,
    },
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      default: null,
    },
    // Which attempt / session number this is for this user+problem combination (1, 2, 3...)
    attemptNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: null,
    },
    runCount: {
      type: Number,
      default: 0,
    },
    totalRuns: {
      type: Number,
      default: 0,
    },
    failedRuns: {
      type: Number,
      default: 0,
    },
    bestPassedTests: {
      type: Number,
      default: 0,
    },
    firstRunPassed: {
      type: Number,
      default: 0,
    },
    totalTestCases: {
      type: Number,
      default: 0,
    },
    hintsUsed: {
      type: Number,
      default: 0,
    },
    explainErrorUsed: {
      type: Number,
      default: 0,
    },
    finalStatus: {
      type: String,
      enum: ['in_progress', 'passed', 'failed', 'abandoned'],
      default: 'in_progress',
    },
    submissionStatus: {
      type: String,
      enum: ['not_submitted', 'submitted', 'accepted', 'rejected'],
      default: 'not_submitted',
    },
    latestCode: {
      type: String,
      default: '',
    },
    latestLanguage: {
      type: String,
      default: 'python',
    },
    // The error type detected in this attempt/session
    errorType: {
      type: String,
      default: 'None',
    },
    // Line number where error was detected (if available)
    errorLine: {
      type: Number,
      default: null,
    },
    // The hint level the student has reached (0 = no hint)
    hintLevel: {
      type: Number,
      default: 0,
      min: 0,
      max: 4,
    },
    // Whether the student explicitly requested a hint
    hintRequested: {
      type: Boolean,
      default: false,
    },
    // Whether the student asked to reveal the full solution
    solutionRevealed: {
      type: Boolean,
      default: false,
    },
    // Whether this attempt eventually resulted in passing
    resolved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attempt', attemptSchema);
