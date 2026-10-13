const express = require('express');
const router = express.Router();
const { createReport, getMyReports, getMyReportById } = require('../controllers/report.controller');
const { protectRoute } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(protectRoute);

// POST /api/reports — submit a new report
router.post('/', createReport);

// GET /api/reports/my — get all reports for logged-in student
router.get('/my', getMyReports);

// GET /api/reports/my/:id — get specific report (must belong to student)
router.get('/my/:id', getMyReportById);

module.exports = router;
