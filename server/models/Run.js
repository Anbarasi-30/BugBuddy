/**
 * Run Model
 * 
 * Records every individual code execution attempt (Run) made by a student.
 * Enables tracking the full debugging process step-by-step.
 */

const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema(
  {
    input: String,
    expectedOutput: String,
    actualOutput: String,
    passed: Boolean,
    isHidden: { type: Boolean, default: false },
  },
  { _id: false }
);

const runSchema = new mongoose.Schema(
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
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attempt',
      required: true,
      index: true,
    },
    runNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    language: {
      type: String,
      enum: ['python', 'java', 'c', 'cpp', 'c++'],
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['passed', 'failed', 'error', 'timeout', 'unavailable'],
      required: true,
    },
    passedTestCases: { type: Number, default: 0 },
    totalTestCases: { type: Number, default: 0 },
    failedTestCases: { type: Number, default: 0 },
    errorType: { type: String, default: 'None' },
    errorMessage: { type: String, default: '' },
    errorLine: { type: Number, default: null },
    stdout: { type: String, default: '' },
    stderr: { type: String, default: '' },
    testResults: [testResultSchema],
    executionTimeMs: { type: Number, default: null },
    memory: { type: Number, default: null },
    codeChanged: { type: Boolean, default: true },
    improvement: { type: Number, default: 0 },
    actionType: { type: String, enum: ['run', 'submit'], default: 'run' },
    normalizedSignature: { type: String, default: '' },
    failedTestCase: {
      input: { type: String, default: '' },
      expectedOutput: { type: String, default: '' },
      actualOutput: { type: String, default: '' },
    },
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Run', runSchema);
