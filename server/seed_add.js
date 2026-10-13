/**
 * Additive Seed — Adds problems 24–53 without deleting existing records.
 * Run: node seed_add.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('./models/Problem');
const EXTRA1 = require('./problems_extra');
const EXTRA2 = require('./problems_extra2');

const NEW_PROBLEMS = [...EXTRA1, ...EXTRA2];

async function seedAdd() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[Seed] Connected to MongoDB Atlas.');

    let added = 0;
    for (const p of NEW_PROBLEMS) {
      const exists = await Problem.findOne({ title: p.title });
      if (!exists) {
        await Problem.create({ ...p, isPublished: true, isInternalChallenge: false });
        console.log(`  [+] Added: ${p.title}`);
        added++;
      } else {
        // Update order and content if already exists
        await Problem.updateOne({ title: p.title }, { $set: { order: p.order, tags: p.tags, difficulty: p.difficulty } });
        console.log(`  [~] Skipped (exists): ${p.title}`);
      }
    }

    const total = await Problem.countDocuments({ isPublished: true, isInternalChallenge: { $ne: true } });
    console.log(`\n[Seed] Done! Added ${added} new problems. Total published problems: ${total}`);
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error:', err.message);
    process.exit(1);
  }
}

seedAdd();
