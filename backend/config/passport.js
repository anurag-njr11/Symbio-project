const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const User = require('../database/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Serialize user
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback'
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ oauthId: profile.id, oauthProvider: 'google' });

            if (!user) {
                // Check if email already exists
                user = await User.findOne({ email: profile.emails[0].value });
                if (user) {
                    // Update existing user with OAuth info
                    user.oauthProvider = 'google';
                    user.oauthId = profile.id;
                    await user.save();
                } else {
                    // Create new user
                    user = new User({
                        email: profile.emails[0].value,
                        name: profile.displayName,
                        oauthProvider: 'google',
                        oauthId: profile.id
                    });
                    await user.save();
                }
            }

            done(null, user);
        } catch (error) {
            done(error, null);
        }
    }));
}

// GitHub Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: '/auth/github/callback',
        scope: ['user:email']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ oauthId: profile.id, oauthProvider: 'github' });

            if (!user) {
                const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.username}@github.com`;
                user = await User.findOne({ email });

                if (user) {
                    user.oauthProvider = 'github';
                    user.oauthId = profile.id;
                    await user.save();
                } else {
                    user = new User({
                        email,
                        name: profile.displayName || profile.username,
                        oauthProvider: 'github',
                        oauthId: profile.id
                    });
                    await user.save();
                }
            }

            done(null, user);
        } catch (error) {
            done(error, null);
        }
    }));
}

// Microsoft Strategy
if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
    passport.use(new MicrosoftStrategy({
        clientID: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        callbackURL: '/auth/microsoft/callback',
        scope: ['user.read']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ oauthId: profile.id, oauthProvider: 'microsoft' });

            if (!user) {
                const email = profile.emails && profile.emails[0] ? profile.emails[0].value : profile.userPrincipalName;
                user = await User.findOne({ email });

                if (user) {
                    user.oauthProvider = 'microsoft';
                    user.oauthId = profile.id;
                    await user.save();
                } else {
                    user = new User({
                        email,
                        name: profile.displayName,
                        oauthProvider: 'microsoft',
                        oauthId: profile.id
                    });
                    await user.save();
                }
            }

            done(null, user);
        } catch (error) {
            done(error, null);
        }
    }));
}

module.exports = passport;
