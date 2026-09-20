const express = require('express');
const router = express.Router();

const {
    getAllTasks,
    createTask,
    updateTask,
    deleteTask,
    restoreTask
} = require('../controllers/taskController');

// CRUD route endpoints                     // samples
router.get('/', getAllTasks);               // GET    http://localhost:5000/api/tasks
router.post('/', createTask);               // POST   http://localhost:5000/api/tasks
router.put('/:task_id', updateTask);        // PUT    http://localhost:5000/api/tasks/123
router.delete('/:task_id', deleteTask);     // DELETE http://localhost:5000/api/tasks/123
router.patch('/:task_id/restore', restoreTask); // PATCH http://localhost:5000/api/tasks/123/restore

module.exports = router;