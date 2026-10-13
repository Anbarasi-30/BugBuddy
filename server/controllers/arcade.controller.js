/**
 * Arcade Controller
 * 
 * HTTP request handlers for the BugBuddy Arcade API.
 */

const arcadeService = require('../services/arcade.service');
const ArcadeInventory = require('../models/ArcadeInventory');
const ArcadeTransaction = require('../models/ArcadeTransaction');
const ArcadeScore = require('../models/ArcadeScore');
const ArcadeProfile = require('../models/ArcadeProfile');
const { SHOP_ITEMS, ACHIEVEMENTS } = require('../data/arcadeCatalog');
const { BUG_HUNT_QUESTIONS, LOGIC_BLOCKS_LEVELS, OUTPUT_RUSH_QUESTIONS } = require('../data/arcadeQuestions');

// GET /api/arcade/profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await arcadeService.getOrCreateProfile(userId);
    const recentScores = await ArcadeScore.find({ userId }).sort({ createdAt: -1 }).limit(5);

    res.json({
      profile,
      recentScores,
    });
  } catch (err) {
    console.error('[Arcade Controller] getProfile error:', err.message);
    res.status(500).json({ error: 'Could not load arcade profile.' });
  }
};

// GET /api/arcade/questions?game=:gameId
exports.getGameData = async (req, res) => {
  try {
    const { game, category, difficulty, language } = req.query;
    const {
      BUG_HUNT_CASES,
      LOGIC_WORLDS,
      LOGIC_BLOCKS_LEVELS,
      OUTPUT_RUSH_QUESTIONS,
      PYTHON_OUTPUT_QUESTIONS,
      JAVA_OUTPUT_QUESTIONS,
      COIN_DASH_ENVIRONMENTS,
      COIN_DASH_CHALLENGES,
    } = require('../data/arcadeQuestions');

    if (game === 'bug_hunt') {
      let filtered = [...BUG_HUNT_CASES];
      if (category && category !== 'all') {
        filtered = filtered.filter((q) => q.category === category);
      }
      if (difficulty && difficulty !== 'all') {
        filtered = filtered.filter((q) => q.difficulty === difficulty);
      }
      if (language && language !== 'all') {
        filtered = filtered.filter((q) => q.language === language);
      }
      return res.json({
        questions: filtered,
        totalCases: BUG_HUNT_CASES.length,
        categories: ['all', 'arrays', 'loops', 'syntax', 'strings', 'functions', 'types', 'logic', 'recursion', 'edge_cases'],
      });
    }

    if (game === 'logic_blocks') {
      return res.json({
        worlds: LOGIC_WORLDS,
        levels: LOGIC_BLOCKS_LEVELS,
        totalLevels: LOGIC_BLOCKS_LEVELS.length,
      });
    }

    if (game === 'output_rush') {
      let questions = OUTPUT_RUSH_QUESTIONS;
      if (language === 'python') questions = PYTHON_OUTPUT_QUESTIONS;
      else if (language === 'java') questions = JAVA_OUTPUT_QUESTIONS;

      return res.json({
        questions,
        pythonQuestions: PYTHON_OUTPUT_QUESTIONS,
        javaQuestions: JAVA_OUTPUT_QUESTIONS,
        totalQuestions: OUTPUT_RUSH_QUESTIONS.length,
      });
    }

    if (game === 'coin_dash') {
      return res.json({
        environments: COIN_DASH_ENVIRONMENTS,
        challenges: COIN_DASH_CHALLENGES,
      });
    }

    res.status(400).json({ error: 'Invalid game parameter.' });
  } catch (err) {
    console.error('[Arcade Controller] getGameData error:', err.message);
    res.status(500).json({ error: 'Could not load game questions.' });
  }
};

// POST /api/arcade/session/finalize
exports.finalizeSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameId, score, coinsEarned, arcadePointsEarned, metadata, idempotencyKey } = req.body;

    if (!gameId) {
      return res.status(400).json({ error: 'gameId is required.' });
    }

    const result = await arcadeService.finalizeGameSession(userId, {
      gameId,
      score,
      coinsEarned,
      arcadePointsEarned,
      metadata,
      idempotencyKey,
    });

    res.json(result);
  } catch (err) {
    console.error('[Arcade Controller] finalizeSession error:', err.message);
    res.status(400).json({ error: err.message || 'Could not finalize game session.' });
  }
};

// GET /api/arcade/shop/items
exports.getShopItems = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await arcadeService.getOrCreateProfile(userId);
    const userInventory = await ArcadeInventory.find({ userId });
    const ownedIds = new Set(userInventory.map((i) => i.itemId));

    // Default items are always owned
    ownedIds.add('skin_classic');
    ownedIds.add('acc_none');
    ownedIds.add('theme_emerald');

    const items = SHOP_ITEMS.map((item) => ({
      ...item,
      isOwned: ownedIds.has(item.id),
      isEquipped:
        item.id === profile.equippedSkin ||
        item.id === profile.equippedAccessory ||
        item.id === profile.equippedTheme,
    }));

    res.json({
      items,
      coins: profile.coins,
      equippedSkin: profile.equippedSkin,
      equippedAccessory: profile.equippedAccessory,
      equippedTheme: profile.equippedTheme,
    });
  } catch (err) {
    console.error('[Arcade Controller] getShopItems error:', err.message);
    res.status(500).json({ error: 'Could not load shop catalog.' });
  }
};

