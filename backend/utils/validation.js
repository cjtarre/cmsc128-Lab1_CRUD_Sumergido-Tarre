const PASSWORD_MIN_LENGTH = 8;
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 30;

const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < PASSWORD_MIN_LENGTH) return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/\d/.test(password)) return 'Password must contain at least one number';
    if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain at least one special character';

    return null;
};

const validateUsername = (username) => {
    if (!username?.trim()) return 'Username is required';

    const normalizedUsername = username.trim().toLowerCase();

    if (normalizedUsername.length < USERNAME_MIN_LENGTH) {
        return `Username must be at least ${USERNAME_MIN_LENGTH} characters`;
    }

    if (normalizedUsername.length > USERNAME_MAX_LENGTH) {
        return `Username must be ${USERNAME_MAX_LENGTH} characters or fewer`;
    }

    if (!/^[a-z0-9._]+$/.test(normalizedUsername)) {
        return 'Username can only contain lowercase letters, numbers, periods, and underscores';
    }

    return null;
};

module.exports = {
    PASSWORD_MIN_LENGTH,
    USERNAME_MIN_LENGTH,
    USERNAME_MAX_LENGTH,
    validatePassword,
    validateUsername,
};