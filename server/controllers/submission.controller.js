/**
 * Submission Controller
 * 
 * Handles code execution (Run) and formal code submission (Submit).
 * Tracks every run attempt in MongoDB, maintains debugging sessions,
 * calculates improvement between runs, and updates student skill profiles.
 */

const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const Attempt = require('../models/Attempt');
const Run = require('../models/Run');
const { executeCode } = require('../services/codeExecution.service');
const { classifyError } = require('../utils/errorClassifier');
const { updateSkillProfile } = require('../services/skillProfile.service');

/**
 * Finds an active in-progress debugging session for a user and problem,
 * or creates a new one if none exists.
 */
async function getOrCreateActiveSession(userId, problemId, language, code) {
  // Session active within past 4 hours
  const windowLimit = new Date(Date.now() - 4 * 60 * 60 * 1000);

  let session = await Attempt.findOne({
    userId,
    problemId,
    finalStatus: 'in_progress',
    updatedAt: { $gte: windowLimit },
  }).sort({ createdAt: -1 });

  if (!session) {
    const totalPrevious = await Attempt.countDocuments({ userId, problemId });
    const attemptNumber = totalPrevious + 1;

    session = await Attempt.create({
      userId,
      problemId,
      attemptNumber,
      startTime: new Date(),
      runCount: 0,
      totalRuns: 0,
      failedRuns: 0,
      bestPassedTests: 0,
      firstRunPassed: 0,
      totalTestCases: 0,
      hintsUsed: 0,
      explainErrorUsed: 0,
      finalStatus: 'in_progress',
      submissionStatus: 'not_submitted',
      latestCode: code || '',
      latestLanguage: language || 'python',
    });
  }

  return session;
}

/**
 * Helper to sanitize test results for hidden test cases
 */
const sanitizeTestResults = (results) => {
  if (!results) return [];
  return results.map((t) => {
    if (t.isHidden) {
      return {
        passed: t.passed,
        isHidden: true,
        input: 'Hidden Test Case',
        expectedOutput: 'Hidden Test Case',
        actualOutput: t.passed ? 'Passed' : 'Failed',
      };
    }
    return t;
  });
};

