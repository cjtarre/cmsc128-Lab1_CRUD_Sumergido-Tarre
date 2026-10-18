const express = require('express');
const router = express.Router();
const { requireAuth } = require('../controllers/authController');
const { requireListRole } = require('../utils/listAccess');
const {
} = require('../controllers/listController');
// CRUD route endpoints                                                                  // samples
module.exports = router;