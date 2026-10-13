/**
 * Report Model
 *
 * Stores student feedback and bug reports submitted through the Feedback & Report page.
 * Supports admin review, status updates, and admin responses visible to students.
 */

const mongoose = require('mongoose');

const REPORT_TYPES = [
  'bug_report',
  'incorrect_coding_problem',
  'incorrect_test_case',
  'ai_hint_feedback',
  'feature_request',
  'general_feedback',
  'other',
];

const CATEGORIES = [
  'coding_workspace',
  'code_execution',
  'test_cases',
  'ai_hints',
  'login_and_authentication',
  'learning_progress',
  'user_interface',
  'other',
];

const STATUSES = ['pending', 'under_review', 'resolved', 'dismissed'];

const reportSchema = new mongoose.Schema(
  {
    // Student identity (set server-side from JWT — students cannot modify)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },

    // Report content
    reportType: {
      type: String,
      required: [true, 'Report type is required.'],
      enum: { values: REPORT_TYPES, message: 'Invalid report type.' },
    },
    category: {
      type: String,
      required: [true, 'Category is required.'],
      enum: { values: CATEGORIES, message: 'Invalid category.' },
    },
    subject: {
      type: String,
      required: [true, 'Subject is required.'],
      trim: true,
      minlength: [5, 'Subject must be at least 5 characters.'],
      maxlength: [200, 'Subject cannot exceed 200 characters.'],
    },
    description: {
      type: String,
      required: [true, 'Description is required.'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters.'],
      maxlength: [5000, 'Description cannot exceed 5000 characters.'],
    },

    // Optional related problem
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      default: null,
    },
    problemTitle: { type: String, default: '' },

    // Status flow (managed by admin only)
    status: {
      type: String,
      enum: STATUSES,
      default: 'pending',
    },

    // Admin response visible to the student
    adminResponse: { type: String, default: '' },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
