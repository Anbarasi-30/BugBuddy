/**
 * Submission Model
 * 
 * Records each code submission made by a student.
 * Stores the submitted code, execution result, error details, and timing.
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

const submissionSchema = new mongoose.Schema(
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
    language: {
      type: String,
      enum: ['python', 'java', 'c', 'cpp', 'c++'],
      required: true,
    },
    submittedCode: {
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
    errorType: {
      type: String,
      default: 'None',
    },
    errorMessage: { type: String, default: '' },
    errorLine: { type: Number, default: null },
    stdout: { type: String, default: '' },
    stderr: { type: String, default: '' },
    testResults: [testResultSchema],
    executionTimeMs: { type: Number, default: null },
    actionType: { type: String, enum: ['run', 'submit'], default: 'submit' },
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

module.exports = mongoose.model('Submission', submissionSchema);
