// Quick re-migration: fix IndentationError records that got TimeLimitExceeded
require('dotenv').config();
const mongoose = require('mongoose');
const Submission = require('./models/Submission');
const Attempt = require('./models/Attempt');
const { classifyError } = require('./utils/errorClassifier');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  // Find submissions where errorType doesn't match what the classifier would now give
  const subs = await Submission.find({ status: { $in: ['failed', 'timeout'] } }).lean();

  let fixed = 0;
  for (const sub of subs) {
    const { errorType: newType, errorLine } = classifyError(
      sub.stderr || sub.errorMessage || '',
      sub.stdout || '',
      sub.language || 'python',
      sub.status,
      ''
    );
    if (newType !== sub.errorType) {
      await Submission.updateOne({ _id: sub._id }, { $set: { errorType: newType, errorLine: errorLine ?? null } });
      // Sync attempt
      await Attempt.updateMany({ submissionId: sub._id }, { $set: { errorType: newType, errorLine: errorLine ?? null } });
      console.log(`  Fixed [${sub._id}]: ${sub.errorType} → ${newType}  |  stderr: ${(sub.stderr||'').slice(0,80)}`);
      fixed++;
    }
  }

  console.log(`\n✓ Fixed ${fixed} records. Distribution:`);
  for (const t of ['SyntaxError','CompilationError','TypeError','IndexError','NullError','TimeLimitExceeded','RuntimeError','LogicError','UnknownError']) {
    const c = await Submission.countDocuments({ errorType: t });
    if (c > 0) console.log(`  ${t}: ${c}`);
  }
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
