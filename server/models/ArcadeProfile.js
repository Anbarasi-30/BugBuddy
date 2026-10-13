/**
 * ArcadeProfile Model
 * 
 * Stores persistent arcade statistics, virtual coin wallet,
 * equipped cosmetics, personal bests, and unlocked achievements per user.
 */

const mongoose = require('mongoose');

const arcadeProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    // Spendable virtual coin balance (authoritative)
    coins: {
      type: Number,
      default: 50, // Starter coins
      min: [0, 'Coin balance cannot be negative.'],
    },
    // Lifetime arcade points (used for leaderboards and prestige)
    arcadePoints: {
      type: Number,
      default: 0,
      index: true,
    },
    // Equipped cosmetic items
    equippedSkin: {
      type: String,
      default: 'skin_classic',
    },
    equippedAccessory: {
      type: String,
      default: 'acc_none',
    },
    equippedTheme: {
      type: String,
      default: 'theme_emerald',
    },
    // User preferences
    soundEnabled: {
      type: Boolean,
      default: true,
    },
    // Personal best scores per game
    bestScores: {
      bugHunt: { type: Number, default: 0 },
      logicBlocks: { type: Number, default: 0 },
      outputRush: { type: Number, default: 0 },
      coinDash: { type: Number, default: 0 },
    },
    // Games played counters
    gamesPlayed: {
      bugHunt: { type: Number, default: 0 },
      logicBlocks: { type: Number, default: 0 },
      outputRush: { type: Number, default: 0 },
      coinDash: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    // Achievements tracking
    unlockedAchievements: {
      type: [String],
      default: [],
    },
    claimedAchievements: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ArcadeProfile', arcadeProfileSchema);