// ---------------------------------------------------------------------------
// POST /api/submissions/run — run code without creating a final submission
// ---------------------------------------------------------------------------
const runCode = async (req, res) => {
  try {
    const { problemId, language, code } = req.body;
    const userId = req.user.id;

    if (!problemId || !language || !code) {
      return res.status(400).json({ error: 'problemId, language, and code are required.' });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found.' });
    }

    // 1. Execute code against test cases
    const executionResult = await executeCode({
      language,
      code,
      testCases: problem.testCases,
    });

    // 2. Classify error type
    let errorType = 'None';
    let errorLine = null;

    if (executionResult.status === 'failed' || executionResult.status === 'timeout') {
      const classified = classifyError(
        executionResult.stderr,
        executionResult.stdout,
        language,
        executionResult.status,
        executionResult.statusDescription || ''
      );
      errorType = classified.errorType;
      errorLine = classified.errorLine;
    } else if (executionResult.status === 'unavailable') {
      errorType = 'Execution Service Unavailable';
    }

    // 3. Find or create active debugging session
    const session = await getOrCreateActiveSession(userId, problemId, language, code);

    // 4. Retrieve previous run in this session to calculate improvement & code change
    const lastRun = await Run.findOne({ sessionId: session._id }).sort({ createdAt: -1 });
    const runNumber = (await Run.countDocuments({ sessionId: session._id })) + 1;

    const codeChanged = lastRun ? lastRun.code !== code : true;
    const previousPassed = lastRun ? lastRun.passedTestCases : 0;
    const improvement = executionResult.passedTestCases - previousPassed;

    // 5. Store run attempt in MongoDB
    const runRecord = await Run.create({
      userId,
      problemId,
      sessionId: session._id,
      runNumber,
      language,
      code,
      status: executionResult.status,
      passedTestCases: executionResult.passedTestCases,
      totalTestCases: executionResult.totalTestCases,
      failedTestCases: executionResult.totalTestCases - executionResult.passedTestCases,
      errorType,
      errorMessage: executionResult.stderr || '',
      errorLine,
      stdout: executionResult.stdout || '',
      stderr: executionResult.stderr || '',
      testResults: executionResult.testResults || [],
      executionTimeMs: executionResult.executionTimeMs || null,
      codeChanged,
      improvement,
    });

    // 6. Update debugging session metrics
    session.runCount = runNumber;
    session.totalRuns = runNumber;
    if (executionResult.status !== 'passed') {
      session.failedRuns = (session.failedRuns || 0) + 1;
    }
    if (runNumber === 1) {
      session.firstRunPassed = executionResult.passedTestCases;
    }
    session.bestPassedTests = Math.max(session.bestPassedTests || 0, executionResult.passedTestCases);
    session.totalTestCases = executionResult.totalTestCases;
    session.latestCode = code;
    session.latestLanguage = language;
    session.errorType = errorType;
    session.errorLine = errorLine;
    session.endTime = new Date();

    if (executionResult.status === 'passed') {
      session.finalStatus = 'passed';
      session.resolved = true;
    }
    await session.save();

    // 7. Return execution details and session metadata
    res.json({
      runResult: {
        _id: runRecord._id,
        sessionId: session._id,
        runNumber,
        status: executionResult.status,
        passedTestCases: executionResult.passedTestCases,
        totalTestCases: executionResult.totalTestCases,
        errorType,
        errorMessage: executionResult.stderr || '',
        errorLine,
        stdout: executionResult.stdout || '',
        testResults: sanitizeTestResults(executionResult.testResults),
        executionTimeMs: executionResult.executionTimeMs,
        codeChanged,
        improvement,
        bestPassedTests: session.bestPassedTests,
        firstRunPassed: session.firstRunPassed,
      },
      attempt: {
        _id: session._id,
        attemptNumber: session.attemptNumber,
        runCount: session.runCount,
        hintsUsed: session.hintsUsed,
        explainErrorUsed: session.explainErrorUsed,
        bestPassedTests: session.bestPassedTests,
        finalStatus: session.finalStatus,
        submissionStatus: session.submissionStatus,
      },
    });
  } catch (err) {
    console.error('[Submissions] Run error:', err.message);
    res.status(500).json({ error: 'Execution failed. Please try again.' });
  }
};