// POST /api/arcade/shop/buy
exports.buyShopItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.body;

    if (!itemId) {
      return res.status(400).json({ error: 'itemId is required.' });
    }

    const result = await arcadeService.purchaseShopItem(userId, itemId);
    res.json(result);
  } catch (err) {
    console.error('[Arcade Controller] buyShopItem error:', err.message);
    res.status(400).json({ error: err.message || 'Could not complete purchase.' });
  }
};

// POST /api/arcade/shop/equip
exports.equipItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId, itemType } = req.body;

    if (!itemId || !itemType) {
      return res.status(400).json({ error: 'itemId and itemType are required.' });
    }

    const result = await arcadeService.equipCosmeticItem(userId, itemId, itemType);
    res.json(result);
  } catch (err) {
    console.error('[Arcade Controller] equipItem error:', err.message);
    res.status(400).json({ error: err.message || 'Could not equip item.' });
  }
};

// GET /api/arcade/daily-challenges
exports.getDailyChallenges = async (req, res) => {
  try {
    const userId = req.user.id;
    const challenges = await arcadeService.getDailyChallenges(userId);
    res.json({ challenges });
  } catch (err) {
    console.error('[Arcade Controller] getDailyChallenges error:', err.message);
    res.status(500).json({ error: 'Could not load daily challenges.' });
  }
};

// POST /api/arcade/daily-challenges/claim
exports.claimDailyChallenge = async (req, res) => {
  try {
    const userId = req.user.id;
    const { challengeId } = req.body;

    if (!challengeId) {
      return res.status(400).json({ error: 'challengeId is required.' });
    }

    const result = await arcadeService.claimDailyChallenge(userId, challengeId);
    res.json(result);
  } catch (err) {
    console.error('[Arcade Controller] claimDailyChallenge error:', err.message);
    res.status(400).json({ error: err.message || 'Could not claim daily challenge.' });
  }
};

// GET /api/arcade/achievements
exports.getAchievements = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await arcadeService.getOrCreateProfile(userId);
    const unlockedSet = new Set(profile.unlockedAchievements || []);
    const claimedSet = new Set(profile.claimedAchievements || []);

    const achievements = ACHIEVEMENTS.map((ach) => ({
      ...ach,
      isUnlocked: unlockedSet.has(ach.id),
      isClaimed: claimedSet.has(ach.id),
    }));

    res.json({ achievements });
  } catch (err) {
    console.error('[Arcade Controller] getAchievements error:', err.message);
    res.status(500).json({ error: 'Could not load achievements.' });
  }
};

// POST /api/arcade/achievements/claim
exports.claimAchievement = async (req, res) => {
  try {
    const userId = req.user.id;
    const { achievementId } = req.body;

    const ach = ACHIEVEMENTS.find((a) => a.id === achievementId);
    if (!ach) {
      return res.status(404).json({ error: 'Achievement not found.' });
    }

    const profile = await arcadeService.getOrCreateProfile(userId);
    if (!profile.unlockedAchievements.includes(achievementId)) {
      return res.status(400).json({ error: 'Achievement has not been unlocked yet.' });
    }
    if (profile.claimedAchievements.includes(achievementId)) {
      return res.status(400).json({ error: 'Achievement reward already claimed.' });
    }

    const updated = await ArcadeProfile.findOneAndUpdate(
      { userId },
      {
        $addToSet: { claimedAchievements: achievementId },
        $inc: { coins: ach.rewardCoins, arcadePoints: ach.rewardPoints },
      },
      { new: true }
    );

    await ArcadeTransaction.create({
      userId,
      amount: ach.rewardCoins,
      balanceAfter: updated.coins,
      type: 'achievement',
      source: 'achievement',
      description: `Unlocked Achievement: ${ach.title}`,
      idempotencyKey: `ach_claim_${userId}_${achievementId}`,
    });

    res.json({
      success: true,
      coinsAwarded: ach.rewardCoins,
      pointsAwarded: ach.rewardPoints,
      balance: updated.coins,
    });
  } catch (err) {
    console.error('[Arcade Controller] claimAchievement error:', err.message);
    res.status(400).json({ error: err.message || 'Could not claim achievement.' });
  }
};

// GET /api/arcade/leaderboard?period=daily|weekly|all
exports.getLeaderboard = async (req, res) => {
  try {
    const { period = 'all' } = req.query;
    const rankings = await arcadeService.getLeaderboard(period, 25);
    res.json({ period, rankings });
  } catch (err) {
    console.error('[Arcade Controller] getLeaderboard error:', err.message);
    res.status(500).json({ error: 'Could not load leaderboard.' });
  }
};

// GET /api/arcade/history
exports.getActivityHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const [transactions, scores] = await Promise.all([
      ArcadeTransaction.find({ userId }).sort({ createdAt: -1 }).limit(15),
      ArcadeScore.find({ userId }).sort({ createdAt: -1 }).limit(10),
    ]);

    res.json({ transactions, scores });
  } catch (err) {
    console.error('[Arcade Controller] getActivityHistory error:', err.message);
    res.status(500).json({ error: 'Could not load arcade history.' });
  }
};
