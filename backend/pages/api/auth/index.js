const express = require('express');
const router = express.Router();

// Import individual auth handlers
const loginHandler = require('./login');
const registerHandler = require('./register');
const logoutHandler = require('./logout');

// Convert Next.js API handlers to Express routes
router.post('/login', (req, res) => loginHandler(req, res));
router.post('/register', (req, res) => registerHandler(req, res));
router.post('/logout', (req, res) => logoutHandler(req, res));

module.exports = router;
