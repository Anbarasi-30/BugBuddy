/**
 * User Model
 * 
 * Stores registered users. Supports both email/password
 * and Google OAuth login flows.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required.'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters.'],
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address.'],
    },
    // Hashed password — null for Google OAuth users
    password: {
      type: String,
      default: null,
      select: false, // never returned in queries by default
    },
    // Google OAuth user ID — null for email/password users
    googleId: {
      type: String,
      default: null,
    },
    // User role — 'student' or 'admin'
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    // Account status — 'active', 'inactive', or 'suspended'
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    // Email verification status
    isVerified: {
      type: Boolean,
      default: false,
    },
    // Hashed OTP for email verification
    otpHash: {
      type: String,
      default: null,
      select: false,
    },
    // OTP expiration timestamp
    otpExpiresAt: {
      type: Date,
      default: null,
    },
    // OTP resend rate-limiting timestamp
    otpResendAvailableAt: {
      type: Date,
      default: null,
    },
    // Require password change on next login (for admin-created accounts)
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
    // Profile image URL (from Google or a default)
    avatar: {
      type: String,
      default: null,
    },
    // User's preferred programming language
    preferredLanguage: {
      type: String,
      enum: ['python', 'java', 'javascript'],
      default: 'python',
    },
    // UI theme preference
    theme: {
      type: String,
      enum: ['dark', 'light'],
      default: 'dark',
    },
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------
// Hash password before saving a new user or updating password
// ---------------------------------------------------------------------------
userSchema.pre('save', async function () {
  // Only hash the password if it has been modified (or is newly set)
  if (!this.isModified('password') || !this.password) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ---------------------------------------------------------------------------
// Instance method: compare a plain password to the stored hash
// ---------------------------------------------------------------------------
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
