require('dotenv').config();
const express = require('express');
const connectDB = require('./database/database');
const { getById, postFasta, deleteById, downloadFile, downloadReport, getAllFiles } = require('./controllers/controller');
const { downloadReportPDF } = require('./controllers/pdfController');
const { signup, signin, signout, getCurrentUser } = require('./controllers/authController');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('./config/passport');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

const app = express();

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'session-secret-change-this',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Auth routes
app.post('/auth/signup', signup);
app.post('/auth/signin', signin);
app.post('/auth/signout', signout);
app.get('/auth/me', getCurrentUser);

// API auth routes (aliases)
app.post('/api/auth/signup', signup);
app.post('/api/auth/login', signin);

// OAuth routes - Google
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        const token = jwt.sign({ userId: req.user._id, email: req.user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.redirect('/');
    }
);

// OAuth routes - GitHub
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
app.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    (req, res) => {
        const token = jwt.sign({ userId: req.user._id, email: req.user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.redirect('/');
    }
);

// OAuth routes - Microsoft
app.get('/auth/microsoft', passport.authenticate('microsoft', { scope: ['user.read'] }));
app.get('/auth/microsoft/callback',
    passport.authenticate('microsoft', { failureRedirect: '/login' }),
    (req, res) => {
        const token = jwt.sign({ userId: req.user._id, email: req.user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.redirect('/');
    }
);

// Existing FASTA routes
app.get('/api/fasta', getAllFiles);
app.get('/api/fasta/:id', getById);
app.get('/api/files/:id/download', downloadFile);
app.get('/api/files/:id/report', downloadReportPDF);
app.post('/api/fasta', postFasta);
app.delete('/api/fasta/:id', deleteById);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
