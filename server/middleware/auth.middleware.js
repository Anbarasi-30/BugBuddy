/**
 * Authentication & Authorization Middleware
 * 
 * Verifies JWT tokens on protected routes and enforces role-based access.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protectRoute — middleware that ensures the request carries a valid JWT
 * and that the user's account is active.
 */
const protectRoute = async (req, res, next) => {
  try {
    // Expect: Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authentication token provided.' });
    }

    const token = authHeader.split(' ')[1];

    // Verify the token using the server's secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user to confirm they still exist in the database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found. Token is invalid.' });
    }

    // Check account status
    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
    }

    // Attach user info to the request
    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role || 'student',
      status: user.status || 'active',
      isVerified: user.isVerified || false,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid authentication token.' });
  }
};

/**
 * requireAdmin — middleware that enforces admin privileges.
 * Must be placed AFTER protectRoute in route definitions.
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin authorization required. Access denied.' });
  }

  next();
};

module.exports = { protectRoute, requireAdmin };
