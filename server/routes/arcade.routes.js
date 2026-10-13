/**
 * Arcade Routes
 * 
 * Endpoints for BugBuddy Arcade game sessions, shop, leaderboards,
 * daily challenges, and profile data.
 */

const express = require('express');
const router = express.Router();
const { protectRoute } = require('../middleware/auth.middleware');
const arcadeController = require('../controllers/arcade.controller');

// All arcade endpoints require authentication
router.use(protectRoute);

// Profile and metadata
router.get('/profile', arcadeController.getProfile);
router.get('/questions', arcadeController.getGameData);

// Game sessions
router.post('/session/finalize', arcadeController.finalizeSession);

// Shop and Inventory
router.get('/shop/items', arcadeController.getShopItems);
router.post('/shop/buy', arcadeController.buyShopItem);
router.post('/shop/equip', arcadeController.equipItem);

// Daily Challenges
router.get('/daily-challenges', arcadeController.getDailyChallenges);
router.post('/daily-challenges/claim', arcadeController.claimDailyChallenge);

// Achievements
router.get('/achievements', arcadeController.getAchievements);
router.post('/achievements/claim', arcadeController.claimAchievement);

// Leaderboard and History
router.get('/leaderboard', arcadeController.getLeaderboard);
router.get('/history', arcadeController.getActivityHistory);

module.exports = router;
