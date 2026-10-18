const express = require('express');
const router = express.Router();
const { requireAuth } = require('../controllers/authController');
const {
    getMyInvites,
    acceptInvite,
    declineInvite
} = require('../controllers/inviteController');

// The invitee's side of invitations. Ownership is checked against req.user.id
// inside the controller, so no project role is needed here.
router.get('/', requireAuth, getMyInvites);                          // GET      http://localhost:5000/api/invites
router.post('/:invite_id/accept', requireAuth, acceptInvite);        // POST     http://localhost:5000/api/invites/45/accept
router.post('/:invite_id/decline', requireAuth, declineInvite);      // POST     http://localhost:5000/api/invites/45/decline

module.exports = router;
