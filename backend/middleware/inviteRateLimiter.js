const { rateLimit } = require('express-rate-limit');

// Inviting by email reveals whether an address is registered, so cap how fast
// one client can probe. Applied to invite creation only.
const inviteRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        error: 'Too many invitations sent. Please try again later.',
    },
});

module.exports = inviteRateLimiter;
