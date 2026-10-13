/**
 * ArcadeDailyChallenge Model
 * 
 * Tracks player progress and claims for daily rotating challenges.
 */

const mongoose = require('mongoose');

const arcadeDailyChallengeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    dateKey: {
      type: String, // 'YYYY-MM-DD' UTC
      required: true,
      index: true,
    },
    challengeId: {
      type: String,
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
    },
    target: {
      type: Number,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    claimed: {
      type: Boolean,
      default: false,
    },
    rewardCoins: {
      type: Number,
      required: true,
    },
    rewardPoints: {
      type: Number,
      default: 50,
    },
  },
  { timestamps: true }
);

arcadeDailyChallengeSchema.index({ userId: 1, dateKey: 1, challengeId: 1 }, { unique: true });

module.exports = mongoose.model('ArcadeDailyChallenge', arcadeDailyChallengeSchema);
