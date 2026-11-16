const express = require('express');
const router = express.Router();

const { requireAuth } = require('../controllers/authController');
const {
    getFocusPlaylist,
    lookupFocusPlaylist,
    updateFocusPlaylist,
    updateProfile,
    updateEmail,
    updatePassword,
} = require('../controllers/userController');

router.patch('/me', requireAuth, updateProfile);                // PATCH  http://localhost:5000/api/users/me           { display_name?, username? }
router.patch('/me/email', requireAuth, updateEmail);            // PATCH  http://localhost:5000/api/users/me/email      { email, refresh_token }
router.patch('/me/password', requireAuth, updatePassword);      // PATCH  http://localhost:5000/api/users/me/password   { password, refresh_token }
router.get('/me/focus-playlist', requireAuth, getFocusPlaylist);
router.get('/me/focus-playlist/:playlistId/title', requireAuth, lookupFocusPlaylist);
router.put('/me/focus-playlist', requireAuth, updateFocusPlaylist);

module.exports = router;
