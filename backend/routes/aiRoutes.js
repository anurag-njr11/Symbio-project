const express = require('express');
const router = express.Router();
const { generateSummary, chatWithBot } = require('../controllers/sequenceController');

// AI routes
router.post('/summary', generateSummary);
router.post('/chat', chatWithBot);

module.exports = router;
