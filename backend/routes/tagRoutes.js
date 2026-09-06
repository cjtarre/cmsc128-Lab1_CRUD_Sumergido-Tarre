const express = require('express');
const router = express.Router();

const {
    getAllTags
} = require('../controllers/tagController');

router.get('/', getAllTags);        // GET http://localhost:5000/api/tags

module.exports = router;