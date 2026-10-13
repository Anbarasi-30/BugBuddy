/**
 * Student Report Controller
 *
 * Handles student-facing report endpoints:
 *   POST /api/reports          — Submit a new report
 *   GET  /api/reports/my       — Get the logged-in student's reports
 *   GET  /api/reports/my/:id   — Get a specific report (must belong to student)
 */

const Report = require('../models/Report');
const Problem = require('../models/Problem');
const mongoose = require('mongoose');

const VALID_REPORT_TYPES = [
  'bug_report',
  'incorrect_coding_problem',
  'incorrect_test_case',
  'ai_hint_feedback',
  'feature_request',
  'general_feedback',
  'other',
];

const VALID_CATEGORIES = [
  'coding_workspace',
  'code_execution',
  'test_cases',
  'ai_hints',
  'login_and_authentication',
  'learning_progress',
  'user_interface',
  'other',
];

// ---------------------------------------------------------------------------
// POST /api/reports — Submit a new student report
// ---------------------------------------------------------------------------
const createReport = async (req, res) => {
  try {
    const { reportType, category, subject, description, problemId } = req.body;

    // Required field validation
    if (!reportType || !category || !subject || !description) {
      return res.status(400).json({
        error: 'Report type, category, subject, and description are required.',
      });
    }

    if (!VALID_REPORT_TYPES.includes(reportType)) {
      return res.status(400).json({ error: 'Invalid report type.' });
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Invalid category.' });
    }

    if (subject.trim().length < 5) {
      return res.status(400).json({ error: 'Subject must be at least 5 characters.' });
    }

    if (description.trim().length < 10) {
      return res.status(400).json({ error: 'Description must be at least 10 characters.' });
    }

    // Optional problem reference
    let resolvedProblemId = null;
    let problemTitle = '';
    if (problemId) {
      if (!mongoose.Types.ObjectId.isValid(problemId)) {
        return res.status(400).json({ error: 'Invalid problem ID.' });
      }
      const problem = await Problem.findById(problemId).select('title');
      if (problem) {
        resolvedProblemId = problem._id;
        problemTitle = problem.title;
      }
    }

    const report = await Report.create({
      userId: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      reportType,
      category,
      subject: subject.trim(),
      description: description.trim(),
      problemId: resolvedProblemId,
      problemTitle,
      status: 'pending',
    });

    res.status(201).json({
      message: 'Your report has been submitted successfully. Thank you for the feedback!',
      report,
    });
  } catch (err) {
    console.error('[Report] Create error:', err.message);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(' ') });
    }
    res.status(500).json({ error: 'Could not submit your report. Please try again.' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/reports/my — Get all reports for the logged-in student
// ---------------------------------------------------------------------------
const getMyReports = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const total = await Report.countDocuments({ userId: req.user.id });
    const reports = await Report.find({ userId: req.user.id })
      .select('reportType category subject status adminResponse problemTitle createdAt updatedAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      reports,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (err) {
    console.error('[Report] Get my reports error:', err.message);
    res.status(500).json({ error: 'Could not fetch your reports.' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/reports/my/:id — Get a specific report (must belong to student)
// ---------------------------------------------------------------------------
const getMyReportById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid report ID.' });
    }

    const report = await Report.findOne({ _id: id, userId: req.user.id });
    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    res.json({ report });
  } catch (err) {
    console.error('[Report] Get my report by id error:', err.message);
    res.status(500).json({ error: 'Could not fetch report details.' });
  }
};

module.exports = { createReport, getMyReports, getMyReportById };
