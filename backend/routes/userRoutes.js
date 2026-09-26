const express = require('express');
const router = express.Router();

const { requireAuth } = require('../controllers/authController');
const {
    updateProfile,
    updateEmail,
    updatePassword,
} = require('../controllers/userController');

router.patch('/me', requireAuth, updateProfile);                // PATCH  http://localhost:5000/api/users/me           { display_name?, username? }
router.patch('/me/email', requireAuth, updateEmail);            // PATCH  http://localhost:5000/api/users/me/email      { email, refresh_token }
router.patch('/me/password', requireAuth, updatePassword);      // PATCH  http://localhost:5000/api/users/me/password   { password, refresh_token }

module.exports = router;