/**
 * ArcadeInventory Model
 * 
 * Stores cosmetic items owned by the user.
 */

const mongoose = require('mongoose');

const arcadeInventorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    itemId: {
      type: String,
      required: true,
    },
    itemType: {
      type: String,
      enum: ['skin', 'accessory', 'theme'],
      required: true,
    },
    purchasedPrice: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure a user cannot purchase the same item twice
arcadeInventorySchema.index({ userId: 1, itemId: 1 }, { unique: true });

module.exports = mongoose.model('ArcadeInventory', arcadeInventorySchema);
