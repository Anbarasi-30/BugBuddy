/**
 * Auth Controller
 * 
 * Handles user registration with 6-digit OTP email verification,
 * OTP verification & resend, login, Google OAuth callback,
 * and fetching/updating user profile details.
 */

const bcrypt = require('bcryptjs');
const User = require('../models/User');
const SkillProfile = require('../models/SkillProfile');
const { generateToken } = require('../utils/jwt.utils');
const { sendOtpEmail } = require('../utils/email.utils');
const passport = require('passport');

// Email regex pattern for validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Helper to generate a random 6-digit numeric OTP
function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ---------------------------------------------------------------------------
// POST /api/auth/register
// ---------------------------------------------------------------------------
const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // 1. Basic input validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // 2. Validate email format on backend
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return res.status(400).json({ error: 'Please provide a valid email format.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    // 3. Check existing user
    let existingUser = await User.findOne({ email: trimmedEmail }).select('+otpHash');

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(409).json({ error: 'An account with this email address is already registered.' });
      }

      // If user exists but is unverified, update their details and send a fresh OTP
      const otpCode = generateOtpCode();
      const salt = await bcrypt.genSalt(10);
      const otpHash = await bcrypt.hash(otpCode, salt);

      existingUser.name = name.trim();
      existingUser.password = password; // Will be hashed by pre-save hook
      existingUser.role = 'student'; // Always force student role on public reg
      existingUser.otpHash = otpHash;
      existingUser.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      existingUser.otpResendAvailableAt = new Date(Date.now() + 60 * 1000); // 60s cooldown

      await existingUser.save();
      await sendOtpEmail(trimmedEmail, otpCode);

      return res.status(200).json({
        requireOtp: true,
        email: trimmedEmail,
        message: 'A new 6-digit verification OTP has been sent to your email.',
      });
    }

    // 4. Create new unverified user
    const otpCode = generateOtpCode();
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otpCode, salt);

    const newUser = new User({
      name: name.trim(),
      email: trimmedEmail,
      password, // Pre-save hook will hash
      role: 'student', // Never allow public registration to set role
      status: 'active',
      isVerified: false,
      otpHash,
      otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 mins
      otpResendAvailableAt: new Date(Date.now() + 60 * 1000), // 60s
    });

    await newUser.save();
    await sendOtpEmail(trimmedEmail, otpCode);

    res.status(201).json({
      requireOtp: true,
      email: trimmedEmail,
      message: 'Registration successful! A 6-digit OTP code has been sent to your email.',
    });
  } catch (err) {
    console.error('[Auth] Register error:', err.message);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};

// ---------------------------------------------------------------------------
// POST /api/auth/verify-otp
// ---------------------------------------------------------------------------
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and 6-digit OTP code are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedOtp = otp.toString().trim();

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    // Find user by email including otpHash
    const user = await User.findOne({ email: trimmedEmail }).select('+otpHash');
    if (!user) {
      return res.status(404).json({ error: 'No account found for this email address.' });
    }

    if (user.isVerified) {
      // User is already verified, generate token and return
      const token = generateToken(user._id.toString());
      return res.json({
        message: 'Account is already verified.',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          isVerified: true,
          avatar: user.avatar,
          preferredLanguage: user.preferredLanguage,
          theme: user.theme,
        },
      });
    }

    if (!user.otpHash || !user.otpExpiresAt) {
      return res.status(400).json({ error: 'No pending OTP verification found. Please request a code.' });
    }

    // Check expiration
    if (Date.now() > new Date(user.otpExpiresAt).getTime()) {
      return res.status(400).json({ error: 'OTP code has expired. Please click resend to get a new code.' });
    }

    // Check hash match
    const isMatch = await bcrypt.compare(trimmedOtp, user.otpHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid OTP code. Please check and try again.' });
    }

    // OTP Verified — activate account
    user.isVerified = true;
    user.otpHash = null;
    user.otpExpiresAt = null;
    user.otpResendAvailableAt = null;
    await user.save();

    // Ensure SkillProfile exists
    const existingProfile = await SkillProfile.findOne({ userId: user._id });
    if (!existingProfile) {
      await SkillProfile.create({ userId: user._id });
    }

    const token = generateToken(user._id.toString());

    res.json({
      message: 'Email successfully verified!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        isVerified: true,
        avatar: user.avatar,
        preferredLanguage: user.preferredLanguage,
        theme: user.theme,
      },
    });
  } catch (err) {
    console.error('[Auth] OTP Verification error:', err.message);
    res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
};

