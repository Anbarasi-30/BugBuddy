/**
 * Intervention Routes
 */

const express = require('express');
const router = express.Router();
const { protectRoute } = require('../middleware/auth.middleware');
const {
  checkIntervention,
  submitInterventionAnswer,
  getInterventionHistory,
} = require('../controllers/intervention.controller');

router.use(protectRoute);

// POST — check is now POST so we can send run context in the body
router.post('/check', checkIntervention);
router.post('/submit', submitInterventionAnswer);
router.get('/history', getInterventionHistory);

module.exports = router;