// ---------------------------------------------------------------------------
// POST /api/submissions — submit code for a problem
// ---------------------------------------------------------------------------
const createSubmission = async (req, res) => {
  try {
    const { problemId, language, code } = req.body;
    const userId = req.user.id;

    if (!problemId || !language || !code) {
      return res.status(400).json({ error: 'problemId, language, and code are required.' });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found.' });
    }
    if (!problem.supportedLanguages.includes(language)) {
      return res.status(400).json({ error: `${language} is not supported for this problem.` });
    }

    // 1. Execute student code against test cases
    const executionResult = await executeCode({
      language,
      code,
      testCases: problem.testCases,
    });

    // 2. Classify error type
    let errorType = 'None';
    let errorLine = null;

    if (executionResult.status === 'failed' || executionResult.status === 'timeout') {
      const classified = classifyError(
        executionResult.stderr,
        executionResult.stdout,
        language,
        executionResult.status,
        executionResult.statusDescription || ''
      );
      errorType = classified.errorType;
      errorLine = classified.errorLine;
    } else if (executionResult.status === 'unavailable') {
      errorType = 'Execution Service Unavailable';
    }

    // 3. Store submission record in MongoDB
    const submission = await Submission.create({
      userId,
      problemId,
      language,
      submittedCode: code,
      status: executionResult.status,
      passedTestCases: executionResult.passedTestCases,
      totalTestCases: executionResult.totalTestCases,
      errorType,
      errorMessage: executionResult.stderr || '',
      errorLine,
      stdout: executionResult.stdout || '',
      stderr: executionResult.stderr || '',
      testResults: executionResult.testResults || [],
      executionTimeMs: executionResult.executionTimeMs,
    });

    // 4. Update debugging session
    const session = await getOrCreateActiveSession(userId, problemId, language, code);

    const runNumber = (await Run.countDocuments({ sessionId: session._id })) + 1;
    await Run.create({
      userId,
      problemId,
      sessionId: session._id,
      runNumber,
      language,
      code,
      status: executionResult.status,
      passedTestCases: executionResult.passedTestCases,
      totalTestCases: executionResult.totalTestCases,
      failedTestCases: executionResult.totalTestCases - executionResult.passedTestCases,
      errorType,
      errorMessage: executionResult.stderr || '',
      errorLine,
      stdout: executionResult.stdout || '',
      stderr: executionResult.stderr || '',
      testResults: executionResult.testResults || [],
      executionTimeMs: executionResult.executionTimeMs || null,
      codeChanged: true,
      improvement: executionResult.passedTestCases - (session.bestPassedTests || 0),
    });

    session.submissionId = submission._id;
    session.submissionStatus = executionResult.status === 'passed' ? 'accepted' : 'rejected';
    session.finalStatus = executionResult.status === 'passed' ? 'passed' : 'failed';
    session.resolved = executionResult.status === 'passed';
    session.runCount = runNumber;
    session.totalRuns = runNumber;
    session.bestPassedTests = Math.max(session.bestPassedTests || 0, executionResult.passedTestCases);
    session.totalTestCases = executionResult.totalTestCases;
    session.latestCode = code;
    session.latestLanguage = language;
    session.errorType = errorType;
    session.errorLine = errorLine;
    session.endTime = new Date();

    if (executionResult.status !== 'passed') {
      session.failedRuns = (session.failedRuns || 0) + 1;
    }
    await session.save();

    // 5. Update skill profile asynchronously if execution was available
    if (executionResult.status !== 'unavailable') {
      updateSkillProfile({
        userId,
        problemId,
        language,
        tags: problem.tags,
        passed: executionResult.status === 'passed',
        errorType,
      }).catch((err) => console.error('[Skills] Update failed:', err.message));
    }

    res.status(201).json({
      submission: {
        _id: submission._id,
        status: submission.status,
        passedTestCases: submission.passedTestCases,
        totalTestCases: submission.totalTestCases,
        errorType: submission.errorType,
        errorMessage: submission.errorMessage,
        errorLine: submission.errorLine,
        testResults: sanitizeTestResults(submission.testResults),
        executionTimeMs: submission.executionTimeMs,
      },
      attempt: {
        _id: session._id,
        attemptNumber: session.attemptNumber,
        hintLevel: session.hintLevel,
        runCount: session.runCount,
        bestPassedTests: session.bestPassedTests,
        finalStatus: session.finalStatus,
        submissionStatus: session.submissionStatus,
        hintsUsed: session.hintsUsed,
        explainErrorUsed: session.explainErrorUsed,
      },
    });
  } catch (err) {
    console.error('[Submissions] Create error:', err.message);
    res.status(500).json({ error: 'Submission failed. Please try again.' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/submissions — list authenticated user's submissions
// ---------------------------------------------------------------------------
const getSubmissions = async (req, res) => {
  try {
    const { problemId, limit = 20, page = 1 } = req.query;
    const filter = { userId: req.user.id };
    if (problemId) filter.problemId = problemId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const submissions = await Submission.find(filter)
      .populate('problemId', 'title difficulty tags')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Submission.countDocuments(filter);

    res.json({ submissions, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch submissions.' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/submissions/:id — get a single submission
// ---------------------------------------------------------------------------
const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('problemId', 'title difficulty tags description');

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

    if (submission.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    res.json(submission);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch submission.' });
  }
};

module.exports = { createSubmission, getSubmissions, getSubmissionById, runCode };
