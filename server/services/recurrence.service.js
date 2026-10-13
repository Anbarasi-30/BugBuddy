/**
 * Recurrence Service
 *
 * Detects recurring mistake patterns across distinct problem debugging sessions.
 * Enforces session-scoped deduplication: once an intervention popup is shown
 * for a given (userId, mistakeCategory, sessionId) combination, no further
 * popup fires for that mistake in the same debugging session.
 *
 * Verifies real coding improvement by tracking subsequent Attempt history.
 */

const Attempt = require('../models/Attempt');
const SkillProfile = require('../models/SkillProfile');
const Intervention = require('../models/Intervention');
const { generateContextualChallenge } = require('../data/challengeTemplates');

// System/infra errors that are never treated as student mistakes
const EXCLUDED_ERRORS = new Set([
  'None',
  'Execution Service Unavailable',
  'UnknownError',
]);

/**
 * Detects whether a student has a recurring mistake pattern eligible for intervention.
 *
 * Rules:
 *  - Mistake must have appeared across ≥ 3 distinct problems/sessions in the SkillProfile.
 *  - Uncorrected count must be ≥ 2.
 *  - The intervention must NOT have already been shown in the current debugging session
 *    (sessionId) for this mistake category. This is stored in Intervention.sessionShown[].
 *
 * @param {string} userId
 * @param {string|null} currentProblemId
 * @param {string|null} sessionId       — The current Attempt._id (debugging session)
 * @param {object} runContext           — { errorType, errorMessage, errorLine, code,
 *                                          passedTestCases, totalTestCases }
 */
async function detectRecurringPattern(userId, currentProblemId = null, sessionId = null, runContext = {}) {
  // 1. Fetch skill profile for pre-aggregated error patterns
  const profile = await SkillProfile.findOne({ userId });
  if (!profile || !profile.errorPatterns || profile.errorPatterns.length === 0) {
    return { isRecurring: false };
  }

  // 2. Use errorType from runContext if provided, to check only the actual mistake
  const actualErrorType = runContext.errorType || null;

  // 3. Identify candidate recurring mistake patterns
  const candidatePatterns = profile.errorPatterns.filter((ep) => {
    if (EXCLUDED_ERRORS.has(ep.errorType)) return false;

    // If we know the actual error type from the run, only surface that pattern
    if (actualErrorType && ep.errorType !== actualErrorType) return false;

    const distinctCount = ep.distinctProblems ? ep.distinctProblems.length : 0;
    const totalCount = ep.count || 0;
    const uncorrected = Math.max(0, totalCount - (ep.correctedCount || 0));

    return (distinctCount >= 3 || totalCount >= 3) && uncorrected >= 2;
  });

  if (candidatePatterns.length === 0) {
    return { isRecurring: false };
  }

  // Sort by most distinct problems / highest count
  candidatePatterns.sort((a, b) => {
    const distA = a.distinctProblems ? a.distinctProblems.length : 0;
    const distB = b.distinctProblems ? b.distinctProblems.length : 0;
    return distB - distA || b.count - a.count;
  });

  // 4. Find first candidate that hasn't already been shown in this session
  for (const pattern of candidatePatterns) {
    const category = pattern.errorType;

    // Check whether this intervention was already shown in the current session
    // (session-scoped deduplication — the KEY anti-annoyance rule)
    let intervention = await Intervention.findOne({ userId, mistakeCategory: category });

    if (intervention && sessionId) {
      const alreadyShownThisSession = intervention.sessionShown.some(
        (s) => s.sessionId.toString() === sessionId.toString()
      );
      if (alreadyShownThisSession) {
        // Already shown for this session + category — skip silently
        continue;
      }
    }

    // Build contextual challenge from real run data
    const template = generateContextualChallenge(category, runContext);

    // Create or reuse the intervention record
    if (!intervention) {
      intervention = await Intervention.create({
        userId,
        mistakeCategory: category,
        challengeId: template.id,
        status: 'NEW',
        completed: false,
        sessionShown: [],
      });
    }

    // Record that we're showing this session (mark before returning so duplicate
    // calls within the same request cycle don't double-fire)
    if (sessionId) {
      intervention.sessionShown.push({
        sessionId,
        problemId: currentProblemId,
        shownAt: new Date(),
      });
      intervention.lastInterventionDate = new Date();
      await intervention.save();
    }

    return {
      isRecurring: true,
      mistakeCategory: category,
      distinctProblemsCount: pattern.distinctProblems ? pattern.distinctProblems.length : 3,
      totalOccurrences: pattern.count,
      intervention: {
        _id: intervention._id,
        status: intervention.status,
        completed: intervention.completed,
        attempts: intervention.attempts,
        firstAttemptCorrect: intervention.firstAttemptCorrect,
        improvementCheckCorrect: intervention.improvementCheckCorrect,
      },
      template,
    };
  }

  return { isRecurring: false };
}

/**
 * Analyzes real Attempt history after intervention completion to update understanding status.
 *
 * Called from the Mistakes page analytics and intervention history endpoints.
 */
async function updateRealRunImprovementStatus(userId, mistakeCategory) {
  const intervention = await Intervention.findOne({
    userId,
    mistakeCategory,
    completed: true,
  });

  if (!intervention || !intervention.completedAt) {
    return { status: intervention ? intervention.status : 'PRACTICING' };
  }

  // Find all subsequent attempts created AFTER the intervention was completed
  const subsequentAttempts = await Attempt.find({
    userId,
    createdAt: { $gte: intervention.completedAt },
  });

  if (subsequentAttempts.length === 0) {
    return { status: intervention.status, futureRunsCount: 0, cleanRunsCount: 0 };
  }

  // Group subsequent attempts by distinct problemId
  const problemMap = new Map();
  for (const att of subsequentAttempts) {
    const pid = att.problemId.toString();
    if (!problemMap.has(pid)) {
      problemMap.set(pid, []);
    }
    problemMap.get(pid).push(att);
  }

  const totalSubsequentProblems = problemMap.size;
  let cleanSubsequentProblems = 0;

  for (const [, attempts] of problemMap.entries()) {
    const hasMistake = attempts.some((a) => a.errorType === mistakeCategory);
    if (!hasMistake) {
      cleanSubsequentProblems++;
    }
  }

  // Update status based on real coding evidence
  let newStatus = intervention.status;
  if (totalSubsequentProblems >= 3 && cleanSubsequentProblems >= 2) {
    newStatus = 'UNDERSTOOD';
  } else if (totalSubsequentProblems >= 1 && cleanSubsequentProblems >= 1) {
    newStatus = 'IMPROVING';
  } else if (totalSubsequentProblems >= 1 && cleanSubsequentProblems === 0) {
    newStatus = 'PRACTICING';
  }

  if (newStatus !== intervention.status) {
    intervention.status = newStatus;
    intervention.futureRunsChecked = totalSubsequentProblems;
    intervention.futureRunsClean = cleanSubsequentProblems;
    await intervention.save();
  }

  return {
    status: newStatus,
    futureRunsCount: totalSubsequentProblems,
    cleanRunsCount: cleanSubsequentProblems,
  };
}

module.exports = {
  detectRecurringPattern,
  updateRealRunImprovementStatus,
};
