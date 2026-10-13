/**
 * Mistake Controller
 *
 * Returns the student's actual recorded mistake history from MongoDB.
 * Populates problem and submission details for display on the Mistakes page.
 * Also provides recurring mistake analytics and practice recommendations.
 */

const Attempt = require('../models/Attempt');
const Problem = require('../models/Problem');
const SkillProfile = require('../models/SkillProfile');
const Submission = require('../models/Submission');
const Intervention = require('../models/Intervention');
const { generatePracticeRecommendation } = require('../services/ai.service');
const { updateRealRunImprovementStatus } = require('../services/recurrence.service');

// ---------------------------------------------------------------------------
// GET /api/mistakes — list all recorded mistake attempts for the authenticated user
// ---------------------------------------------------------------------------
const getMistakes = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all attempts where an actual error occurred (not passed, not service unavailable)
    const attempts = await Attempt.find({
      userId,
      errorType: {
        $nin: ['None', 'Execution Service Unavailable'],
      },
    })
      .populate('problemId', 'title difficulty tags')
      .populate(
        'submissionId',
        'language errorMessage errorLine submittedCode testResults passedTestCases totalTestCases status stderr'
      )
      .sort({ createdAt: -1 })
      .limit(50);

    const mistakes = await Promise.all(
      attempts.map(async (attempt) => {
        const sub = attempt.submissionId;
        let prob = attempt.problemId;

        // If populate() failed (e.g. deleted problem), attempt a direct lookup by _id
        if (!prob && attempt.problemId) {
          try {
            prob = await Problem.findById(attempt.problemId).select('title difficulty tags').lean();
          } catch (_) {
            prob = null;
          }
        }

        // --- Extract first failed test case for evidence display ---
        let firstFailed = null;
        if (sub && sub.testResults && sub.testResults.length > 0) {
          const failedTc =
            sub.testResults.find((t) => !t.passed && !t.isHidden) ||
            sub.testResults.find((t) => !t.passed);

          if (failedTc) {
            firstFailed = {
              input: failedTc.input || '',
              expectedOutput: failedTc.expectedOutput || '',
              // Only include actualOutput if non-empty to avoid blank "Received:" display
              actualOutput: (failedTc.actualOutput || '').trim() || null,
            };
          }
        }

        // --- Map errorType to a display-friendly entry ---
        const errorType = attempt.errorType || 'LogicError';

        return {
          _id: attempt._id,
          // Use populated or fallback-fetched problem title; never "Unknown Problem"
          problemTitle: prob?.title || `Problem (ID: ${String(attempt.problemId).slice(-6)})`,
          problemId: prob?._id || attempt.problemId,
          difficulty: prob?.difficulty || 'easy',
          tags: prob?.tags || [],
          language: sub?.language || 'python',
          errorType,
          errorLine: attempt.errorLine || null,
          // Include compiler/runtime error message if available
          errorMessage: (sub?.errorMessage || sub?.stderr || '').trim() || '',
          attemptNumber: attempt.attemptNumber,
          hintLevel: attempt.hintLevel,
          solutionRevealed: attempt.solutionRevealed,
          resolved: attempt.resolved,
          createdAt: attempt.createdAt,
          passedTestCases: sub?.passedTestCases || 0,
          totalTestCases: sub?.totalTestCases || 0,
          failedTestCase: firstFailed,
        };
      })
    );

    res.json(mistakes);
  } catch (err) {
    console.error('[Mistakes] Get error:', err.message);
    res.status(500).json({ error: 'Could not fetch mistakes.' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/mistakes/analytics — get aggregated mistake pattern analytics
// ---------------------------------------------------------------------------
const getMistakeAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get skill profile for pre-computed error patterns
    const profile = await SkillProfile.findOne({ userId });

    // Count total submissions and passed submissions for success rate
    const [totalSubmissions, passedSubmissions] = await Promise.all([
      Submission.countDocuments({ userId }),
      Submission.countDocuments({ userId, status: 'passed' }),
    ]);

    // Get distinct problems attempted (via submissions)
    const distinctProblemsByAttempt = await Submission.distinct('problemId', { userId });
    const totalProblemsAttempted = distinctProblemsByAttempt.length;

    // Get distinct problems solved (passed)
    const distinctProblemsSolved = await Submission.distinct('problemId', { userId, status: 'passed' });
    const totalProblemsSolved = distinctProblemsSolved.length;

    // Build per-category mistake analytics from the skill profile & interventions
    const errorPatterns = profile?.errorPatterns || [];

    const mistakeCategories = await Promise.all(
      errorPatterns.map(async (ep) => {
        const totalOccurrences = ep.count || 0;
        const correctedCount = ep.correctedCount || 0;
        const distinctProblemsCount = ep.distinctProblems?.length || 0;
        const uncorrected = Math.max(0, totalOccurrences - correctedCount);
        const isRecurring = (distinctProblemsCount >= 3 || totalOccurrences >= 3) && uncorrected >= 2;

        // Fetch intervention tracking data for this category
        const intervention = await Intervention.findOne({ userId, mistakeCategory: ep.errorType });
        const runProgress = await updateRealRunImprovementStatus(userId, ep.errorType);

        // Fetch recent problem history for this specific mistake category
        const recentCategoryAttempts = await Attempt.find({
          userId,
          $or: [{ errorType: ep.errorType }, { resolved: true }],
        })
          .populate('problemId', 'title difficulty')
          .sort({ createdAt: -1 })
          .limit(6);

        const realCodingProgress = recentCategoryAttempts.map((att) => ({
          problemId: att.problemId?._id || att.problemId,
          title: att.problemId?.title || 'Coding Problem',
          difficulty: att.problemId?.difficulty || 'easy',
          passed: att.resolved || att.errorType === 'None',
          errorType: att.errorType,
          date: att.createdAt,
        }));

        return {
          errorType: ep.errorType,
          totalOccurrences,
          correctedCount,
          uncorrectedCount: uncorrected,
          distinctProblems: distinctProblemsCount,
          isRecurring,
          lastSeen: ep.lastSeen,
          lastCorrectedDate: ep.lastCorrectedDate || null,
          practiceStatus: runProgress.status || intervention?.status || (isRecurring ? 'NEW' : 'NONE'),
          practiceCompleted: intervention?.completed || false,
          completedAt: intervention?.completedAt || null,
          firstAttemptCorrect: intervention?.firstAttemptCorrect || false,
          improvementCheckCorrect: intervention?.improvementCheckCorrect || false,
          realCodingProgress,
        };
      })
    );

    mistakeCategories.sort((a, b) => b.totalOccurrences - a.totalOccurrences);

    // Identify top recurring weaknesses
    const recurringWeaknesses = mistakeCategories
      .filter(c => c.isRecurring)
      .slice(0, 3)
      .map(c => c.errorType);

    // Recent activity (last 30 submissions with timestamps for charting)
    const recentSubmissions = await Submission.find({ userId })
      .select('status createdAt problemId language errorType')
      .populate('problemId', 'title difficulty tags')
      .sort({ createdAt: -1 })
      .limit(30);

    // Build activity timeline: group by date
    const activityByDate = {};
    for (const sub of recentSubmissions) {
      const dateKey = new Date(sub.createdAt).toLocaleDateString('en-CA'); // YYYY-MM-DD
      if (!activityByDate[dateKey]) {
        activityByDate[dateKey] = { date: dateKey, submissions: 0, passed: 0, failed: 0 };
      }
      activityByDate[dateKey].submissions++;
      if (sub.status === 'passed') activityByDate[dateKey].passed++;
      else activityByDate[dateKey].failed++;
    }

    const activityTimeline = Object.values(activityByDate)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14); // Last 14 days

    const successRate = totalSubmissions > 0
      ? Math.round((passedSubmissions / totalSubmissions) * 100)
      : 0;

    res.json({
      overview: {
        totalProblemsAttempted,
        totalProblemsSolved,
        totalSubmissions,
        successRate,
        accuracy: profile?.accuracy || 0,
        streak: profile?.streak || 0,
        lastActiveDate: profile?.lastActiveDate || null,
      },
      mistakeCategories,
      recurringWeaknesses,
      activityTimeline,
      hasData: totalSubmissions > 0,
    });
  } catch (err) {
    console.error('[Mistakes] Analytics error:', err.message);
    res.status(500).json({ error: 'Could not fetch mistake analytics.' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/mistakes/recommend — get a practice recommendation for a weakness
// ---------------------------------------------------------------------------
const getPracticeRecommendation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { errorType } = req.query;

    if (!errorType) {
      return res.status(400).json({ error: 'errorType query parameter is required.' });
    }

    // Find problems the user hasn't mastered yet, matching topics related to the error type
    const ERROR_TYPE_TOPIC_MAP = {
      IndexError: ['Arrays', 'Strings', 'Loops'],
      SyntaxError: ['Basic Problem Solving'],
      LogicError: ['Basic Problem Solving', 'Sorting', 'Loops'],
      TypeError: ['Basic Problem Solving'],
      RuntimeError: ['Recursion', 'Loops'],
      TimeLimitExceeded: ['Sorting', 'Hash Maps', 'Two Pointers'],
      CompilationError: ['Basic Problem Solving'],
      NullError: ['Basic Problem Solving', 'Recursion'],
    };

    const relevantTopics = ERROR_TYPE_TOPIC_MAP[errorType] || ['Basic Problem Solving'];

    // Find problems with matching tags that the user hasn't solved
    const solvedProblemIds = await Submission.distinct('problemId', { userId, status: 'passed' });

    const candidateProblems = await Problem.find({
      tags: { $in: relevantTopics },
      isPublished: true,
      _id: { $nin: solvedProblemIds },
    })
      .select('title difficulty tags description')
      .limit(10);

    if (candidateProblems.length === 0) {
      return res.json({
        recommendation: null,
        message: 'No matching practice problems found. You may have already solved all related problems!',
      });
    }

    // Prefer easy/medium problems, pick a good candidate
    const easyProbs = candidateProblems.filter(p => p.difficulty === 'easy');
    const mediumProbs = candidateProblems.filter(p => p.difficulty === 'medium');
    const recommended = easyProbs[0] || mediumProbs[0] || candidateProblems[0];

    // Generate an AI explanation of why this problem is recommended
    let reason = `This problem will help you practice ${relevantTopics.join(' and ')}, which is directly related to your ${errorType} mistakes.`;
    try {
      reason = await generatePracticeRecommendation({
        errorType,
        problemTitle: recommended.title,
        problemTags: recommended.tags,
        problemDifficulty: recommended.difficulty,
      });
    } catch {
      // Fall back to the static reason — that's fine
    }

    res.json({
      recommendation: {
        _id: recommended._id,
        title: recommended.title,
        difficulty: recommended.difficulty,
        tags: recommended.tags,
        reason,
      },
    });
  } catch (err) {
    console.error('[Mistakes] Recommend error:', err.message);
    res.status(500).json({ error: 'Could not fetch practice recommendation.' });
  }
};

module.exports = { getMistakes, getMistakeAnalytics, getPracticeRecommendation };
