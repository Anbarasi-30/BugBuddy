/**
 * Admin Controller
 *
 * Handles Admin Dashboard operations:
 * - Overview stats
 * - Student Management (View, Add, Update, Suspend, Delete)
 * - Problem Management (View, Add, Edit, Delete/Archive, Preview)
 * - Platform Analytics (Real MongoDB aggregations)
 * - System Monitoring (Health, DB, AI, Execution Service)
 * - Feedback & Reports Management
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const Report = require('../models/Report');
const SkillProfile = require('../models/SkillProfile');
const bcrypt = require('bcryptjs');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// No-op helper kept to avoid modifying every call-site
// eslint-disable-next-line no-unused-vars
async function logAdminAction() {}

// ---------------------------------------------------------------------------
// GET /api/admin/overview — Overview dashboard statistics
// ---------------------------------------------------------------------------
const getOverview = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const verifiedStudents = await User.countDocuments({ role: 'student', isVerified: true });
    const suspendedStudents = await User.countDocuments({ role: 'student', status: 'suspended' });

    const totalProblems = await Problem.countDocuments();
    const publishedProblems = await Problem.countDocuments({ isPublished: true });

    const totalSubmissions = await Submission.countDocuments();
    const passedSubmissions = await Submission.countDocuments({ status: 'passed' });
    const passRate = totalSubmissions > 0 ? ((passedSubmissions / totalSubmissions) * 100).toFixed(1) : '0.0';

    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const recentReports = await Report.find({ status: { $in: ['pending', 'under_review'] } })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      students: { total: totalStudents, verified: verifiedStudents, suspended: suspendedStudents },
      problems: { total: totalProblems, published: publishedProblems },
      submissions: { total: totalSubmissions, passed: passedSubmissions, passRate: parseFloat(passRate) },
      systemStatus: { dbConnected: mongoose.connection.readyState === 1, uptimeSeconds: process.uptime() },
      pendingReports,
      recentReports,
    });
  } catch (err) {
    console.error('[Admin] Overview error:', err.message);
    res.status(500).json({ error: 'Could not fetch admin overview data.' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/admin/students — Paginated Student Management list & counts
// ---------------------------------------------------------------------------
const getStudents = async (req, res) => {
  try {
    const { search, verificationStatus, accountStatus, page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const query = { role: 'student' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (verificationStatus === 'verified') query.isVerified = true;
    if (verificationStatus === 'unverified') query.isVerified = false;

    if (['active', 'inactive', 'suspended'].includes(accountStatus)) {
      query.status = accountStatus;
    }

    // Calculate actual counts from User collection
    const totalStudents = await User.countDocuments({ role: 'student' });
    const activeStudents = await User.countDocuments({ role: 'student', status: 'active' });
    const inactiveStudents = await User.countDocuments({ role: 'student', status: 'inactive' });
    const suspendedStudents = await User.countDocuments({ role: 'student', status: 'suspended' });
    const verifiedStudents = await User.countDocuments({ role: 'student', isVerified: true });
    const unverifiedStudents = await User.countDocuments({ role: 'student', isVerified: false });

    const filteredTotal = await User.countDocuments(query);
    const students = await User.find(query)
      .select('name email isVerified status createdAt preferredLanguage avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Enrich with submission counts and solved problems count
    const studentIds = students.map((s) => s._id);

    const submissionStats = await Submission.aggregate([
      { $match: { userId: { $in: studentIds } } },
      {
        $group: {
          _id: '$userId',
          totalSubmissions: { $sum: 1 },
          passedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'passed'] }, 1, 0] },
          },
        },
      },
    ]);

    const solvedStats = await Submission.aggregate([
      { $match: { userId: { $in: studentIds }, status: 'passed' } },
      {
        $group: {
          _id: { userId: '$userId', problemId: '$problemId' },
        },
      },
      {
        $group: {
          _id: '$_id.userId',
          solvedProblemsCount: { $sum: 1 },
        },
      },
    ]);

    const subMap = new Map(submissionStats.map((s) => [s._id.toString(), s]));
    const solvedMap = new Map(solvedStats.map((s) => [s._id.toString(), s.solvedProblemsCount]));

    const enriched = students.map((s) => {
      const idStr = s._id.toString();
      const sub = subMap.get(idStr) || { totalSubmissions: 0, passedCount: 0 };
      const solved = solvedMap.get(idStr) || 0;
      return {
        _id: s._id,
        name: s.name,
        email: s.email,
        isVerified: s.isVerified,
        status: s.status || 'active',
        createdAt: s.createdAt,
        totalSubmissions: sub.totalSubmissions,
        problemsSolved: solved,
      };
    });

    res.json({
      students: enriched,
      counts: {
        total: totalStudents,
        active: activeStudents,
        inactive: inactiveStudents,
        suspended: suspendedStudents,
        verified: verifiedStudents,
        unverified: unverifiedStudents,
      },
      pagination: {
        total: filteredTotal,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(filteredTotal / limitNum) || 1,
      },
    });
  } catch (err) {
    console.error('[Admin] Get students error:', err.message);
    res.status(500).json({ error: 'Could not fetch student list.' });
  }
};

// ---------------------------------------------------------------------------
// POST /api/admin/students — Add Student manually
// ---------------------------------------------------------------------------
const createStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    const existing = await User.findOne({ email: trimmedEmail });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const student = await User.create({
      name: name.trim(),
      email: trimmedEmail,
      password, // hashed by pre-save hook
      role: 'student', // Automatically assign student role
      status: 'active',
      isVerified: true, // Mark verified when added by admin
      mustChangePassword: true,
    });

    await SkillProfile.create({ userId: student._id });

    await logAdminAction(
      req,
      'STUDENT_CREATED',
      student._id,
      'User',
      `Admin created new student account for ${student.email}.`
    );

    res.status(201).json({
      message: 'Student account created successfully.',
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        status: student.status,
        isVerified: student.isVerified,
      },
    });
  } catch (err) {
    console.error('[Admin] Create student error:', err.message);
    res.status(500).json({ error: 'Could not create student account.' });
  }
};

// ---------------------------------------------------------------------------
// PATCH /api/admin/students/:id — Update Student Details & Status
// ---------------------------------------------------------------------------
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid student ID.' });
    }

    const student = await User.findById(id);
    if (!student || student.role === 'admin') {
      return res.status(404).json({ error: 'Student not found.' });
    }

    const updates = {};
    let auditSummary = `Updated student ${student.email}:`;

    if (name && name.trim() !== student.name) {
      updates.name = name.trim();
      auditSummary += ` name changed to "${name.trim()}";`;
    }

    if (email && email.trim().toLowerCase() !== student.email) {
      const trimmedEmail = email.trim().toLowerCase();
      if (!EMAIL_REGEX.test(trimmedEmail)) {
        return res.status(400).json({ error: 'Invalid email format.' });
      }
      const existing = await User.findOne({ email: trimmedEmail, _id: { $ne: id } });
      if (existing) {
        return res.status(409).json({ error: 'Email address is already in use by another user.' });
      }
      updates.email = trimmedEmail;
      auditSummary += ` email changed to "${trimmedEmail}";`;
    }

    if (status && ['active', 'inactive', 'suspended'].includes(status) && status !== student.status) {
      updates.status = status;
      auditSummary += ` status changed to "${status}";`;
    }

    if (Object.keys(updates).length === 0) {
      return res.json({ message: 'No changes made.', student });
    }

    const updatedStudent = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');

    const actionType = updates.status === 'suspended' ? 'STUDENT_SUSPENDED' : 'STUDENT_UPDATED';
    await logAdminAction(req, actionType, student._id, 'User', auditSummary);

    res.json({
      message: 'Student updated successfully.',
      student: updatedStudent,
    });
  } catch (err) {
    console.error('[Admin] Update student error:', err.message);
    res.status(500).json({ error: 'Could not update student details.' });
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/admin/students/:id — Delete Student
// ---------------------------------------------------------------------------
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid student ID.' });
    }

    if (req.user.id === id) {
      return res.status(400).json({ error: 'An admin cannot delete their own account.' });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (targetUser.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin', status: 'active' });
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last active admin account.' });
      }
    }

    // Delete associated SkillProfile
    await SkillProfile.deleteMany({ userId: id });
    // Remove target user
    await User.findByIdAndDelete(id);

    await logAdminAction(
      req,
      'STUDENT_DELETED',
      id,
      'User',
      `Deleted student account for ${targetUser.email} (${targetUser.name}).`
    );

    res.json({ message: `Student ${targetUser.email} deleted successfully.` });
  } catch (err) {
    console.error('[Admin] Delete student error:', err.message);
    res.status(500).json({ error: 'Could not delete student account.' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/admin/submissions — Paginated Submission History for Admin
// ---------------------------------------------------------------------------
const getSubmissions = async (req, res) => {
  try {
    const { search, problemId, status, language, startDate, endDate, page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    if (problemId && mongoose.Types.ObjectId.isValid(problemId)) {
      query.problemId = problemId;
    }

    if (status && ['passed', 'failed', 'error', 'timeout', 'unavailable'].includes(status)) {
      query.status = status;
    }

    if (language) {
      query.language = language.toLowerCase();
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Search by student name or email
    if (search && search.trim()) {
      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: search.trim(), $options: 'i' } },
          { email: { $regex: search.trim(), $options: 'i' } },
        ],
      }).select('_id');
      const userIds = matchingUsers.map((u) => u._id);
      query.userId = { $in: userIds };
    }

    const totalSubmissions = await Submission.countDocuments(query);
    const submissions = await Submission.find(query)
      .populate('userId', 'name email')
      .populate('problemId', 'title difficulty')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const formattedSubmissions = submissions.map((sub) => ({
      _id: sub._id,
      studentName: sub.userId ? sub.userId.name : 'Unknown / Deleted User',
      studentEmail: sub.userId ? sub.userId.email : 'N/A',
      problemTitle: sub.problemId ? sub.problemId.title : 'Unknown / Deleted Problem',
      problemDifficulty: sub.problemId ? sub.problemId.difficulty : 'N/A',
      language: sub.language,
      status: sub.status,
      passedTestCases: sub.passedTestCases || 0,
      totalTestCases: sub.totalTestCases || 0,
      errorType: sub.errorType || 'None',
      errorMessage: sub.errorMessage || '',
      executionTimeMs: sub.executionTimeMs,
      createdAt: sub.createdAt,
      submittedCode: sub.submittedCode,
    }));

    res.json({
      submissions: formattedSubmissions,
      pagination: {
        total: totalSubmissions,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalSubmissions / limitNum) || 1,
      },
    });
  } catch (err) {
    console.error('[Admin] Get submissions error:', err.message);
    res.status(500).json({ error: 'Could not fetch submission history.' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/admin/problems — Paginated Problem list for Admin
// ---------------------------------------------------------------------------
const getProblems = async (req, res) => {
  try {
    const { search, difficulty, status, page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty)) {
      query.difficulty = difficulty;
    }
    if (status === 'published') query.isPublished = true;
    if (status === 'draft') query.isPublished = false;

    const totalProblems = await Problem.countDocuments(query);
    const problems = await Problem.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      problems,
      pagination: {
        total: totalProblems,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalProblems / limitNum) || 1,
      },
    });
  } catch (err) {
    console.error('[Admin] Get problems error:', err.message);
    res.status(500).json({ error: 'Could not fetch problem list.' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/admin/problems/:id — Get problem by ID (includes hidden test cases)
// ---------------------------------------------------------------------------
const getProblemById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid problem ID.' });
    }

    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found.' });
    }

    res.json(problem);
  } catch (err) {
    console.error('[Admin] Get problem by id error:', err.message);
    res.status(500).json({ error: 'Could not fetch problem details.' });
  }
};

// Helper to normalize language names ('c++' -> 'cpp')
const normalizeLang = (lang) => {
  if (!lang) return '';
  const lower = String(lang).toLowerCase().trim();
  if (lower === 'c++') return 'cpp';
  return lower;
};

// Helper to extract starter code map { python: '...', java: '...', c: '...', cpp: '...' }
const extractStarterCodeMap = (input) => {
  const map = {};
  if (Array.isArray(input)) {
    input.forEach((item) => {
      if (item && item.language) {
        const key = normalizeLang(item.language);
        if (key) map[key] = item.code ?? '';
      }
    });
  } else if (input && typeof input === 'object') {
    Object.entries(input).forEach(([k, v]) => {
      const key = normalizeLang(k);
      if (key) map[key] = v ?? '';
    });
  }
  return map;
};

// ---------------------------------------------------------------------------
// POST /api/admin/problems — Create new coding problem
// ---------------------------------------------------------------------------
const createProblem = async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      tags,
      supportedLanguages,
      starterCode,
      expectedBehavior,
      testCases,
      isPublished = true,
    } = req.body;

    if (!title || !description || !difficulty) {
      return res.status(400).json({ error: 'Title, description, and difficulty are required.' });
    }

    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({ error: 'Invalid difficulty level.' });
    }

    if (!testCases || !Array.isArray(testCases) || testCases.length === 0) {
      return res.status(400).json({ error: 'At least one test case is required.' });
    }

    // Validate test cases
    for (const tc of testCases) {
      if (tc.input === undefined || tc.expectedOutput === undefined) {
        return res.status(400).json({ error: 'All test cases must specify input and expectedOutput.' });
      }
    }

    const inputMap = extractStarterCodeMap(starterCode);
    const formattedStarterCode = ['python', 'java', 'c', 'cpp'].map((lang) => ({
      language: lang,
      code: inputMap[lang] ?? '',
    }));

    const langs = Array.isArray(supportedLanguages) && supportedLanguages.length > 0
      ? supportedLanguages.map(normalizeLang).filter(Boolean)
      : ['python', 'java', 'c', 'cpp'];

    const problem = await Problem.create({
      title: title.trim(),
      description: description.trim(),
      difficulty,
      tags: Array.isArray(tags) ? tags : [],
      supportedLanguages: [...new Set(langs)],
      starterCode: formattedStarterCode,
      expectedBehavior: expectedBehavior || '',
      testCases,
      isPublished: Boolean(isPublished),
    });

    await logAdminAction(
      req,
      'PROBLEM_CREATED',
      problem._id,
      'Problem',
      `Created new problem "${problem.title}" (${problem.difficulty}).`
    );

    res.status(201).json({
      message: 'Problem created successfully.',
      problem,
    });
  } catch (err) {
    console.error('[Admin] Create problem error:', err.message);
    res.status(500).json({ error: 'Could not create problem.' });
  }
};

// ---------------------------------------------------------------------------
// PATCH /api/admin/problems/:id — Edit problem
// ---------------------------------------------------------------------------
const updateProblem = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid problem ID.' });
    }

    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found.' });
    }

    const {
      title,
      description,
      difficulty,
      tags,
      supportedLanguages,
      starterCode,
      expectedBehavior,
      testCases,
      isPublished,
    } = req.body;

    const updates = {};
    if (title) updates.title = title.trim();
    if (description) updates.description = description.trim();
    if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty)) updates.difficulty = difficulty;
    if (tags && Array.isArray(tags)) updates.tags = tags;
    if (supportedLanguages && Array.isArray(supportedLanguages)) {
      const normalizedLangs = supportedLanguages.map(normalizeLang).filter(Boolean);
      updates.supportedLanguages = [...new Set(normalizedLangs)];
    }

    if (starterCode !== undefined) {
      const existingMap = extractStarterCodeMap(problem.starterCode);
      const incomingMap = extractStarterCodeMap(starterCode);

      const mergedMap = { ...existingMap };
      Object.keys(incomingMap).forEach((langKey) => {
        mergedMap[langKey] = incomingMap[langKey];
      });

      updates.starterCode = ['python', 'java', 'c', 'cpp'].map((lang) => ({
        language: lang,
        code: mergedMap[lang] ?? '',
      }));
    }

    if (expectedBehavior !== undefined) updates.expectedBehavior = expectedBehavior;
    if (testCases && Array.isArray(testCases)) updates.testCases = testCases;
    if (isPublished !== undefined) updates.isPublished = Boolean(isPublished);

    const updatedProblem = await Problem.findByIdAndUpdate(id, updates, { new: true });

    await logAdminAction(
      req,
      'PROBLEM_UPDATED',
      problem._id,
      'Problem',
      `Updated problem details for "${updatedProblem.title}".`
    );

    res.json({
      message: 'Problem updated successfully.',
      problem: updatedProblem,
    });
  } catch (err) {
    console.error('[Admin] Update problem error:', err.message);
    res.status(500).json({ error: 'Could not update problem.' });
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/admin/problems/:id — Delete or Archive Problem
// ---------------------------------------------------------------------------
const deleteProblem = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid problem ID.' });
    }

    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found.' });
    }

    // Check if there are existing submissions referencing this problem
    const submissionCount = await Submission.countDocuments({ problemId: id });

    if (submissionCount > 0) {
      // Archive problem to preserve historical records
      problem.isPublished = false;
      await problem.save();

      await logAdminAction(
        req,
        'PROBLEM_ARCHIVED',
        id,
        'Problem',
        `Archived problem "${problem.title}" because it has ${submissionCount} existing submission(s).`
      );

      return res.json({
        message: `Problem archived successfully (has ${submissionCount} submission records).`,
        archived: true,
      });
    } else {
      // Safe to delete completely
      await Problem.findByIdAndDelete(id);

      await logAdminAction(
        req,
        'PROBLEM_DELETED',
        id,
        'Problem',
        `Deleted problem "${problem.title}".`
      );

      return res.json({ message: `Problem "${problem.title}" deleted successfully.`, archived: false });
    }
  } catch (err) {
    console.error('[Admin] Delete problem error:', err.message);
    res.status(500).json({ error: 'Could not delete or archive problem.' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/admin/analytics — Real MongoDB Platform Analytics
// ---------------------------------------------------------------------------
const getAnalytics = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const activeStudents = await User.countDocuments({ role: 'student', status: 'active' });
    const inactiveStudents = await User.countDocuments({ role: 'student', status: 'inactive' });
    const suspendedStudents = await User.countDocuments({ role: 'student', status: 'suspended' });
    const verifiedStudents = await User.countDocuments({ role: 'student', isVerified: true });
    const unverifiedStudents = await User.countDocuments({ role: 'student', isVerified: false });

    const totalProblems = await Problem.countDocuments();
    const publishedProblems = await Problem.countDocuments({ isPublished: true });
    
    const difficultyCounts = await Problem.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
    ]);
    const difficultyMap = { easy: 0, medium: 0, hard: 0 };
    difficultyCounts.forEach((item) => {
      if (item._id) difficultyMap[item._id] = item.count;
    });

    const totalSubmissions = await Submission.countDocuments();
    const passedSubmissions = await Submission.countDocuments({ status: 'passed' });
    const failedSubmissions = await Submission.countDocuments({ status: 'failed' });
    const errorSubmissions = await Submission.countDocuments({ status: 'error' });
    const passRate = totalSubmissions > 0 ? parseFloat(((passedSubmissions / totalSubmissions) * 100).toFixed(1)) : 0.0;

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const registrationTrends = await User.aggregate([
      { $match: { role: 'student', createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const submissionTrends = await Submission.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: 1 },
          passed: { $sum: { $cond: [{ $eq: ['$status', 'passed'] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const mostAttemptedRaw = await Submission.aggregate([
      { $group: { _id: '$problemId', count: { $sum: 1 }, passedCount: { $sum: { $cond: [{ $eq: ['$status', 'passed'] }, 1, 0] } } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'problems',
          localField: '_id',
          foreignField: '_id',
          as: 'problem',
        },
      },
      { $unwind: '$problem' },
      {
        $project: {
          problemId: '$_id',
          title: '$problem.title',
          difficulty: '$problem.difficulty',
          attemptCount: '$count',
          attempts: '$count',
          passRate: {
            $cond: [
              { $gt: ['$count', 0] },
              { $round: [{ $multiply: [{ $divide: ['$passedCount', '$count'] }, 100] }, 1] },
              0,
            ],
          },
        },
      },
    ]);

    const commonErrorsRaw = await Submission.aggregate([
      { $match: { errorType: { $nin: ['None', '', null] } } },
      { $group: { _id: '$errorType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const topErrorTypes = commonErrorsRaw.map((e) => ({
      category: e._id,
      count: e.count,
    }));

    const userObj = {
      total: totalStudents,
      active: activeStudents,
      inactive: inactiveStudents,
      verified: verifiedStudents,
      unverified: unverifiedStudents,
      suspended: suspendedStudents,
    };

    const problemObj = {
      total: totalProblems,
      published: publishedProblems,
      byDifficulty: difficultyMap,
    };

    const subObj = {
      total: totalSubmissions,
      passed: passedSubmissions,
      accepted: passedSubmissions,
      failed: failedSubmissions,
      error: errorSubmissions,
      passRate,
    };

    res.json({
      users: userObj,
      userMetrics: userObj,
      problems: problemObj,
      problemMetrics: problemObj,
      submissions: subObj,
      submissionMetrics: subObj,
      registrationTrends,
      submissionTrends,
      mostAttempted: mostAttemptedRaw,
      topAttemptedProblems: mostAttemptedRaw,
      commonErrors: topErrorTypes,
      topErrorTypes,
    });
  } catch (err) {
    console.error('[Admin] Analytics error:', err.message);
    res.status(500).json({ error: 'Could not fetch platform analytics.' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/admin/system — Real Operational System Monitoring
// ---------------------------------------------------------------------------
const getSystemMonitoring = async (req, res) => {
  try {
    const memUsage = process.memoryUsage();
    const dbState = mongoose.connection.readyState;
    const dbStateMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    const aiConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'mock-key');
    const executionServiceConfigured = Boolean(process.env.RAPIDAPI_KEY || process.env.JUDGE0_URL);

    const recentErrorsCount = await Submission.countDocuments({
      status: 'error',
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    const uptime = Math.floor(process.uptime());

    res.json({
      server: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime,
        uptimeSeconds: uptime,
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        uptimeSeconds: uptime,
        memoryUsage: {
          heapUsedMb: (memUsage.heapUsed / (1024 * 1024)).toFixed(2),
          heapTotalMb: (memUsage.heapTotal / (1024 * 1024)).toFixed(2),
          rssMb: (memUsage.rss / (1024 * 1024)).toFixed(2),
        },
      },
      services: {
        mongodb: dbStateMap[dbState] || 'disconnected',
        gemini: aiConfigured ? 'configured' : 'fallback',
        judge0: executionServiceConfigured ? 'configured' : 'fallback',
        mongodbDetails: {
          status: dbStateMap[dbState] || 'Unknown',
          code: dbState,
        },
      },
      memory: {
        heapUsedMB: (memUsage.heapUsed / (1024 * 1024)).toFixed(2),
        heapTotalMB: (memUsage.heapTotal / (1024 * 1024)).toFixed(2),
        rssMB: (memUsage.rss / (1024 * 1024)).toFixed(2),
      },
      monitoring: {
        last24hCodeErrors: recentErrorsCount,
      },
    });
  } catch (err) {
    console.error('[Admin] System monitoring error:', err.message);
    res.status(500).json({ error: 'Could not fetch system monitoring status.' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/admin/reports — List all student reports (with search & filters)
// ---------------------------------------------------------------------------
const getReports = async (req, res) => {
  try {
    const { search, status, reportType, page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    if (status && ['pending', 'under_review', 'resolved', 'dismissed'].includes(status)) {
      query.status = status;
    }

    if (reportType) {
      query.reportType = reportType;
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { userName: { $regex: s, $options: 'i' } },
        { userEmail: { $regex: s, $options: 'i' } },
        { subject: { $regex: s, $options: 'i' } },
      ];
    }

    // Summary counts (always across all reports, unfiltered by search)
    const [totalAll, countPending, countUnderReview, countResolved, countDismissed] = await Promise.all([
      Report.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      Report.countDocuments({ status: 'under_review' }),
      Report.countDocuments({ status: 'resolved' }),
      Report.countDocuments({ status: 'dismissed' }),
    ]);

    const totalReports = await Report.countDocuments(query);
    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      reports,
      counts: {
        total: totalAll,
        pending: countPending,
        under_review: countUnderReview,
        resolved: countResolved,
        dismissed: countDismissed,
      },
      pagination: {
        total: totalReports,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalReports / limitNum) || 1,
      },
    });
  } catch (err) {
    console.error('[Admin] Get reports error:', err.message);
    res.status(500).json({ error: 'Could not fetch report list.' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/admin/reports/:id — Get single report by ID
// ---------------------------------------------------------------------------
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid report ID.' });
    }
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }
    res.json({ report });
  } catch (err) {
    console.error('[Admin] Get report by id error:', err.message);
    res.status(500).json({ error: 'Could not fetch report.' });
  }
};

// ---------------------------------------------------------------------------
// PATCH /api/admin/reports/:id — Update Report status & admin response
// ---------------------------------------------------------------------------
const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid report ID.' });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    if (status && ['pending', 'under_review', 'resolved', 'dismissed'].includes(status)) {
      report.status = status;
    }

    if (adminResponse !== undefined) {
      report.adminResponse = adminResponse.trim();
    }

    report.resolvedBy = req.user.id;
    await report.save();

    res.json({ message: 'Report updated successfully.', report });
  } catch (err) {
    console.error('[Admin] Update report error:', err.message);
    res.status(500).json({ error: 'Could not update report status.' });
  }
};

module.exports = {
  getOverview,
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getSubmissions,
  getProblems,
  getProblemById,
  createProblem,
  updateProblem,
  deleteProblem,
  getAnalytics,
  getSystemMonitoring,
  getReports,
  getReportById,
  updateReport,
};

