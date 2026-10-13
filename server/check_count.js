require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('./models/Problem');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const count = await Problem.countDocuments({ isPublished: true, isInternalChallenge: { $ne: true } });
  console.log('Total published problems:', count);
  const first5 = await Problem.find({}, 'title order').sort({ order: 1 }).limit(5);
  console.log('First 5:', first5.map(p => `${p.order}. ${p.title}`).join(', '));
  const last5 = await Problem.find({}, 'title order').sort({ order: -1 }).limit(5);
  console.log('Last 5 (desc):', last5.map(p => `${p.order}. ${p.title}`).join(', '));
  process.exit(0);
}).catch(e => {
  console.error(e.message);
  process.exit(1);
});
