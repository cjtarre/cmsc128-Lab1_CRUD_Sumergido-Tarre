// backend/middleware/rateLimiters.js (or wherever your limiters live)
const { rateLimit } = require('express-rate-limit');

const apiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 400,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        error: 'Too many requests. Please slow down and try again shortly.',
    },
});
module.exports = apiRateLimiter;