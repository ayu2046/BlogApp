const express = require('express');
const router = express.Router();

// Import individual message handlers
const sendHandler = require('./send');
const conversationsHandler = require('./conversations');

// Convert Next.js API handlers to Express routes
router.post('/send', (req, res) => sendHandler(req, res));
router.get('/conversations', (req, res) => conversationsHandler(req, res));

module.exports = router;
