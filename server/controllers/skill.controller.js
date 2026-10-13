/**
 * Skill Controller
 * 
 * Returns the student's real skill development data from their SkillProfile.
 */

const SkillProfile = require('../models/SkillProfile');

// ---------------------------------------------------------------------------
// GET /api/skills — get the authenticated user's skill profile
// ---------------------------------------------------------------------------
const getSkills = async (req, res) => {
  try {
    const profile = await SkillProfile.findOne({ userId: req.user.id });

    if (!profile) {
      // New user with no activity yet — return an honest empty state
      return res.json({
        hasData: false,
        languages: [],
        topics: [],
        errorPatterns: [],
        totalSolved: 0,
        totalAttempts: 0,
        accuracy: 0,
        streak: 0,
      });
    }

    res.json({
      hasData: profile.totalAttempts > 0,
      languages: profile.languages,
      topics: profile.topics,
      errorPatterns: profile.errorPatterns.sort((a, b) => b.count - a.count),
      totalSolved: profile.totalSolved,
      totalAttempts: profile.totalAttempts,
      accuracy: profile.accuracy,
      streak: profile.streak,
      lastActiveDate: profile.lastActiveDate,
    });
  } catch (err) {
    console.error('[Skills] Get error:', err.message);
    res.status(500).json({ error: 'Could not fetch skill data.' });
  }
};

module.exports = { getSkills };
