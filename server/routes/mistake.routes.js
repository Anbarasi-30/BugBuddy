const express = require('express');
const router = express.Router();
const { getMistakes, getMistakeAnalytics, getPracticeRecommendation } = require('../controllers/mistake.controller');
const { protectRoute } = require('../middleware/auth.middleware');

router.get('/', protectRoute, getMistakes);
router.get('/analytics', protectRoute, getMistakeAnalytics);
router.get('/recommend', protectRoute, getPracticeRecommendation);

module.exports = router;
