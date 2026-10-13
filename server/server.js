/**
 * BugBuddy Express Server
 * 
 * Entry point for the backend API.
 * Loads environment variables, sets up middleware, registers routes,
 * connects to MongoDB Atlas, and starts the HTTP server.
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
require('dotenv').config();

// Import route handlers
const authRoutes = require('./routes/auth.routes');
const problemRoutes = require('./routes/problem.routes');
const submissionRoutes = require('./routes/submission.routes');
const hintRoutes = require('./routes/hint.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const mistakeRoutes = require('./routes/mistake.routes');
const skillRoutes = require('./routes/skill.routes');
const adminRoutes = require('./routes/admin.routes');
const reportRoutes = require('./routes/report.routes');
const interventionRoutes = require('./routes/intervention.routes');
const arcadeRoutes = require('./routes/arcade.routes');

// Import passport configuration
require('./middleware/passport.js');

const app = express();
const PORT = process.env.PORT || 5000;

// ---------------------------------------------------------------------------
// Security Middleware
// ---------------------------------------------------------------------------

// Set secure HTTP headers
app.use(helmet());

// Allow requests from the React client only
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// Global rate limiter — generous limit for development/testing
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});
app.use(globalLimiter);

// ---------------------------------------------------------------------------
// Body Parsing Middleware
// ---------------------------------------------------------------------------

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize Passport (used for Google OAuth)
app.use(passport.initialize());

// ---------------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------------

app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/hints', hintRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/mistakes', mistakeRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/interventions', interventionRoutes);
app.use('/api/arcade', arcadeRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ---------------------------------------------------------------------------
// Global Error Handler
// ---------------------------------------------------------------------------

// Receives errors forwarded via next(err) from any route/middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'An unexpected server error occurred.',
  });
});

// ---------------------------------------------------------------------------
// Database Connection + Server Start
// ---------------------------------------------------------------------------

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[MongoDB] Connected to Atlas successfully.');

    app.listen(PORT, () => {
      console.log(`[Server] BugBuddy API running on port ${PORT}`);
    });
  } catch (err) {
    console.error('[MongoDB] Connection failed:', err.message);
    process.exit(1);
  }
}

startServer();