// ---------------------------------------------------------------------------
// POST /api/auth/resend-otp
// ---------------------------------------------------------------------------
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      return res.status(404).json({ error: 'No account found for this email address.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Account is already verified. Please log in.' });
    }

    // Check rate limit (60 second cooldown)
    if (user.otpResendAvailableAt && Date.now() < new Date(user.otpResendAvailableAt).getTime()) {
      const remainingSecs = Math.ceil((new Date(user.otpResendAvailableAt).getTime() - Date.now()) / 1000);
      return res.status(429).json({
        error: `Please wait ${remainingSecs} second${remainingSecs > 1 ? 's' : ''} before requesting another code.`,
      });
    }

    const otpCode = generateOtpCode();
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otpCode, salt);

    user.otpHash = otpHash;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
    user.otpResendAvailableAt = new Date(Date.now() + 60 * 1000); // 60 seconds
    await user.save();

    await sendOtpEmail(trimmedEmail, otpCode);

    res.json({
      message: 'A new 6-digit OTP verification code has been sent to your email.',
    });
  } catch (err) {
    console.error('[Auth] Resend OTP error:', err.message);
    res.status(500).json({ error: 'Could not resend OTP code. Please try again.' });
  }
};

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Find the user and include the password field
    const user = await User.findOne({ email: trimmedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Google-only accounts check
    if (!user.password) {
      return res.status(401).json({ error: 'This account uses Google sign-in. Please click "Continue with Google".' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check account status (suspended check)
    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
    }

    // Check email verification status
    if (!user.isVerified) {
      return res.status(403).json({
        error: 'Please verify your email address before logging in.',
        requireOtp: true,
        email: user.email,
      });
    }

    const token = generateToken(user._id.toString());

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'student',
        status: user.status || 'active',
        isVerified: user.isVerified,
        mustChangePassword: user.mustChangePassword || false,
        avatar: user.avatar,
        preferredLanguage: user.preferredLanguage,
        theme: user.theme,
      },
    });
  } catch (err) {
    console.error('[Auth] Login error:', err.message);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/auth/me
// Returns current authenticated user profile details
// ---------------------------------------------------------------------------
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Account suspended.' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || 'student',
      status: user.status || 'active',
      isVerified: user.isVerified || false,
      mustChangePassword: user.mustChangePassword || false,
      avatar: user.avatar,
      preferredLanguage: user.preferredLanguage,
      theme: user.theme,
      createdAt: user.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch user profile.' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/auth/google
// ---------------------------------------------------------------------------
const googleLogin = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
});

// ---------------------------------------------------------------------------
// GET /api/auth/google/callback
// ---------------------------------------------------------------------------
const googleCallback = (req, res) => {
  passport.authenticate('google', { session: false }, async (err, user) => {
    if (err || !user) {
      return res.redirect(`${process.env.CLIENT_ORIGIN}/login?error=google_failed`);
    }

    if (user.status === 'suspended') {
      return res.redirect(`${process.env.CLIENT_ORIGIN}/login?error=suspended`);
    }

    // Ensure Google users are verified
    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    // Ensure SkillProfile
    const existing = await SkillProfile.findOne({ userId: user._id });
    if (!existing) {
      await SkillProfile.create({ userId: user._id });
    }

    const token = generateToken(user._id.toString());
    res.redirect(`${process.env.CLIENT_ORIGIN}/auth/callback#token=${token}`);
  })(req, res);
};

// ---------------------------------------------------------------------------
// PUT /api/auth/preferences
// ---------------------------------------------------------------------------
const updatePreferences = async (req, res) => {
  try {
    const { theme, preferredLanguage } = req.body;
    const updates = {};
    if (theme) updates.theme = theme;
    if (preferredLanguage) updates.preferredLanguage = preferredLanguage;

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
    res.json({ theme: user.theme, preferredLanguage: user.preferredLanguage });
  } catch (err) {
    res.status(500).json({ error: 'Could not update preferences.' });
  }
};

module.exports = {
  register,
  verifyOtp,
  resendOtp,
  login,
  getMe,
  googleLogin,
  googleCallback,
  updatePreferences,
};
