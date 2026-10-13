/**
 * Arcade Service
 * 
 * Core business logic for BugBuddy Arcade:
 * - Authoritative wallet operations & atomic balances
 * - Game session validation and anti-exploit limits
 * - Cosmetic shop purchases & inventory management
 * - Daily challenges with server-time UTC partitions
 * - Achievements engine
 * - Daily, weekly, and all-time leaderboard aggregation
 */

const mongoose = require('mongoose');
const ArcadeProfile = require('../models/ArcadeProfile');
const ArcadeTransaction = require('../models/ArcadeTransaction');
const ArcadeInventory = require('../models/ArcadeInventory');
const ArcadeScore = require('../models/ArcadeScore');
const ArcadeDailyChallenge = require('../models/ArcadeDailyChallenge');
const User = require('../models/User');
const { SHOP_ITEMS, ACHIEVEMENTS, DAILY_CHALLENGE_TEMPLATES } = require('../data/arcadeCatalog');

// Helpers for UTC partition keys
function getDailyKey(d = new Date()) {
  return d.toISOString().split('T')[0];
}

function getWeeklyKey(d = new Date()) {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/**
 * Find or create an ArcadeProfile for a user.
 * Grants a 50 coin welcome gift on first visit.
 */
async function getOrCreateProfile(userId) {
  let profile = await ArcadeProfile.findOne({ userId });
  if (!profile) {
    profile = await ArcadeProfile.create({
      userId,
      coins: 50,
      arcadePoints: 0,
      equippedSkin: 'skin_classic',
      equippedAccessory: 'acc_none',
      equippedTheme: 'theme_emerald',
      unlockedAchievements: [],
      claimedAchievements: [],
    });

    // Ensure default items are in inventory
    await ArcadeInventory.create([
      { userId, itemId: 'skin_classic', itemType: 'skin', purchasedPrice: 0 },
      { userId, itemId: 'acc_none', itemType: 'accessory', purchasedPrice: 0 },
      { userId, itemId: 'theme_emerald', itemType: 'theme', purchasedPrice: 0 },
    ]).catch(() => {});

    // Record welcome transaction
    await ArcadeTransaction.create({
      userId,
      amount: 50,
      balanceAfter: 50,
      type: 'starter_gift',
      source: 'welcome',
      description: 'Welcome to BugBuddy Arcade! Starter coins granted.',
      idempotencyKey: `welcome_${userId}`,
    }).catch(() => {});
  }
  return profile;
}

/**
 * Record and validate a finalized game session.
 * Applies anti-tamper caps, saves score, updates streak/bests,
 * advances daily challenges, and checks achievements.
 */
async function finalizeGameSession(userId, { gameId, score = 0, coinsEarned = 0, arcadePointsEarned = 0, metadata = {}, idempotencyKey }) {
  if (!['bug_hunt', 'logic_blocks', 'output_rush', 'coin_dash'].includes(gameId)) {
    throw new Error('Invalid gameId.');
  }

  // Idempotency check: prevent duplicate reward claims
  if (idempotencyKey) {
    const existingTx = await ArcadeTransaction.findOne({ idempotencyKey });
    if (existingTx) {
      const profile = await ArcadeProfile.findOne({ userId });
      return { profile, coinsAwarded: 0, pointsAwarded: 0, duplicate: true };
    }
  }

  // Server-side plausibility caps to prevent client-injected exploit values
  let safeCoins = Math.max(0, Math.min(Number(coinsEarned) || 0, 80));
  let safePoints = Math.max(0, Math.min(Number(arcadePointsEarned) || 0, 500));
  let safeScore = Math.max(0, Math.min(Number(score) || 0, 100000));

  const periodDaily = getDailyKey();
  const periodWeekly = getWeeklyKey();

  // Save the validated score record
  const scoreRecord = await ArcadeScore.create({
    userId,
    gameId,
    score: safeScore,
    arcadePointsEarned: safePoints,
    coinsEarned: safeCoins,
    metadata,
    periodDaily,
    periodWeekly,
  });

  // Load current profile
  let profile = await getOrCreateProfile(userId);

  // Helper to convert gameId (e.g. bug_hunt) to camelCase property (bugHunt)
  const camelKey = gameId.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

  // Determine if this is a new best score
  const currentBest = profile.bestScores?.[camelKey] || 0;
  const isNewBest = safeScore > currentBest;
  const newBestScore = isNewBest ? safeScore : currentBest;

  // Atomically update profile
  const updateDoc = {
    $inc: {
      coins: safeCoins,
      arcadePoints: safePoints,
      [`gamesPlayed.${camelKey}`]: 1,
      'gamesPlayed.total': 1,
    },
  };
  if (isNewBest) {
    updateDoc.$set = { [`bestScores.${camelKey}`]: newBestScore };
  }

  profile = await ArcadeProfile.findOneAndUpdate({ userId }, updateDoc, { new: true });

  // Record transaction ledger entry
  if (safeCoins > 0) {
    await ArcadeTransaction.create({
      userId,
      amount: safeCoins,
      balanceAfter: profile.coins,
      type: 'reward',
      source: gameId,
      description: `Completed ${gameId.replace('_', ' ').toUpperCase()} (Score: ${safeScore})`,
      idempotencyKey: idempotencyKey || `session_${scoreRecord._id}`,
    }).catch((e) => console.warn('[Arcade Ledger] Tx creation note:', e.message));
  }

  // Progress Daily Challenges for this game
  await progressDailyChallenges(userId, gameId, metadata);

  // Check and unlock achievements
  const newAchievements = await evaluateAchievements(userId, profile, gameId, safeScore);

  return {
    profile,
    coinsAwarded: safeCoins,
    pointsAwarded: safePoints,
    isNewBest,
    newAchievements,
  };
}

/**
 * Progress user's daily challenges
 */
async function progressDailyChallenges(userId, gameId, metadata = {}) {
  try {
    const dateKey = getDailyKey();
    const challenges = await ArcadeDailyChallenge.find({ userId, dateKey, completed: false });

    for (const ch of challenges) {
      let increment = 0;
      if (ch.challengeId === 'daily_bug_hunt_3' && gameId === 'bug_hunt') {
        increment = 1;
      } else if (ch.challengeId === 'daily_logic_blocks_2' && gameId === 'logic_blocks') {
        increment = 1;
      } else if (ch.challengeId === 'daily_coin_dash_coins' && gameId === 'coin_dash') {
        increment = Number(metadata.coinsCollected) || 0;
      } else if (ch.challengeId === 'daily_output_rush_3' && gameId === 'output_rush') {
        increment = 1;
      }

      if (increment > 0) {
        const newProgress = ch.progress + increment;
        const isCompleted = newProgress >= ch.target;
        await ArcadeDailyChallenge.findByIdAndUpdate(ch._id, {
          progress: newProgress,
          completed: isCompleted,
        });
      }
    }
  } catch (err) {
    console.warn('[Arcade Challenge Progress Error]:', err.message);
  }
}

/**
 * Evaluate and grant achievements
 */
async function evaluateAchievements(userId, profile, gameId, score) {
  const newUnlocked = [];
  const currentUnlocked = new Set(profile.unlockedAchievements || []);

  const check = (achId, condition) => {
    if (!currentUnlocked.has(achId) && condition) {
      newUnlocked.push(achId);
      currentUnlocked.add(achId);
    }
  };

  // 1. First Game
  check('first_game', profile.gamesPlayed.total >= 1);

  // 2. Bug Hunter
  check('bug_hunter_apprentice', gameId === 'bug_hunt' && score >= 100);
  check('bug_hunter_master', profile.gamesPlayed.bugHunt >= 5);

  // 3. Logic Blocks
  check('logic_apprentice', gameId === 'logic_blocks' && score >= 100);
  check('logic_grandmaster', gameId === 'logic_blocks' && score >= 500);

  // 4. Output Rush
  check('output_tracer', gameId === 'output_rush' && score >= 150);

  // 5. Coin Dash
  check('dash_runner', gameId === 'coin_dash' && score >= 200);
  check('dash_champion', gameId === 'coin_dash' && score >= 500);

  // 6. Arcade Explorer (tried all 4)
  const playedAll =
    profile.gamesPlayed.bugHunt > 0 &&
    profile.gamesPlayed.logicBlocks > 0 &&
    profile.gamesPlayed.outputRush > 0 &&
    profile.gamesPlayed.coinDash > 0;
  check('arcade_explorer', playedAll);

  if (newUnlocked.length > 0) {
    await ArcadeProfile.findOneAndUpdate(
      { userId },
      { $addToSet: { unlockedAchievements: { $each: newUnlocked } } }
    );
  }

  return newUnlocked;
}

/**
 * Get or seed today's daily challenges
 */
async function getDailyChallenges(userId) {
  const dateKey = getDailyKey();
  let challenges = await ArcadeDailyChallenge.find({ userId, dateKey });

  if (challenges.length === 0) {
    // Pick 3 templates for today
    const selected = DAILY_CHALLENGE_TEMPLATES.slice(0, 3);
    const toInsert = selected.map((t) => ({
      userId,
      dateKey,
      challengeId: t.id,
      progress: 0,
      target: t.target,
      completed: false,
      claimed: false,
      rewardCoins: t.rewardCoins,
      rewardPoints: t.rewardPoints,
    }));

    challenges = await ArcadeDailyChallenge.insertMany(toInsert);
  }

  // Augment with titles and descriptions from catalog
  const templateMap = new Map(DAILY_CHALLENGE_TEMPLATES.map((t) => [t.id, t]));
  return challenges.map((ch) => {
    const t = templateMap.get(ch.challengeId) || {};
    return {
      _id: ch._id,
      challengeId: ch.challengeId,
      title: t.title || ch.challengeId,
      description: t.description || '',
      gameId: t.gameId || 'general',
      progress: ch.progress,
      target: ch.target,
      completed: ch.completed,
      claimed: ch.claimed,
      rewardCoins: ch.rewardCoins,
      rewardPoints: ch.rewardPoints,
    };
  });
}

/**
 * Claim reward for a completed daily challenge
 */
async function claimDailyChallenge(userId, challengeId) {
  const dateKey = getDailyKey();
  const challenge = await ArcadeDailyChallenge.findOne({ userId, dateKey, challengeId });

  if (!challenge) {
    throw new Error('Daily challenge not found for today.');
  }
  if (!challenge.completed) {
    throw new Error('Challenge objective has not been completed yet.');
  }
  if (challenge.claimed) {
    throw new Error('Challenge reward has already been claimed.');
  }

  challenge.claimed = true;
  await challenge.save();

  // Atomically grant coins and points
  const profile = await ArcadeProfile.findOneAndUpdate(
    { userId },
    {
      $inc: {
        coins: challenge.rewardCoins,
        arcadePoints: challenge.rewardPoints,
      },
    },
    { new: true }
  );

  // Record transaction
  await ArcadeTransaction.create({
    userId,
    amount: challenge.rewardCoins,
    balanceAfter: profile.coins,
    type: 'daily_challenge',
    source: 'daily_challenge',
    description: `Claimed Daily Challenge: ${challengeId}`,
    idempotencyKey: `daily_claim_${userId}_${dateKey}_${challengeId}`,
  });

  return {
    success: true,
    coinsAwarded: challenge.rewardCoins,
    pointsAwarded: challenge.rewardPoints,
    balance: profile.coins,
  };
}

/**
 * Purchase a cosmetic item from the shop
 */
async function purchaseShopItem(userId, itemId) {
  const item = SHOP_ITEMS.find((i) => i.id === itemId);
  if (!item) {
    throw new Error('Item not found in catalog.');
  }

  // Check if user already owns it
  const alreadyOwned = await ArcadeInventory.findOne({ userId, itemId });
  if (alreadyOwned) {
    throw new Error('You already own this item.');
  }

  const profile = await getOrCreateProfile(userId);
  if (profile.coins < item.price) {
    throw new Error(`Insufficient coins. Need ${item.price} coins, but you have ${profile.coins}.`);
  }

  // Atomically deduct coins
  const updatedProfile = await ArcadeProfile.findOneAndUpdate(
    { userId, coins: { $gte: item.price } },
    { $inc: { coins: -item.price } },
    { new: true }
  );

  if (!updatedProfile) {
    throw new Error('Transaction failed. Please check your coin balance.');
  }

  // Add to inventory
  await ArcadeInventory.create({
    userId,
    itemId: item.id,
    itemType: item.type,
    purchasedPrice: item.price,
  });

  // Record transaction
  await ArcadeTransaction.create({
    userId,
    amount: -item.price,
    balanceAfter: updatedProfile.coins,
    type: 'purchase',
    source: 'shop_purchase',
    description: `Purchased ${item.name} (${item.type})`,
    idempotencyKey: `purchase_${userId}_${itemId}_${Date.now()}`,
  });

  // Evaluate shop achievement
  await evaluateAchievements(userId, updatedProfile, 'shop', 1);

  return {
    success: true,
    balance: updatedProfile.coins,
    item,
  };
}

/**
 * Equip an owned cosmetic item
 */
async function equipCosmeticItem(userId, itemId, itemType) {
  // Validate item exists in catalog
  const item = SHOP_ITEMS.find((i) => i.id === itemId);
  if (!item) {
    throw new Error('Invalid item.');
  }

  // Verify user owns the item (free starter items are owned by default)
  if (item.price > 0) {
    const owned = await ArcadeInventory.findOne({ userId, itemId });
    if (!owned) {
      throw new Error('You must purchase this item before equipping it.');
    }
  }

  const update = {};
  if (itemType === 'skin') update.equippedSkin = itemId;
  else if (itemType === 'accessory') update.equippedAccessory = itemId;
  else if (itemType === 'theme') update.equippedTheme = itemId;
  else throw new Error('Invalid item type.');

  const profile = await ArcadeProfile.findOneAndUpdate({ userId }, { $set: update }, { new: true });
  return {
    success: true,
    equippedSkin: profile.equippedSkin,
    equippedAccessory: profile.equippedAccessory,
    equippedTheme: profile.equippedTheme,
  };
}

/**
 * Get Leaderboard rankings (Daily, Weekly, All-Time)
 */
async function getLeaderboard(period = 'all', limit = 25) {
  if (period === 'daily') {
    const periodDaily = getDailyKey();
    const results = await ArcadeScore.aggregate([
      { $match: { periodDaily } },
      {
        $group: {
          _id: '$userId',
          totalPoints: { $sum: '$arcadePointsEarned' },
          highScore: { $max: '$score' },
          gamesPlayed: { $sum: 1 },
        },
      },
      { $sort: { totalPoints: -1 } },
      { $limit: limit },
    ]);

    return populateLeaderboardUsers(results);
  }

  if (period === 'weekly') {
    const periodWeekly = getWeeklyKey();
    const results = await ArcadeScore.aggregate([
      { $match: { periodWeekly } },
      {
        $group: {
          _id: '$userId',
          totalPoints: { $sum: '$arcadePointsEarned' },
          highScore: { $max: '$score' },
          gamesPlayed: { $sum: 1 },
        },
      },
      { $sort: { totalPoints: -1 } },
      { $limit: limit },
    ]);

    return populateLeaderboardUsers(results);
  }

  // All-time: directly from ArcadeProfile
  const profiles = await ArcadeProfile.find()
    .sort({ arcadePoints: -1 })
    .limit(limit)
    .populate('userId', 'name avatar role');

  return profiles.map((p, index) => ({
    rank: index + 1,
    userId: p.userId?._id,
    name: p.userId?.name || 'Anonymous Coder',
    avatar: p.userId?.avatar,
    points: p.arcadePoints,
    gamesPlayed: p.gamesPlayed?.total || 0,
    equippedSkin: p.equippedSkin,
    equippedAccessory: p.equippedAccessory,
  }));
}

async function populateLeaderboardUsers(results) {
  const userIds = results.map((r) => r._id);
  const users = await User.find({ _id: { $in: userIds } }).select('name avatar');
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  return results.map((r, index) => {
    const user = userMap.get(r._id.toString()) || {};
    return {
      rank: index + 1,
      userId: r._id,
      name: user.name || 'Anonymous Coder',
      avatar: user.avatar,
      points: r.totalPoints,
      gamesPlayed: r.gamesPlayed,
    };
  });
}

module.exports = {
  getOrCreateProfile,
  finalizeGameSession,
  getDailyChallenges,
  claimDailyChallenge,
  purchaseShopItem,
  equipCosmeticItem,
  getLeaderboard,
  getDailyKey,
  getWeeklyKey,
};
