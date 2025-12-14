require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('./config/passport');

// Import database connection
const connectDB = require('./database/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const sequenceRoutes = require('./routes/sequenceRoutes');
const aiRoutes = require('./routes/aiRoutes');
const oauthRoutes = require('./routes/oauthRoutes');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'session-secret-change-this',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes); // API alias
app.use('/api', sequenceRoutes);
app.use('/api', aiRoutes);
app.use('/auth', oauthRoutes); // OAuth routes

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
