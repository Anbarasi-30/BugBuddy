const express = require('express');
const router = express.Router();
const { getSkills } = require('../controllers/skill.controller');
const { protectRoute } = require('../middleware/auth.middleware');

router.get('/', protectRoute, getSkills);

module.exports = router;
