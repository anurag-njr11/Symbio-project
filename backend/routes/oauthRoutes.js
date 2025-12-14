const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// OAuth callback handler
const handleOAuthCallback = (req, res) => {
    const token = jwt.sign(
        { userId: req.user._id, email: req.user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
    res.cookie('token', token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.redirect('/');
};

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    handleOAuthCallback
);

// GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    handleOAuthCallback
);

// Microsoft OAuth
router.get('/microsoft', passport.authenticate('microsoft', { scope: ['user.read'] }));
router.get('/microsoft/callback',
    passport.authenticate('microsoft', { failureRedirect: '/login' }),
    handleOAuthCallback
);

module.exports = router;
