const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/dashboard.controller');
const { protectRoute } = require('../middleware/auth.middleware');

router.get('/', protectRoute, getDashboard);

module.exports = router;
