// Must match the Postgres enums `task_priority` and `task_status`.
const TASK_PRIORITIES = ['none', 'low', 'medium', 'high'];
const TASK_STATUSES = ['not_started', 'in_progress', 'completed'];

const PASSWORD_MIN_LENGTH = 8;
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 30;

// Must match the Postgres enum `project_role`.
const PROJECT_ROLES = ['owner', 'editor', 'viewer'];
const PROJECT_NAME_MAX_LENGTH = 100;

// Roles that can be granted by invite or role change. Ownership is never granted
// directly: it only moves when the current owner leaves.
const INVITE_ROLES = ['editor', 'viewer'];

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

const validateProjectName = (name) => {
    if (typeof name !== 'string' || !name.trim()) return 'Project name is required';

    if (name.trim().length > PROJECT_NAME_MAX_LENGTH) {
        return `Project name must be ${PROJECT_NAME_MAX_LENGTH} characters or fewer`;
    }

    return null;
};

const validateProjectRole = (role) =>
    PROJECT_ROLES.includes(role) ? null : `role must be one of: ${PROJECT_ROLES.join(', ')}`;

const validateInviteRole = (role) =>
    INVITE_ROLES.includes(role) ? null : `role must be one of: ${INVITE_ROLES.join(', ')}`;

// Invitee is identified by username or email (same convention as login).
const validateIdentifier = (identifier) => {
    if (typeof identifier !== 'string' || !identifier.trim()) return 'Username or email is required';
    if (identifier.trim().length > 254) return 'Username or email is too long';

    return null;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (value) => typeof value === 'string' && UUID_PATTERN.test(value);

// int8 ids arrive as strings in URL params. Returns a number, or null if it
// isn't a positive safe integer, so bad input is rejected before reaching Postgres.
const parseId = (value) => {
    if (!/^\d+$/.test(String(value))) return null;
    const id = Number(value);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
};

// Fields are optional (undefined lets the DB default apply), but if present they must be valid enum values.
const validateTaskEnums = ({ priority_level, status }) => {
    if (priority_level !== undefined && !TASK_PRIORITIES.includes(priority_level)) {
        return `priority_level must be one of: ${TASK_PRIORITIES.join(', ')}`;
    }
    if (status !== undefined && !TASK_STATUSES.includes(status)) {
        return `status must be one of: ${TASK_STATUSES.join(', ')}`;
    }

    return null;
};

module.exports = {
    TASK_PRIORITIES,
    TASK_STATUSES,
    validateTaskEnums,
    PROJECT_ROLES,
    PROJECT_NAME_MAX_LENGTH,
    validateProjectName,
    validateProjectRole,
    INVITE_ROLES,
    validateInviteRole,
    validateIdentifier,
    isUuid,
    parseId,
    PASSWORD_MIN_LENGTH,
    USERNAME_MIN_LENGTH,
    USERNAME_MAX_LENGTH,
    validatePassword,
    validateUsername,
};