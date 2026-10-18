const express = require('express');
const router = express.Router();
const { requireAuth } = require('../controllers/authController');
const {
} = require('../controllers/inviteController');
module.exports = router;
