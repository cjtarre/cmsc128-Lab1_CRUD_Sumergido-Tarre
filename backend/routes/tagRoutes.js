const express = require('express');
const router = express.Router();

const { requireAuth } = require('../controllers/authController');
const {
    getAllTags
} = require('../controllers/tagController');

router.get('/', requireAuth, getAllTags);        // GET http://localhost:5000/api/tags

module.exports = router;