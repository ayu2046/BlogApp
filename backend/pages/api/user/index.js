const express = require('express');
const router = express.Router();

// Import individual user handlers
const profileHandler = require('./profile');
const updateHandler = require('./update');
const getByUsernameHandler = require('./getByUsername');
const searchHandler = require('./search');
const statsHandler = require('./stats');

// Convert Next.js API handlers to Express routes
router.get('/profile', (req, res) => profileHandler(req, res));
router.put('/update', (req, res) => updateHandler(req, res));
router.get('/getByUsername', (req, res) => getByUsernameHandler(req, res));
router.get('/search', (req, res) => searchHandler(req, res));
router.get('/stats', (req, res) => statsHandler(req, res));

module.exports = router;
