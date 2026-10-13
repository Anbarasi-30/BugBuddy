/**
 * Initial Admin Account Setup Script
 * 
 * Usage: node scripts/initAdmin.js <email> <password> <name>
 * Example: node scripts/initAdmin.js admin@bugbuddy.app Admin@12345 "System Admin"
 */

require('dotenv').config({ path: '../.env' });
if (!process.env.MONGODB_URI) {
  require('dotenv').config();
}

const mongoose = require('mongoose');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

async function initAdmin() {
  const args = process.argv.slice(2);
  const email = args[0] || process.env.ADMIN_EMAIL || 'admin@bugbuddy.app';
  const password = args[1] || process.env.ADMIN_PASSWORD || 'AdminPass@12345';
  const name = args[2] || process.env.ADMIN_NAME || 'System Admin';

  if (!email || !password) {
    console.error('Error: Email and Password are required to initialize admin.');
    process.exit(1);
  }

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bugbuddy';
    console.log('[InitAdmin] Connecting to MongoDB...');
    await mongoose.connect(mongoUri);

    const trimmedEmail = email.toLowerCase().trim();

    let user = await User.findOne({ email: trimmedEmail });

    if (user) {
      console.log(`[InitAdmin] User ${trimmedEmail} already exists. Promoting to admin...`);
      user.role = 'admin';
      user.isVerified = true;
      user.status = 'active';
      if (args[1]) {
        user.password = password; // Pre-save hook hashes
      }
      await user.save();
    } else {
      console.log(`[InitAdmin] Creating new admin account for ${trimmedEmail}...`);
      user = await User.create({
        name,
        email: trimmedEmail,
        password,
        role: 'admin',
        isVerified: true,
        status: 'active',
      });
    }

    // Record audit log entry
    await AuditLog.create({
      adminId: user._id,
      adminName: user.name,
      adminEmail: user.email,
      action: 'INITIAL_ADMIN_CREATED',
      targetId: user._id.toString(),
      targetModel: 'User',
      summary: `Initial admin account ${user.email} initialized.`,
    });

    console.log('---------------------------------------------------------');
    console.log(' SUCCESS: Admin Account Initialized Successfully!');
    console.log(` Email:    ${user.email}`);
    console.log(` Role:     ${user.role}`);
    console.log(` Status:   ${user.status}`);
    console.log('---------------------------------------------------------');
    process.exit(0);
  } catch (err) {
    console.error('[InitAdmin Error]:', err.message);
    process.exit(1);
  }
}

initAdmin();
