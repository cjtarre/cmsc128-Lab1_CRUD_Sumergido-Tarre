const express = require('express');
const router = express.Router();

const { 
    requireAuth, 
    logInUser, 
    logOutUser, 
    signUpUser, 
    getCurrentUser, 
    refreshToken,
    forgotPassword,
    resetPassword,
} = require('../controllers/authController');

const authRateLimiter = require('../middleware/authRateLimiter');

router.get('/me', requireAuth, getCurrentUser);

router.post('/signup', authRateLimiter, signUpUser);
router.post('/login', authRateLimiter, logInUser);
router.post('/logout', logOutUser);
router.post('/refresh', refreshToken);
router.post('/forgot-password', authRateLimiter, forgotPassword);
router.post('/reset-password', authRateLimiter, resetPassword);

router.get('/protected', requireAuth, (req, res) => {
    res.status(200).json({ message: 'Access granted to protected route', user: req.user });
});

module.exports = router;