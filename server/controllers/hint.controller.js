/**
 * Hint Controller
 * 
 * Handles requesting progressive hints from the BugBuddy AI mentor.
 * All AI calls happen server-side — the API key is never exposed to clients.
 */

const Attempt = require('../models/Attempt');
const Hint = require('../models/Hint');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const SkillProfile = require('../models/SkillProfile');
const { generateHint, explainError: explainErrorService } = require('../services/ai.service');

const MAX_HINT_LEVEL = 3;

// ---------------------------------------------------------------------------
// POST /api/hints — request progressive hint OR error explanation
// ---------------------------------------------------------------------------
const requestHint = async (req, res) => {
  try {
    const { attemptId, submissionId, problemId, code, language, currentHintLevel, explainError, errorDetails } = req.body;
    const userId = req.user.id;

    let submission, problem, attempt, submittedCode, problemLanguage, errorType, errorMessage, errorLine, testResults;

    if (attemptId) {
      attempt = await Attempt.findById(attemptId);
      if (!attempt) return res.status(404).json({ error: 'Attempt not found.' });
      if (attempt.userId.toString() !== userId) return res.status(403).json({ error: 'Unauthorized.' });

      submission = await Submission.findById(attempt.submissionId);
      problem = await Problem.findById(attempt.problemId);
    } else if (submissionId) {
      submission = await Submission.findById(submissionId);
      if (!submission) return res.status(404).json({ error: 'Submission not found.' });
      if (submission.userId.toString() !== userId) return res.status(403).json({ error: 'Unauthorized.' });

      problem = await Problem.findById(submission.problemId);
      attempt = await Attempt.findOne({ submissionId: submission._id });
    } else if (problemId) {
      problem = await Problem.findById(problemId);
      if (!problem) return res.status(404).json({ error: 'Problem not found.' });
    } else {
      return res.status(400).json({ error: 'attemptId, submissionId, or problemId is required.' });
    }

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found.' });
    }

    submittedCode = code || (submission ? submission.submittedCode : '');
    problemLanguage = language || (submission ? submission.language : 'python');

    // -----------------------------------------------------------------------
    // MODE 1: EXPLAIN THE OBSERVED ERROR
    // -----------------------------------------------------------------------
    if (explainError) {
      if (!attempt && problemId) {
        attempt = await Attempt.findOne({ userId, problemId, finalStatus: 'in_progress' }).sort({ createdAt: -1 });
      }
      if (attempt) {
        attempt.explainErrorUsed = (attempt.explainErrorUsed || 0) + 1;
        await attempt.save();
      }

      const activeErrorType = errorDetails?.errorType || (submission ? submission.errorType : 'Execution Error');
      const activeErrorMessage = errorDetails?.errorMessage || (submission ? submission.errorMessage : '');
      const activeErrorLine = errorDetails?.errorLine || (submission ? submission.errorLine : null);
      const activeTestResults = errorDetails?.testResults || (submission ? submission.testResults : []);

      let failedTestCase = null;
      if (activeTestResults && activeTestResults.length > 0) {
        const failed = activeTestResults.find((t) => !t.passed);
        if (failed) {
          failedTestCase = {
            input: failed.input,
            expectedOutput: failed.expectedOutput,
            actualOutput: failed.actualOutput,
          };
        }
      }

      const explanationText = await explainErrorService({
        problemTitle: problem.title,
        problemDescription: problem.description,
        submittedCode,
        language: problemLanguage,
        errorType: activeErrorType,
        errorMessage: activeErrorMessage,
        errorLine: activeErrorLine,
        failedTestCase,
        testResults: activeTestResults,
      });

      return res.json({
        hintLevel: currentHintLevel || 0,
        hintText: explanationText,
        isExplanation: true,
        cached: false,
      });
    }

    // -----------------------------------------------------------------------
    // MODE 2: PROGRESSIVE HINT REQUEST
    // -----------------------------------------------------------------------
    errorType = submission ? submission.errorType : 'Code Analysis';
    errorMessage = submission ? submission.errorMessage : '';
    errorLine = submission ? submission.errorLine : null;
    testResults = submission ? submission.testResults : [];

    const isUnavailable = submission
      ? (submission.status === 'unavailable' || submission.errorType === 'Execution Service Unavailable')
      : false;

    let failedTestCase = null;
    if (testResults && testResults.length > 0) {
      const failed = testResults.find((t) => !t.passed);
      if (failed) {
        failedTestCase = {
          input: failed.input,
          expectedOutput: failed.expectedOutput,
          actualOutput: failed.actualOutput,
        };
      }
    }

    let newHintLevel = 1;
    if (!attempt && problemId) {
      attempt = await Attempt.findOne({ userId, problemId, finalStatus: 'in_progress' }).sort({ createdAt: -1 });
    }

    if (attempt) {
      attempt.hintsUsed = (attempt.hintsUsed || 0) + 1;
      await attempt.save();
      newHintLevel = attempt.hintLevel + 1;
      newHintLevel = Math.min(newHintLevel, MAX_HINT_LEVEL);

      const existingHint = await Hint.findOne({ attemptId: attempt._id, hintLevel: newHintLevel });
      if (existingHint) {
        attempt.hintLevel = newHintLevel;
        attempt.hintRequested = true;
        if (newHintLevel === MAX_HINT_LEVEL) attempt.solutionRevealed = true;
        await attempt.save();

        return res.json({
          hintLevel: newHintLevel,
          hintText: existingHint.hintText,
          isExplanation: false,
          cached: true,
        });
      }
    } else {
      const baseLevel = Number(currentHintLevel) || 0;
      newHintLevel = baseLevel + 1;
      newHintLevel = Math.min(newHintLevel, MAX_HINT_LEVEL);
    }

    const skillProfile = await SkillProfile.findOne({ userId });
    const recurringErrors = skillProfile
      ? skillProfile.errorPatterns
          .filter((e) => e.count > 1)
          .sort((a, b) => b.count - a.count)
          .slice(0, 3)
          .map((e) => e.errorType)
      : [];

    const hintText = await generateHint({
      problemTitle: problem.title,
      problemDescription: problem.description,
      submittedCode,
      language: problemLanguage,
      errorType,
      errorMessage,
      errorLine,
      hintLevel: newHintLevel,
      failedTestCase,
      recurringErrors,
      isUnavailable,
    });

    if (attempt) {
      await Hint.create({
        userId,
        problemId: problem._id,
        attemptId: attempt._id,
        hintLevel: newHintLevel,
        hintText,
      });

      attempt.hintLevel = newHintLevel;
      attempt.hintRequested = true;
      if (newHintLevel === MAX_HINT_LEVEL) {
        attempt.solutionRevealed = true;
      }
      await attempt.save();
    }

    return res.json({
      hintLevel: newHintLevel,
      hintText,
      isExplanation: false,
      cached: false,
    });
  } catch (err) {
    console.error('[Hints] Request error:', err.message);
    res.status(500).json({ error: 'Could not generate hint or error explanation. Please try again.' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/hints/:attemptId — get all hints for a specific attempt
// ---------------------------------------------------------------------------
const getHintsForAttempt = async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.attemptId);
    if (!attempt) {
      return res.status(404).json({ error: 'Attempt not found.' });
    }
    if (attempt.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    const hints = await Hint.find({ attemptId: req.params.attemptId }).sort({ hintLevel: 1 });
    res.json(hints);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch hints.' });
  }
};

module.exports = { requestHint, getHintsForAttempt };
