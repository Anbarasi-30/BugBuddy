const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  register,
  verifyOtp,
  resendOtp,
  login,
  getMe,
  googleLogin,
  googleCallback,
  updatePreferences,
} = require('../controllers/auth.controller');
const { protectRoute } = require('../middleware/auth.middleware');

// Rate limiter for auth endpoints to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many authentication attempts. Please wait 15 minutes.' },
});

// Rate limiter specifically for OTP verification & resend attempts
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: { error: 'Too many OTP requests. Please wait 10 minutes.' },
});

router.post('/register', authLimiter, register);
router.post('/verify-otp', otpLimiter, verifyOtp);
router.post('/resend-otp', otpLimiter, resendOtp);
router.post('/login', authLimiter, login);
router.get('/me', protectRoute, getMe);
router.put('/preferences', protectRoute, updatePreferences);

// Google OAuth
router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);

module.exports = router;
