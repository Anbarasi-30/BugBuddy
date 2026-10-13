/**
 * Intervention Controller
 *
 * Handles checks for recurring mistake mini-challenges, answer evaluations,
 * and retrieval of intervention status & real-run progress history.
 *
 * Session-scoped deduplication rule:
 *   Once the popup has been shown for a (userId, mistakeCategory, sessionId),
 *   no further popup fires for that combination within the same debugging session.
 *   This is enforced inside detectRecurringPattern() via Intervention.sessionShown[].
 */

const Intervention = require('../models/Intervention');
const { generateContextualChallenge } = require('../data/challengeTemplates');
const { detectRecurringPattern, updateRealRunImprovementStatus } = require('../services/recurrence.service');

// ---------------------------------------------------------------------------
// POST /api/interventions/check
//
// Checks whether the current run result qualifies for a recurring-mistake
// intervention. Called by the frontend immediately after a failed Run.
//
// Body (JSON):
//   problemId    — current problem ID
//   sessionId    — current debugging session (Attempt._id)
//   errorType    — classified error type from the run
//   errorMessage — raw stderr / error message (≤500 chars)
//   errorLine    — line number if available
//   code         — current editor code snapshot (≤2000 chars, truncated server-side)
//   passedTestCases
//   totalTestCases
// ---------------------------------------------------------------------------
const checkIntervention = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      problemId,
      sessionId,
      errorType,
      errorMessage = '',
      errorLine = null,
      code = '',
      passedTestCases = 0,
      totalTestCases = 0,
    } = req.body;

    // Build run context — limit code to 1500 chars to avoid storing large payloads
    const runContext = {
      errorType,
      errorMessage: (errorMessage || '').slice(0, 500),
      errorLine,
      code: (code || '').slice(0, 1500),
      passedTestCases,
      totalTestCases,
    };

    const result = await detectRecurringPattern(userId, problemId, sessionId, runContext);

    if (!result.isRecurring) {
      return res.json({ active: false });
    }

    res.json({
      active: true,
      mistakeCategory: result.mistakeCategory,
      distinctProblemsCount: result.distinctProblemsCount,
      totalOccurrences: result.totalOccurrences,
      intervention: result.intervention,
      template: result.template,
    });
  } catch (err) {
    console.error('[Intervention] Check error:', err.message);
    res.status(500).json({ error: 'Could not check intervention status.' });
  }
};

// ---------------------------------------------------------------------------
// POST /api/interventions/submit
//
// Submits student answer for a mini-challenge step ('challenge' or 'quickCheck').
// ---------------------------------------------------------------------------
const submitInterventionAnswer = async (req, res) => {
  try {
    const userId = req.user.id;
    const { interventionId, step, selectedIndex } = req.body;

    if (!interventionId || step === undefined || selectedIndex === undefined) {
      return res.status(400).json({ error: 'interventionId, step, and selectedIndex are required.' });
    }

    const intervention = await Intervention.findById(interventionId);
    if (!intervention) {
      return res.status(404).json({ error: 'Intervention not found.' });
    }

    if (intervention.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    // Regenerate the template — it was generated contextually on creation, but we
    // use the base template for answer checking since correctIndex is category-level
    const template = generateContextualChallenge(intervention.mistakeCategory, {});
    const selectedIdx = Number(selectedIndex);

    // ── STEP 1: INITIAL MINI-CHALLENGE ──────────────────────────────────────
    if (step === 'challenge') {
      const isCorrect = selectedIdx === template.challenge.correctIndex;
      intervention.attempts += 1;
      intervention.lastInterventionDate = new Date();

      if (isCorrect) {
        intervention.firstAttemptCorrect = true;
        intervention.status = 'IMPROVING';
        await intervention.save();

        return res.json({
          correct: true,
          explanation: template.challenge.explanation,
          concept: template.concept,
          nextStep: 'quickCheck',
          status: intervention.status,
        });
      } else {
        intervention.firstAttemptCorrect = false;
        intervention.status = 'PRACTICING';
        await intervention.save();

        return res.json({
          correct: false,
          incorrectHint: template.challenge.incorrectHint,
          concept: template.concept,
          nextStep: 'retry_challenge',
          status: intervention.status,
        });
      }
    }

    // ── STEP 2: IMPROVEMENT QUICK CHECK ─────────────────────────────────────
    if (step === 'quickCheck') {
      const isCorrect = selectedIdx === template.quickCheck.correctIndex;
      intervention.completed = true;
      intervention.completedAt = new Date();

      if (isCorrect) {
        intervention.improvementCheckCorrect = true;
        intervention.status = 'IMPROVING';
        await intervention.save();

        return res.json({
          correct: true,
          explanation: template.quickCheck.explanation,
          completed: true,
          status: intervention.status,
        });
      } else {
        intervention.improvementCheckCorrect = false;
        intervention.status = 'PRACTICING';
        await intervention.save();

        return res.json({
          correct: false,
          incorrectHint: template.quickCheck.incorrectHint,
          completed: true,
          status: intervention.status,
        });
      }
    }

    return res.status(400).json({ error: 'Invalid intervention step.' });
  } catch (err) {
    console.error('[Intervention] Submit error:', err.message);
    res.status(500).json({ error: 'Could not process intervention answer.' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/interventions/history
// ---------------------------------------------------------------------------
const getInterventionHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const interventions = await Intervention.find({ userId }).sort({ updatedAt: -1 });

    const enriched = await Promise.all(
      interventions.map(async (inter) => {
        const runProgress = await updateRealRunImprovementStatus(userId, inter.mistakeCategory);
        const template = generateContextualChallenge(inter.mistakeCategory, {});

        return {
          _id: inter._id,
          mistakeCategory: inter.mistakeCategory,
          concept: template.concept,
          status: runProgress.status || inter.status,
          completed: inter.completed,
          completedAt: inter.completedAt,
          firstAttemptCorrect: inter.firstAttemptCorrect,
          improvementCheckCorrect: inter.improvementCheckCorrect,
          futureRunsCount: runProgress.futureRunsCount || 0,
          cleanRunsCount: runProgress.cleanRunsCount || 0,
        };
      })
    );

    res.json(enriched);
  } catch (err) {
    console.error('[Intervention] History error:', err.message);
    res.status(500).json({ error: 'Could not fetch intervention history.' });
  }
};

module.exports = {
  checkIntervention,
  submitInterventionAnswer,
  getInterventionHistory,
};
