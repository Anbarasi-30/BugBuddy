/**
 * ArcadeTransaction Model
 * 
 * Immutable ledger of all virtual coin operations (rewards and purchases).
 * Provides an auditable history and duplicate prevention via idempotency keys.
 */

const mongoose = require('mongoose');

const arcadeTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Amount credited (+ve) or debited (-ve)
    amount: {
      type: Number,
      required: true,
    },
    // Authoritative coin balance after the transaction
    balanceAfter: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['reward', 'purchase', 'daily_challenge', 'achievement', 'starter_gift'],
      required: true,
    },
    source: {
      type: String,
      enum: [
        'bug_hunt',
        'logic_blocks',
        'output_rush',
        'coin_dash',
        'shop_purchase',
        'daily_challenge',
        'achievement',
        'welcome',
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    // Optional idempotency key to prevent double-crediting
    idempotencyKey: {
      type: String,
      sparse: true,
      unique: true,
    },
  },
  { timestamps: true }
);

arcadeTransactionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('ArcadeTransaction', arcadeTransactionSchema);
