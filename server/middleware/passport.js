/**
 * Passport Configuration
 * 
 * Sets up Google OAuth 2.0 strategy.
 * When a user authenticates via Google, we either find their
 * existing account or create a new one.
 */

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if a user with this Google ID already exists
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // Returning Google user
          return done(null, user);
        }

        // Check if someone already registered with this email via password
        const email = profile.emails && profile.emails[0] && profile.emails[0].value;
        if (email) {
          user = await User.findOne({ email });
          if (user) {
            // Link the Google ID to the existing email account
            user.googleId = profile.id;
            if (!user.avatar && profile.photos && profile.photos[0]) {
              user.avatar = profile.photos[0].value;
            }
            await user.save();
            return done(null, user);
          }
        }

        // Create a brand-new user for this Google account
        const newUser = await User.create({
          name: profile.displayName || 'Student',
          email: email || `google_${profile.id}@bugbuddy.app`,
          googleId: profile.id,
          avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
        });

        return done(null, newUser);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
