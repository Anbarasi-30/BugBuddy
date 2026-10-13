const express = require('express');
const router = express.Router();
const {
  createSubmission,
  getSubmissions,
  getSubmissionById,
  runCode,
} = require('../controllers/submission.controller');
const { protectRoute } = require('../middleware/auth.middleware');

router.post('/', protectRoute, createSubmission);
router.post('/run', protectRoute, runCode);
router.get('/', protectRoute, getSubmissions);
router.get('/:id', protectRoute, getSubmissionById);

module.exports = router;
