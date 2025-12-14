const express = require('express');
const router = express.Router();
const { signup, signin, signout, getCurrentUser } = require('../controllers/authController');

// Auth routes
router.post('/signup', signup);
router.post('/signin', signin);
router.post('/login', signin); // Alias for signin
router.post('/signout', signout);
router.get('/me', getCurrentUser);

module.exports = router;
