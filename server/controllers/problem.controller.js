/**
 * Problem Controller
 * 
 * Handles fetching the problem library and individual problem details.
 */

const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const Attempt = require('../models/Attempt');

const ESTIMATED_TIMES = {
  easy: '10–15 min',
  medium: '20–30 min',
  hard: '35–45 min',
};

// ---------------------------------------------------------------------------
// GET /api/problems — list all published problems (excluding internal test challenges)
// ---------------------------------------------------------------------------
const getProblems = async (req, res) => {
  try {
    const { difficulty, tag, language, search, status } = req.query;

    // Build filter query: only published, non-internal problems
    const filter = {
      isPublished: true,
      isInternalChallenge: { $ne: true },
    };

    // Filter out internal diagnostic / test generated problem titles
    const excludedTitleRegex = /^(Rec Prob|Subsequent Prob|IntV2 Prob|Single Error Test|Run Tracking Test)/i;

    if (difficulty && difficulty !== 'all') {
      filter.difficulty = difficulty.toLowerCase();
    }
    if (tag && tag !== 'all') {
      filter.tags = tag;
    }
    if (language && language !== 'all') {
      filter.supportedLanguages = language.toLowerCase();
    }

    if (search && search.trim()) {
      filter.$and = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { title: { $not: excludedTitleRegex } },
      ];
    } else {
      filter.title = { $not: excludedTitleRegex };
    }

    const problems = await Problem.find(filter)
      .select('title difficulty tags supportedLanguages createdAt order description testCases')
      .sort({ order: 1, createdAt: 1 });

    // If the user is authenticated, enrich with their completion and in-progress status
    let completedProblemIds = new Set();
    let attemptedProblemIds = new Set();

    if (req.user) {
      const [solved, subAttempts, runAttempts] = await Promise.all([
        Submission.find({ userId: req.user.id, status: 'passed' }).distinct('problemId'),
        Submission.find({ userId: req.user.id }).distinct('problemId'),
        Attempt.find({ userId: req.user.id }).distinct('problemId'),
      ]);

      completedProblemIds = new Set(solved.map((id) => id.toString()));
      const allAttempted = new Set([
        ...subAttempts.map((id) => id.toString()),
        ...runAttempts.map((id) => id.toString()),
      ]);
      attemptedProblemIds = allAttempted;
    }

    let enriched = problems.map((p) => {
      const pid = p._id.toString();
      const isSolved = completedProblemIds.has(pid);
      const isAttempted = attemptedProblemIds.has(pid);
      const currentStatus = isSolved ? 'solved' : isAttempted ? 'in_progress' : 'unattempted';

      return {
        _id: p._id,
        title: p.title,
        difficulty: p.difficulty,
        tags: p.tags,
        supportedLanguages: p.supportedLanguages,
        completed: isSolved,
        status: currentStatus,
        estimatedTime: ESTIMATED_TIMES[p.difficulty] || '15–20 min',
        testCaseCount: (p.testCases || []).length,
      };
    });

    // Optional client filter by user status
    if (status && status !== 'all') {
      enriched = enriched.filter((p) => p.status === status);
    }

    res.json(enriched);
  } catch (err) {
    console.error('[Problems] Get all error:', err.message);
    res.status(500).json({ error: 'Could not fetch problems.' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/problems/:id — get a single problem's full details
// ---------------------------------------------------------------------------
const getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem || !problem.isPublished) {
      return res.status(404).json({ error: 'Problem not found.' });
    }

    // Filter out hidden test cases from what we return to the student
    const visibleTestCases = problem.testCases.filter((tc) => !tc.isHidden);

    res.json({
      _id: problem._id,
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      tags: problem.tags,
      supportedLanguages: problem.supportedLanguages,
      starterCode: problem.starterCode,
      expectedBehavior: problem.expectedBehavior,
      testCases: visibleTestCases,
    });
  } catch (err) {
    console.error('[Problems] Get by id error:', err.message);
    res.status(500).json({ error: 'Could not fetch problem details.' });
  }
};

module.exports = { getProblems, getProblemById };
