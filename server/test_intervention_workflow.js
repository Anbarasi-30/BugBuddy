/**
 * Automated Verification Script — Recurring Mistake Intervention v2
 *
 * Tests all 5 acceptance scenarios from the spec:
 *  Test 1 — Recurring mistake with session-scoped dedup
 *  Test 2 — New problem / new session can re-trigger
 *  Test 3 — First-time mistake → no intervention
 *  Test 4 — Different mistake in same session → separate intervention
 *  Test 5 — Same session re-check after completion → no re-trigger
 */

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Problem = require('./models/Problem');
const Attempt = require('./models/Attempt');
const Run = require('./models/Run');
const Submission = require('./models/Submission');
const SkillProfile = require('./models/SkillProfile');
const Intervention = require('./models/Intervention');

const { detectRecurringPattern, updateRealRunImprovementStatus } = require('./services/recurrence.service');
const { checkIntervention, submitInterventionAnswer } = require('./controllers/intervention.controller');

let passedCount = 0;
let failedCount = 0;
function assert(condition, msg) {
  if (condition) { passedCount++; console.log(`  ✅ ${msg}`); }
  else { failedCount++; console.error(`  ❌ FAIL: ${msg}`); }
}

function mockRes() {
  return {
    statusCode: 200,
    data: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.data = payload; return this; },
  };
}

