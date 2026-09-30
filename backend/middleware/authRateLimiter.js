const { rateLimit } = require('express-rate-limit');

const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        error: 'Too many authentication attempts. Please try again later.',
    },
});

module.exports = authRateLimiter;