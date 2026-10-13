const express = require('express');
const router = express.Router();
const { protectRoute, requireAdmin } = require('../middleware/auth.middleware');
const {
  getOverview,
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getSubmissions,
  getProblems,
  getProblemById,
  createProblem,
  updateProblem,
  deleteProblem,
  getAnalytics,
  getSystemMonitoring,
  getReports,
  getReportById,
  updateReport,
} = require('../controllers/admin.controller');

// Protect all admin routes
router.use(protectRoute);
router.use(requireAdmin);

// Overview Dashboard
router.get('/overview', getOverview);
router.get('/dashboard', getOverview);

// Student Management
router.get('/students', getStudents);
router.post('/students', createStudent);
router.patch('/students/:id', updateStudent);
router.patch('/students/:id/status', updateStudent);
router.delete('/students/:id', deleteStudent);

// Admin Submission History
router.get('/submissions', getSubmissions);

// Coding Problem Management
router.get('/problems', getProblems);
router.post('/problems', createProblem);
router.get('/problems/:id', getProblemById);
router.patch('/problems/:id', updateProblem);
router.delete('/problems/:id', deleteProblem);

// Analytics & System Monitoring
router.get('/analytics', getAnalytics);
router.get('/system', getSystemMonitoring);

// Reports & Feedback Management
router.get('/reports', getReports);
router.get('/reports/:id', getReportById);
router.patch('/reports/:id', updateReport);

module.exports = router;
