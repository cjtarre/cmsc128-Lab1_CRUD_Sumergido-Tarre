const express = require('express');
const router = express.Router();
const { requireAuth } = require('../controllers/authController');
const {
    getAllTasks,
    createTask,
    updateTask,
    deleteTask,
    restoreTask
} = require('../controllers/taskController');

// CRUD route endpoints                     // samples
router.get('/', requireAuth, getAllTasks);                      // GET      http://localhost:5000/api/tasks
router.post('/', requireAuth, createTask);                      // POST     http://localhost:5000/api/tasks
router.put('/:task_id', requireAuth, updateTask);               // PUT      http://localhost:5000/api/tasks/123
router.delete('/:task_id', requireAuth, deleteTask);            // DELETE   http://localhost:5000/api/tasks/123
router.patch('/:task_id/restore', requireAuth, restoreTask);    // PATCH    http://localhost:5000/api/tasks/123/restore


module.exports = router;