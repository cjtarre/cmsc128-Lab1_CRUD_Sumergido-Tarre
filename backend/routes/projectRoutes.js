const express = require('express');
const router = express.Router();
const { requireAuth } = require('../controllers/authController');
const { requireProjectRole } = require('../utils/projectAccess');
const inviteRateLimiter = require('../middleware/inviteRateLimiter');
const {
    getAllProjects,
    createProject,
    updateProject,
    deleteProject,
    restoreProject
} = require('../controllers/projectController');
const {
    getMembers,
    changeMemberRole,
    removeMember,
    leaveProject
} = require('../controllers/memberController');
const {
    createInvite,
    getProjectInvites,
    cancelInvite
} = require('../controllers/inviteController');


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

// Members                                                                               // samples
router.get('/:project_id/members', requireAuth,
    requireProjectRole('viewer'), getMembers);                                              // GET      http://localhost:5000/api/projects/123/members
router.patch('/:project_id/members/:user_id', requireAuth,
    requireProjectRole('owner'), changeMemberRole);                                         // PATCH    http://localhost:5000/api/projects/123/members/<uuid>   { role }
router.delete('/:project_id/members/:user_id', requireAuth,
    requireProjectRole('owner'), removeMember);                                             // DELETE   http://localhost:5000/api/projects/123/members/<uuid>
router.post('/:project_id/leave', requireAuth,
    requireProjectRole('viewer'), leaveProject);                                               // POST     http://localhost:5000/api/projects/123/leave

// Invites (owner side; the invitee answers via /api/invites)
router.post('/:project_id/invites', requireAuth, inviteRateLimiter,
    requireProjectRole('owner'), createInvite);                                             // POST     http://localhost:5000/api/projects/123/invites          { identifier, role }
router.get('/:project_id/invites', requireAuth,
    requireProjectRole('owner'), getProjectInvites);                                           // GET      http://localhost:5000/api/projects/123/invites
router.delete('/:project_id/invites/:invite_id', requireAuth,
    requireProjectRole('owner'), cancelInvite);                                             // DELETE   http://localhost:5000/api/projects/123/invites/45

module.exports = router;