const express = require('express');
const router = express.Router();
const { getProblems, getProblemById } = require('../controllers/problem.controller');
const { protectRoute } = require('../middleware/auth.middleware');

// List all problems — requires authentication to display problems and completion status
router.get('/', protectRoute, getProblems);

// Get problem details — requires auth (students must be logged in to work)
router.get('/:id', protectRoute, getProblemById);

module.exports = router;
