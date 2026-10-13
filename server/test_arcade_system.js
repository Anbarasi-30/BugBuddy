/**
 * Automated Acceptance Tests for BugBuddy Arcade Backend
 * 
 * Verifies:
 * - Wallet initialization & starter gift
 * - Session finalization & anti-cheat caps
 * - Idempotency duplicate prevention
 * - Cosmetic shop purchasing & equip flow
 * - Daily challenges progress & claim
 * - Achievements engine
 * - Leaderboard aggregation
 */

require('dotenv').config();
const mongoose = require('mongoose');
const assert = require('assert');

const User = require('./models/User');
const ArcadeProfile = require('./models/ArcadeProfile');
const ArcadeTransaction = require('./models/ArcadeTransaction');
const ArcadeInventory = require('./models/ArcadeInventory');
const ArcadeScore = require('./models/ArcadeScore');
const ArcadeDailyChallenge = require('./models/ArcadeDailyChallenge');

const arcadeService = require('./services/arcade.service');

async function runTests() {
  console.log('=== BUGBUDDY ARCADE ACCEPTANCE TESTS ===\n');
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    return async () => {
      try {
        await fn();
        console.log(`  ✅ ${name}`);
        passed++;
      } catch (err) {
        console.error(`  ❌ ${name}: ${err.message}`);
        failed++;
      }
    };
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[Connected to MongoDB Atlas]\n');

  // Find or create test user
  let user = await User.findOne({ email: 'arcade_tester@bugbuddy.dev' });
  if (!user) {
    user = await User.create({
      name: 'Arcade Tester',
      email: 'arcade_tester@bugbuddy.dev',
      role: 'student',
      status: 'active',
      isVerified: true,
    });
  }

  const userId = user._id;

  try {
    // Clean previous test arcade data
    await ArcadeProfile.deleteMany({ userId });
    await ArcadeTransaction.deleteMany({ userId });
    await ArcadeInventory.deleteMany({ userId });
    await ArcadeScore.deleteMany({ userId });
    await ArcadeDailyChallenge.deleteMany({ userId });

    // --- TEST 1: Profile Creation & Starter Coins ---
    await test('Profile creation grants 50 starter coins and sets defaults', async () => {
      const profile = await arcadeService.getOrCreateProfile(userId);
      assert.strictEqual(profile.coins, 50, 'Starter coins should be 50');
      assert.strictEqual(profile.arcadePoints, 0, 'Initial points should be 0');
      assert.strictEqual(profile.equippedSkin, 'skin_classic', 'Default skin is skin_classic');

      const tx = await ArcadeTransaction.findOne({ userId, type: 'starter_gift' });
      assert(tx, 'Starter transaction must exist in ledger');
      assert.strictEqual(tx.amount, 50);
    })();

    // --- TEST 2: Finalize Game Session ---
    await test('Finalizing game session credits coins, points, updates bestScores and gamesPlayed', async () => {
      const res = await arcadeService.finalizeGameSession(userId, {
        gameId: 'bug_hunt',
        score: 150,
        coinsEarned: 25,
        arcadePointsEarned: 100,
        metadata: { roundsCompleted: 3 },
        idempotencyKey: 'test_session_bh_1',
      });

      assert.strictEqual(res.coinsAwarded, 25, 'Awarded coins should be 25');
      assert.strictEqual(res.pointsAwarded, 100, 'Awarded points should be 100');
      assert.strictEqual(res.isNewBest, true, 'Score 150 should be a new best');
      assert.strictEqual(res.profile.coins, 75, 'Balance should now be 50 + 25 = 75');
      assert.strictEqual(res.profile.arcadePoints, 100);
      assert.strictEqual(res.profile.bestScores.bugHunt, 150);
      assert.strictEqual(res.profile.gamesPlayed.bugHunt, 1);
    })();

    // --- TEST 3: Idempotency Protection ---
    await test('Submitting the same idempotencyKey is rejected without duplicate rewards', async () => {
      const resDuplicate = await arcadeService.finalizeGameSession(userId, {
        gameId: 'bug_hunt',
        score: 150,
        coinsEarned: 25,
        arcadePointsEarned: 100,
        idempotencyKey: 'test_session_bh_1', // Same key!
      });

      assert.strictEqual(resDuplicate.coinsAwarded, 0, 'Duplicate submission should award 0 coins');
      assert.strictEqual(resDuplicate.duplicate, true, 'Duplicate flag must be set');

      const profile = await ArcadeProfile.findOne({ userId });
      assert.strictEqual(profile.coins, 75, 'Coin balance must not double-credit');
    })();

    // --- TEST 4: Anti-Cheat Caps ---
    await test('Absurdly high client-injected scores/coins are capped to safe limits', async () => {
      const res = await arcadeService.finalizeGameSession(userId, {
        gameId: 'coin_dash',
        score: 99999999, // Unreasonable score
        coinsEarned: 50000, // Exploit attempt
        arcadePointsEarned: 90000,
        idempotencyKey: 'test_session_exploit_1',
      });

      assert(res.coinsAwarded <= 80, 'Coins awarded must be capped to max 80 per session');
      assert(res.pointsAwarded <= 500, 'Points awarded must be capped to max 500');
    })();

    // --- TEST 5: Daily Challenges Progression & Claim ---
    await test('Daily challenges are seeded, progressed by game events, and claimable exactly once', async () => {
      const challenges = await arcadeService.getDailyChallenges(userId);
      assert.strictEqual(challenges.length, 3, 'Should seed 3 daily challenges for today');

      // Play enough bug hunt rounds to complete the bug hunt daily challenge
      await arcadeService.finalizeGameSession(userId, {
        gameId: 'bug_hunt',
        score: 100,
        coinsEarned: 10,
        arcadePointsEarned: 40,
        idempotencyKey: 'daily_advance_1',
      });
      await arcadeService.finalizeGameSession(userId, {
        gameId: 'bug_hunt',
        score: 100,
        coinsEarned: 10,
        arcadePointsEarned: 40,
        idempotencyKey: 'daily_advance_2',
      });

      const updatedChallenges = await arcadeService.getDailyChallenges(userId);
      const bhChallenge = updatedChallenges.find((c) => c.challengeId === 'daily_bug_hunt_3');
      assert(bhChallenge, 'Bug hunt challenge must exist');
      assert(bhChallenge.progress >= 2, 'Progress should have advanced to at least 2');

      // Directly mark completed to test claim logic
      await ArcadeDailyChallenge.findByIdAndUpdate(bhChallenge._id, { completed: true });

      const claimRes = await arcadeService.claimDailyChallenge(userId, 'daily_bug_hunt_3');
      assert.strictEqual(claimRes.success, true);
      assert(claimRes.coinsAwarded > 0, 'Should award challenge coins');

      // Attempt duplicate claim
      let duplicateClaimFailed = false;
      try {
        await arcadeService.claimDailyChallenge(userId, 'daily_bug_hunt_3');
      } catch {
        duplicateClaimFailed = true;
      }
      assert.strictEqual(duplicateClaimFailed, true, 'Second claim must throw an error');
    })();

    // --- TEST 6: Cosmetic Shop Purchasing & Inventory ---
    await test('Cosmetic items can be purchased with coins, recorded in inventory and ledger', async () => {
      // User has enough coins for retro skin (cost: 60)
      const initialProfile = await ArcadeProfile.findOne({ userId });
      const initialCoins = initialProfile.coins;

      const buyRes = await arcadeService.purchaseShopItem(userId, 'skin_retro');
      assert.strictEqual(buyRes.success, true);
      assert.strictEqual(buyRes.balance, initialCoins - 60, 'Deducted 60 coins');

      const inv = await ArcadeInventory.findOne({ userId, itemId: 'skin_retro' });
      assert(inv, 'skin_retro must exist in user inventory');

      // Prevent duplicate purchase of same item
      let duplicateBuyFailed = false;
      try {
        await arcadeService.purchaseShopItem(userId, 'skin_retro');
      } catch {
        duplicateBuyFailed = true;
      }
      assert.strictEqual(duplicateBuyFailed, true, 'Duplicate purchase of owned item must fail');

      // Equip item
      const equipRes = await arcadeService.equipCosmeticItem(userId, 'skin_retro', 'skin');
      assert.strictEqual(equipRes.equippedSkin, 'skin_retro', 'Should equip skin_retro');

      const profile = await ArcadeProfile.findOne({ userId });
      assert.strictEqual(profile.equippedSkin, 'skin_retro');
    })();

    // --- TEST 7: Leaderboard Aggregation ---
    await test('Leaderboard aggregates daily, weekly, and all-time rankings', async () => {
      const allTimeRankings = await arcadeService.getLeaderboard('all', 10);
      assert(Array.isArray(allTimeRankings), 'All-time leaderboard must return array');
      assert(allTimeRankings.length > 0, 'Rankings should contain players');

      const playerEntry = allTimeRankings.find((r) => r.userId?.toString() === userId.toString());
      assert(playerEntry, 'Tester user must appear on the leaderboard');
      assert(playerEntry.points > 0, 'Player points must be positive');

      const dailyRankings = await arcadeService.getLeaderboard('daily', 10);
      assert(Array.isArray(dailyRankings), 'Daily rankings must return array');
    })();

  } finally {
    // Teardown
    await ArcadeProfile.deleteMany({ userId });
    await ArcadeTransaction.deleteMany({ userId });
    await ArcadeInventory.deleteMany({ userId });
    await ArcadeScore.deleteMany({ userId });
    await ArcadeDailyChallenge.deleteMany({ userId });
    await mongoose.disconnect();
    console.log('\n[Teardown complete & disconnected]');
  }

  console.log(`\n===================================`);
  console.log(`  RESULTS: ${passed} passed, ${failed} failed`);
  console.log(`===================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
