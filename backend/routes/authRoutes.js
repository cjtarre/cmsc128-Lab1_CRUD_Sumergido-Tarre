const express = require('express');
const router = express.Router();

const { 
    requireAuth, 
    logInUser, 
    logOutUser, 
    signUpUser, 
    getCurrentUser, 
    refreshToken 
} = require('../controllers/authController');

router.post('/signup', signUpUser);
router.post('/login', logInUser);
router.post('/logout', logOutUser);
router.get('/me', requireAuth, getCurrentUser);
router.post('/refresh', refreshToken);

router.get('/protected', requireAuth, (req, res) => {
    res.status(200).json({ message: 'Access granted to protected route', user: req.user });
});

module.exports = router;