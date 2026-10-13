/**
 * Dashboard Controller
 * 
 * Assembles real data for the personalized dashboard from MongoDB.
 * Strictly database-backed statistics.
 */

const mongoose = require('mongoose');
const Submission = require('../models/Submission');
const Attempt = require('../models/Attempt');
const Run = require('../models/Run');
const Hint = require('../models/Hint');
const SkillProfile = require('../models/SkillProfile');
const User = require('../models/User');
const Problem = require('../models/Problem');
const { generateFocusRecommendation } = require('../services/ai.service');

// ---------------------------------------------------------------------------
// GET /api/dashboard — get personalized dashboard data
// ---------------------------------------------------------------------------
const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjId = new mongoose.Types.ObjectId(userId);

    // Load user, skill profile, recent submissions, total runs, and aggregates in parallel
    const [
      user,
      skillProfile,
      recentSubmissions,
      totalSubmissions,
      passedSubmissions,
      totalRunsCount,
      attemptDistinctAttempted,
      submissionDistinctAttempted,
      submissionDistinctSolved,
      attemptDistinctSolved,
      hintsCount,
      sessionAggregates,
    ] = await Promise.all([
      User.findById(userId),
      SkillProfile.findOne({ userId }),
      Submission.find({ userId })
        .populate('problemId', 'title difficulty tags')
        .sort({ createdAt: -1 })
        .limit(10),
      Submission.countDocuments({ userId }),
      Submission.countDocuments({ userId, status: 'passed' }),
      Run.countDocuments({ userId }),
      Attempt.distinct('problemId', { userId }),
      Submission.distinct('problemId', { userId }),
      Submission.distinct('problemId', { userId, status: 'passed' }),
      Attempt.distinct('problemId', { userId, resolved: true }),
      Hint.countDocuments({ userId }),
      Attempt.aggregate([
        { $match: { userId: userObjId } },
        {
          $group: {
            _id: null,
            totalSessionHints: { $sum: '$hintsUsed' },
            totalSessionExplain: { $sum: '$explainErrorUsed' },
          },
        },
      ]),
    ]);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Combine distinct attempted and solved problems from both Attempts and Submissions
    const allAttemptedSet = new Set([
      ...attemptDistinctAttempted.map(id => id.toString()),
      ...submissionDistinctAttempted.map(id => id.toString()),
    ]);
    const allSolvedSet = new Set([
      ...attemptDistinctSolved.map(id => id.toString()),
      ...submissionDistinctSolved.map(id => id.toString()),
    ]);

    const totalProblemsAttempted = allAttemptedSet.size;
    const totalProblemsSolved = allSolvedSet.size;
    const totalSubmissionsPassed = passedSubmissions;
    const totalSubmissionsFailed = Math.max(0, totalSubmissions - passedSubmissions);
    const successRate = totalSubmissions > 0
      ? Math.round((passedSubmissions / totalSubmissions) * 100)
      : 0;

    const totalRuns = totalRunsCount;
    const avgRunsPerProblem = totalProblemsAttempted > 0
      ? parseFloat((totalRuns / totalProblemsAttempted).toFixed(1))
      : 0;

    const hintsUsed = sessionAggregates[0]?.totalSessionHints || hintsCount || 0;
    const explainErrorUsed = sessionAggregates[0]?.totalSessionExplain || 0;

    // Mistake categories breakdown
    const errorPatterns = skillProfile?.errorPatterns || [];
    const commonMistakes = errorPatterns
      .filter((e) => e.count > 0)
      .map((e) => {
        const uncorrected = Math.max(0, e.count - (e.correctedCount || 0));
        const isRecurring = e.count >= 3 && uncorrected >= 2;
        return {
          errorType: e.errorType,
          count: e.count,
          correctedCount: e.correctedCount || 0,
          uncorrectedCount: uncorrected,
          isRecurring,
          lastSeen: e.lastSeen,
        };
      })
      .sort((a, b) => b.count - a.count);

    const mostCommonMistake = commonMistakes[0]?.errorType || 'None';
    const totalCorrectedMistakes = errorPatterns.reduce((acc, curr) => acc + (curr.correctedCount || 0), 0);
    const recurringMistakesCount = commonMistakes.filter((m) => m.isRecurring).length;

    // Build structured stats from real data
    const stats = {
      totalProblemsAttempted,
      totalProblemsSolved,
      totalSubmissions,
      totalSubmissionsPassed,
      totalSubmissionsFailed,
      totalRuns,
      avgRunsPerProblem,
      hintsUsed,
      explainErrorUsed,
      mostCommonMistake,
      successRate,
      totalSolved: skillProfile?.totalSolved || totalProblemsSolved,
      totalAttempts: skillProfile?.totalAttempts || totalSubmissions,
      accuracy: skillProfile?.accuracy || successRate,
      streak: skillProfile?.streak || 0,
    };

    // Language and topic skill progress
    const languageSkills = skillProfile?.languages || [];
    const topicSkills = skillProfile?.topics || [];

    // Identify weak skills needing improvement
    const skillsNeedingImprovement = topicSkills
      .filter((t) => t.attempted > 0 && (t.solved / t.attempted) < 0.6)
      .map((t) => ({
        name: t.name,
        attempted: t.attempted,
        solved: t.solved,
        accuracy: Math.round((t.solved / t.attempted) * 100),
      }));

    // Recent activity (last 10 submissions)
    const recentActivity = recentSubmissions.map((sub) => ({
      _id: sub._id,
      problemTitle: sub.problemId?.title || 'Unknown Problem',
      problemId: sub.problemId?._id,
      difficulty: sub.problemId?.difficulty,
      tags: sub.problemId?.tags || [],
      language: sub.language,
      status: sub.status,
      errorType: sub.errorType,
      createdAt: sub.createdAt,
    }));

    // Progress over time (last 14 days activity)
    const last14DaysSubmissions = await Submission.find({
      userId,
      createdAt: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) }
    }).select('status createdAt');

    const activityByDate = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      activityByDate[dateStr] = { date: dateStr, count: 0, passed: 0 };
    }

    last14DaysSubmissions.forEach((sub) => {
      const dateStr = new Date(sub.createdAt).toISOString().split('T')[0];
      if (activityByDate[dateStr]) {
        activityByDate[dateStr].count += 1;
        if (sub.status === 'passed') activityByDate[dateStr].passed += 1;
      }
    });

    const learningProgressOverTime = Object.values(activityByDate);

    // Generate a personalized focus recommendation using AI
    const topErrors = commonMistakes.slice(0, 3).map((e) => e.errorType);
    const weakTopics = skillsNeedingImprovement.slice(0, 3).map((t) => t.name);

    const firstName = user.name.split(' ')[0];
    const focusMessage = await generateFocusRecommendation({
      userName: firstName,
      topErrors,
      weakTopics,
    });

    // Identify next recommended challenge
    let nextRecommendedProblem = null;
    try {
      const solvedIds = Array.from(allSolvedSet).map((id) => new mongoose.Types.ObjectId(id));
      const filterBase = {
        _id: { $nin: solvedIds },
        isPublished: true,
        isInternalChallenge: { $ne: true },
      };

      if (weakTopics.length > 0) {
        nextRecommendedProblem = await Problem.findOne({
          ...filterBase,
          tags: { $in: weakTopics },
        }).select('title difficulty tags estimatedTime description');
      }

      if (!nextRecommendedProblem) {
        nextRecommendedProblem = await Problem.findOne(filterBase)
          .sort({ difficulty: 1 })
          .select('title difficulty tags estimatedTime description');
      }
    } catch {
      // Graceful fallback if problem query fails
      nextRecommendedProblem = null;
    }

    res.json({
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        preferredLanguage: user.preferredLanguage,
      },
      stats: {
        ...stats,
        totalCorrectedMistakes,
        recurringMistakesCount,
      },
      commonMistakes,
      languageSkills,
      topicSkills,
      skillsNeedingImprovement,
      recentActivity,
      learningProgressOverTime,
      focusMessage,
      nextRecommendedProblem,
    });
  } catch (err) {
    console.error('[Dashboard] Get error:', err.message);
    res.status(500).json({ error: 'Could not load dashboard data.' });
  }
};

module.exports = { getDashboard };
