const express = require('express');
const router = express.Router();
const { requireAuth } = require('../controllers/authController');
const { requireProjectRole } = require('../utils/projectAccess');
const {
    getAllProjects,
    createProject,
    updateProject,
    deleteProject,
    restoreProject
} = require('../controllers/projectController');
// requireAuth always runs first (sets req.user); requireProjectRole then checks
// membership + minimum role and sets req.projectId / req.projectRole.
//
// CRUD route endpoints                                                                  // samples
router.get('/', requireAuth, getAllProjects);                                               // GET      http://localhost:5000/api/projects  (?deleted=true for deleted projects)
router.post('/', requireAuth, createProject);                                               // POST     http://localhost:5000/api/projects                { project_name }
router.put('/:project_id', requireAuth, requireProjectRole('owner'), updateProject);              // PUT      http://localhost:5000/api/projects/123            { project_name }
router.delete('/:project_id', requireAuth, requireProjectRole('owner'), deleteProject);           // DELETE   http://localhost:5000/api/projects/123
router.patch('/:project_id/restore', requireAuth,
    requireProjectRole('owner', { includeDeleted: true }), restoreProject);                    // PATCH    http://localhost:5000/api/projects/123/restore

module.exports = router;