/**
 * ArcadeScore Model
 * 
 * Stores validated game session results for leaderboard aggregation,
 * personal best calculation, and activity tracking.
 */

const mongoose = require('mongoose');

const arcadeScoreSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    gameId: {
      type: String,
      enum: ['bug_hunt', 'logic_blocks', 'output_rush', 'coin_dash'],
      required: true,
      index: true,
    },
    score: {
      type: Number,
      required: true,
    },
    arcadePointsEarned: {
      type: Number,
      default: 0,
    },
    coinsEarned: {
      type: Number,
      default: 0,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Partitioning keys for efficient daily and weekly leaderboard queries
    periodDaily: {
      type: String, // 'YYYY-MM-DD' UTC
      required: true,
      index: true,
    },
    periodWeekly: {
      type: String, // 'YYYY-WW' UTC
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

arcadeScoreSchema.index({ periodDaily: 1, arcadePointsEarned: -1 });
arcadeScoreSchema.index({ periodWeekly: 1, arcadePointsEarned: -1 });
arcadeScoreSchema.index({ userId: 1, gameId: 1, score: -1 });

module.exports = mongoose.model('ArcadeScore', arcadeScoreSchema);