async function runTests() {
  console.log('=== RECURRING MISTAKE INTERVENTION — V2 ACCEPTANCE TESTS ===\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[Setup] Connected to MongoDB Atlas.');

    // Setup test user
    let user = await User.findOne({ email: 'test_intv2_student@example.com' });
    if (!user) {
      user = await User.create({
        name: 'Intervention V2 Test Student',
        email: 'test_intv2_student@example.com',
        password: 'password123',
        role: 'student',
        isVerified: true,
      });
      await SkillProfile.create({ userId: user._id });
    }
    const userId = user._id.toString();

    // Clean slate
    await Attempt.deleteMany({ userId: user._id });
    await Run.deleteMany({ userId: user._id });
    await Submission.deleteMany({ userId: user._id });
    await Intervention.deleteMany({ userId: user._id });
    await SkillProfile.findOneAndUpdate({ userId: user._id }, { errorPatterns: [], totalAttempts: 0, totalSolved: 0 });

    // Create test problems
    const p1 = await Problem.create({ title: 'IntV2 Prob A', description: 't', difficulty: 'easy', isPublished: false, isInternalChallenge: true });
    const p2 = await Problem.create({ title: 'IntV2 Prob B', description: 't', difficulty: 'easy', isPublished: false, isInternalChallenge: true });
    const p3 = await Problem.create({ title: 'IntV2 Prob C', description: 't', difficulty: 'easy', isPublished: false, isInternalChallenge: true });
    const p4 = await Problem.create({ title: 'IntV2 Prob D', description: 't', difficulty: 'easy', isPublished: false, isInternalChallenge: true });

    // Build SkillProfile with recurring IndexError across 3 distinct problems
    await SkillProfile.findOneAndUpdate(
      { userId: user._id },
      {
        $push: {
          errorPatterns: {
            errorType: 'IndexError',
            count: 4,
            correctedCount: 0,
            distinctProblems: [p1._id, p2._id, p3._id],
          },
        },
      }
    );

    // Create debug sessions (Attempts)
    const sessionA = await Attempt.create({ userId: user._id, problemId: p3._id, attemptNumber: 1, finalStatus: 'in_progress' });
    const sessionB = await Attempt.create({ userId: user._id, problemId: p4._id, attemptNumber: 1, finalStatus: 'in_progress' });

    console.log('[Setup] Test data ready.\n');

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 3 — First-time mistake (no intervention)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('--- Test 3: First-time mistake (no intervention) ---');
    const firstTimeResult = await detectRecurringPattern(
      userId, p1._id.toString(), sessionA._id.toString(),
      { errorType: 'TypeError', errorMessage: "TypeError: unsupported...", code: "x = '5' + 3" }
    );
    assert(firstTimeResult.isRecurring === false, 'First-time TypeError should NOT trigger intervention');

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 1 — Recurring mistake triggers intervention then is suppressed in session
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- Test 1: Recurring IndexError triggers intervention ---');

    // 1a. First check should trigger
    const reqCheck1 = {
      user: { id: userId },
      body: {
        problemId: p3._id.toString(),
        sessionId: sessionA._id.toString(),
        errorType: 'IndexError',
        errorMessage: 'IndexError: list index out of range',
        code: 'for i in range(1, len(arr)):\n    print(arr[i])',
        passedTestCases: 2,
        totalTestCases: 5,
      },
    };
    const resCheck1 = mockRes();
    await checkIntervention(reqCheck1, resCheck1);

    assert(resCheck1.data.active === true, 'Recurring IndexError should activate intervention');
    assert(resCheck1.data.mistakeCategory === 'IndexError', 'Category should be IndexError');
    assert(resCheck1.data.template != null, 'Template should be returned');
    assert(resCheck1.data.template.concept != null, 'Template concept should exist');

    const intId = resCheck1.data.intervention._id;

    // 1b. Submit wrong answer → retry
    console.log('\n--- Test 1b: Wrong answer → friendly retry ---');
    const resWrong = mockRes();
    await submitInterventionAnswer({
      user: { id: userId },
      body: { interventionId: intId, step: 'challenge', selectedIndex: 3 },
    }, resWrong);

    assert(resWrong.data.correct === false, 'Wrong answer should be incorrect');
    assert(resWrong.data.nextStep === 'retry_challenge', 'Next step should be retry');
    assert(resWrong.data.status === 'PRACTICING', 'Status should be PRACTICING');

    // 1c. Submit correct answer → advance to quickCheck
    console.log('\n--- Test 1c: Correct challenge answer ---');
    const resCorrect = mockRes();
    await submitInterventionAnswer({
      user: { id: userId },
      body: { interventionId: intId, step: 'challenge', selectedIndex: 0 },
    }, resCorrect);

    assert(resCorrect.data.correct === true, 'Correct answer should be correct');
    assert(resCorrect.data.nextStep === 'quickCheck', 'Should advance to quickCheck');

    // 1d. Complete quickCheck
    console.log('\n--- Test 1d: Complete quickCheck ---');
    const resQC = mockRes();
    await submitInterventionAnswer({
      user: { id: userId },
      body: { interventionId: intId, step: 'quickCheck', selectedIndex: 0 },
    }, resQC);

    assert(resQC.data.correct === true, 'Quick check answer should be correct');
    assert(resQC.data.completed === true, 'Intervention should be complete');

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 5 — Same session re-check after completion → NO re-trigger
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- Test 5: Same session re-check → suppressed ---');
    const resCheck2 = mockRes();
    await checkIntervention({
      user: { id: userId },
      body: {
        problemId: p3._id.toString(),
        sessionId: sessionA._id.toString(),
        errorType: 'IndexError',
        errorMessage: 'IndexError: list index out of range',
        code: 'for i in range(1, len(arr)):\n    print(arr[i])',
      },
    }, resCheck2);

    assert(resCheck2.data.active === false, 'Same session + same category should NOT re-trigger');

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 2 — New problem / new session can re-trigger
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- Test 2: New session can re-trigger ---');

    // Reset the intervention completed flag so the recurrence logic can fire again
    await Intervention.findByIdAndUpdate(intId, { completed: false, completedAt: null });

    const resCheck3 = mockRes();
    await checkIntervention({
      user: { id: userId },
      body: {
        problemId: p4._id.toString(),
        sessionId: sessionB._id.toString(),
        errorType: 'IndexError',
        errorMessage: 'IndexError: list index out of range',
        code: 'x = arr[len(arr)]',
      },
    }, resCheck3);

    assert(resCheck3.data.active === true, 'New session + new problem SHOULD re-trigger intervention');

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 4 — Different mistake in same session → own intervention
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- Test 4: Different mistake category in same session ---');

    // Add recurring LogicError to SkillProfile
    await SkillProfile.findOneAndUpdate(
      { userId: user._id },
      {
        $push: {
          errorPatterns: {
            errorType: 'LogicError',
            count: 4,
            correctedCount: 0,
            distinctProblems: [p1._id, p2._id, p3._id, p4._id],
          },
        },
      }
    );

    const resCheck4 = mockRes();
    await checkIntervention({
      user: { id: userId },
      body: {
        problemId: p3._id.toString(),
        sessionId: sessionA._id.toString(),
        errorType: 'LogicError',
        errorMessage: 'Wrong Answer',
        code: 'if nums[i] > nums[j]: ...',
        passedTestCases: 3,
        totalTestCases: 5,
      },
    }, resCheck4);

    assert(resCheck4.data.active === true, 'Different mistake (LogicError) in same session CAN trigger its own intervention');
    assert(resCheck4.data.mistakeCategory === 'LogicError', 'Category should be LogicError');

    // But the original IndexError must still be suppressed in session A
    const resCheck5 = mockRes();
    await checkIntervention({
      user: { id: userId },
      body: {
        problemId: p3._id.toString(),
        sessionId: sessionA._id.toString(),
        errorType: 'IndexError',
        errorMessage: 'IndexError again',
        code: 'arr[len(arr)]',
      },
    }, resCheck5);

    assert(resCheck5.data.active === false, 'IndexError STILL suppressed in sessionA (already shown)');

    // ─────────────────────────────────────────────────────────────────────────
    // Real improvement verification
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- Real-Run Improvement Check ---');

    // Mark IndexError intervention as completed again for improvement tracking
    await Intervention.findByIdAndUpdate(intId, { completed: true, completedAt: new Date() });

    // Create 3 clean subsequent problems (no IndexError)
    const pS1 = await Problem.create({ title: 'Clean1', description: 't', difficulty: 'easy', isPublished: false, isInternalChallenge: true });
    const pS2 = await Problem.create({ title: 'Clean2', description: 't', difficulty: 'easy', isPublished: false, isInternalChallenge: true });
    const pS3 = await Problem.create({ title: 'Clean3', description: 't', difficulty: 'easy', isPublished: false, isInternalChallenge: true });

    await Attempt.create({ userId: user._id, problemId: pS1._id, attemptNumber: 1, errorType: 'None', resolved: true });
    await Attempt.create({ userId: user._id, problemId: pS2._id, attemptNumber: 1, errorType: 'None', resolved: true });
    await Attempt.create({ userId: user._id, problemId: pS3._id, attemptNumber: 1, errorType: 'None', resolved: true });

    const runProgress = await updateRealRunImprovementStatus(userId, 'IndexError');
    assert(runProgress.status === 'UNDERSTOOD', 'Real improvement: 3 clean problems should set status to UNDERSTOOD');

    // ─────────────────────────────────────────────────────────────────────────
    // Summary
    // ─────────────────────────────────────────────────────────────────────────
    console.log(`\n${'='.repeat(55)}`);
    console.log(`  RESULTS: ${passedCount} passed, ${failedCount} failed`);
    console.log(`${'='.repeat(55)}`);

    if (failedCount > 0) {
      console.log('\n⚠️  SOME TESTS FAILED — review output above.');
      process.exitCode = 1;
    } else {
      console.log('\n🎉 ALL ACCEPTANCE TESTS PASSED!');
    }
  } catch (err) {
    console.error('Test Execution Error:', err);
    process.exitCode = 1;
  } finally {
    try {
      await Problem.deleteMany({
        $or: [
          { title: { $regex: /^IntV2 Prob/ } },
          { title: { $in: ['Clean1', 'Clean2', 'Clean3'] } },
        ],
      });
    } catch (_) {}
    await mongoose.disconnect();
    console.log('[Teardown] Disconnected from MongoDB.');
  }
}

runTests();
