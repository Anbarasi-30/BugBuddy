/**
 * JWT Utility
 * 
 * Generates a signed JWT for an authenticated user.
 */

const jwt = require('jsonwebtoken');

/**
 * Creates a JWT containing the user's MongoDB ID.
 * Token expires in 7 days by default.
 * 
 * @param {string} userId - MongoDB user _id as string
 * @returns {string} Signed JWT token
 */
function generateToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

module.exports = { generateToken };
