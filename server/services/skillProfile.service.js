/**
 * Skill Profile Service
 * 
 * Updates a student's SkillProfile after each submission.
 * Called by the submission controller after storing a submission.
 */

const SkillProfile = require('../models/SkillProfile');

/**
 * Updates the student's SkillProfile based on a newly completed submission.
 * 
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.problemId - The problem ID (for distinct problem tracking)
 * @param {string} params.language - 'python' | 'java' | 'c' | 'cpp'
 * @param {string[]} params.tags - Problem topics (e.g. ['Arrays', 'Loops'])
 * @param {boolean} params.passed - Whether the submission passed all tests
 * @param {string} params.errorType - Classified error type
 */
async function updateSkillProfile({ userId, problemId, language, tags, passed, errorType }) {
  // Find existing profile or create a new one for this user
  let profile = await SkillProfile.findOne({ userId });
  if (!profile) {
    profile = new SkillProfile({ userId });
  }

  // Update overall counters
  profile.totalAttempts += 1;
  if (passed) profile.totalSolved += 1;
  profile.accuracy = profile.totalAttempts > 0
    ? Math.round((profile.totalSolved / profile.totalAttempts) * 100)
    : 0;

  // Update language stats
  updateSkillEntry(profile.languages, language, passed);

  // Update topic stats for each tag
  for (const tag of tags) {
    updateSkillEntry(profile.topics, tag, passed);
  }

  if (passed) {
    // If this submission passed, check if any previous error patterns need correctedCount incremented
    // We mark the most recent non-corrected error pattern as corrected
    if (profile.errorPatterns && profile.errorPatterns.length > 0) {
      // Find patterns that have uncorrected mistakes
      const recentIncorrect = profile.errorPatterns
        .filter(p => p.count > p.correctedCount)
        .sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen));
      
      // Credit correction to the most recent error type if it was recent (within 24h)
      if (recentIncorrect.length > 0) {
        const mostRecent = recentIncorrect[0];
        const hoursSinceLastSeen = mostRecent.lastSeen
          ? (Date.now() - new Date(mostRecent.lastSeen).getTime()) / (1000 * 60 * 60)
          : Infinity;
        
        // Only credit a correction if the student recently made this mistake
        if (hoursSinceLastSeen < 48) {
          mostRecent.correctedCount = (mostRecent.correctedCount || 0) + 1;
          mostRecent.lastCorrectedDate = new Date();
        }
      }
    }
  } else if (errorType && errorType !== 'None') {
    // Record the error pattern if this submission failed
    updateErrorPattern(profile.errorPatterns, errorType, problemId);
  }

  // Update streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (profile.lastActiveDate) {
    const lastDate = new Date(profile.lastActiveDate);
    lastDate.setHours(0, 0, 0, 0);
    const diffDays = Math.round((today - lastDate) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      profile.streak += 1; // Consecutive day
    } else if (diffDays > 1) {
      profile.streak = 1; // Streak broken, reset
    }
    // diffDays === 0 means already active today — keep streak as is
  } else {
    profile.streak = 1; // First activity
  }
  profile.lastActiveDate = new Date();

  await profile.save();
  return profile;
}

/**
 * Updates or creates a skill entry (for language or topic).
 * 
 * @param {Array} entries - The languages or topics array in the profile
 * @param {string} name - The skill name to update
 * @param {boolean} passed
 */
function updateSkillEntry(entries, name, passed) {
  if (!name) return;

  const normalizedName = name.toLowerCase();
  let entry = entries.find((e) => e.name.toLowerCase() === normalizedName);

  if (!entry) {
    entries.push({ name, attempted: 0, solved: 0, errorCount: 0 });
    entry = entries[entries.length - 1];
  }

  entry.attempted += 1;
  if (passed) {
    entry.solved += 1;
  } else {
    entry.errorCount += 1;
  }
}

/**
 * Increments the count for a specific error pattern and tracks problem context.
 * 
 * @param {Array} patterns - The errorPatterns array in the profile
 * @param {string} errorType
 * @param {string} problemId - Optional problem ID for distinct problem tracking
 */
function updateErrorPattern(patterns, errorType, problemId) {
  let pattern = patterns.find((p) => p.errorType === errorType);

  if (!pattern) {
    patterns.push({
      errorType,
      count: 0,
      correctedCount: 0,
      lastSeen: new Date(),
      lastCorrectedDate: null,
      distinctProblems: [],
    });
    pattern = patterns[patterns.length - 1];
  }

  pattern.count += 1;
  pattern.lastSeen = new Date();

  // Track which distinct problems this error appeared in
  if (problemId) {
    const pid = problemId.toString();
    const existing = (pattern.distinctProblems || []).map(p => p.toString());
    if (!existing.includes(pid)) {
      pattern.distinctProblems.push(problemId);
    }
  }
}

module.exports = { updateSkillProfile };
