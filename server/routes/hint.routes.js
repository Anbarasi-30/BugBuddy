const express = require('express');
const router = express.Router();
const { requestHint, getHintsForAttempt } = require('../controllers/hint.controller');
const { protectRoute } = require('../middleware/auth.middleware');

router.post('/', protectRoute, requestHint);
router.get('/:attemptId', protectRoute, getHintsForAttempt);

module.exports = router;
