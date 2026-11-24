const express = require('express');
const router = express.Router();

const { requireAuth } = require('../controllers/authController');
const {
    getAllTags,
    createTag,
    updateTag,
    deleteTag
} = require('../controllers/tagController');

router.get('/', requireAuth, getAllTags);                    // GET http://localhost:5000/api/tags
router.post('/', requireAuth, createTag);                    // POST http://localhost:5000/api/tags
router.patch('/:tag_id', requireAuth, updateTag);            // PATCH http://localhost:5000/api/tags/:tag_id
router.delete('/:tag_id', requireAuth, deleteTag);           // DELETE http://localhost:5000/api/tags/:tag_id

module.exports = router;