const express = require('express');
const router = express.Router();
const { requireAuth } = require('../controllers/authController');
const { requireListRole } = require('../utils/listAccess');
const {
    getAllLists,
    createList,
    updateList,
    deleteList,
    restoreList
} = require('../controllers/listController');

// requireAuth always runs first (sets req.user); requireListRole then checks
// membership + minimum role and sets req.listId / req.listRole.
//
// CRUD route endpoints                                                                  // samples
router.get('/', requireAuth, getAllLists);                                               // GET      http://localhost:5000/api/lists  (?deleted=true for deleted lists)
router.post('/', requireAuth, createList);                                               // POST     http://localhost:5000/api/lists                { list_name }
router.put('/:list_id', requireAuth, requireListRole('owner'), updateList);              // PUT      http://localhost:5000/api/lists/123            { list_name }
router.delete('/:list_id', requireAuth, requireListRole('owner'), deleteList);           // DELETE   http://localhost:5000/api/lists/123
router.patch('/:list_id/restore', requireAuth,
    requireListRole('owner', { includeDeleted: true }), restoreList);                    // PATCH    http://localhost:5000/api/lists/123/restore

module.exports = router;