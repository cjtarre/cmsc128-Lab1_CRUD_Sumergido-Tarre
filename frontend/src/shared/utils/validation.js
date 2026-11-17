export const NAME_MAX_LENGTH = 80;
export const INFO_MAX_LENGTH = 500;
export const PASSWORD_MIN_LENGTH = 8;
export const DISPLAY_NAME_MAX_LENGTH = 50;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;

export function validateTask({ title, description, dueDate, dueTime }, { deadlineRequired = true } = {}) {
    const errors = {};

    if (!title?.trim()) errors.title = "Task title is required.";
    else if (title.trim().length > NAME_MAX_LENGTH) errors.title = `Task title must be ${NAME_MAX_LENGTH} characters or fewer.`;
    else if (description?.trim().length > INFO_MAX_LENGTH) errors.description = `Description must be ${INFO_MAX_LENGTH} characters or fewer.`;
    else if (deadlineRequired && !dueDate) errors.dueDate = "Due date is required.";
    else if (deadlineRequired && !dueTime) errors.dueTime = "Due time is required.";
    else if (dueTime && !dueDate) errors.dueDate = "Choose a due date before adding a due time.";

    return errors;
}

export function validateDisplayName(displayName) {
    if (!displayName?.trim()) return "Display name is required.";
    if (displayName.trim().length > DISPLAY_NAME_MAX_LENGTH) return `Display name must be ${DISPLAY_NAME_MAX_LENGTH} characters or fewer.`;
    return null;
}

export function validateUsername(username) {
    if (!username?.trim()) return "Username is required.";

    const normalizedUsername = username.trim().toLowerCase();

    if (normalizedUsername.length < USERNAME_MIN_LENGTH) return `Username must be at least ${USERNAME_MIN_LENGTH} characters.`;
    if (normalizedUsername.length > USERNAME_MAX_LENGTH) return `Username must be ${USERNAME_MAX_LENGTH} characters or fewer.`;
    if (!/^[a-z0-9._]+$/.test(normalizedUsername)) return "Username can only contain lowercase letters, numbers, periods, and underscores.";

    return null;
}

const passwordRules = [
    {
        key: "length",
        label: `At least ${PASSWORD_MIN_LENGTH} characters`,
        error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
        test: (password) => password.length >= PASSWORD_MIN_LENGTH,
    },
    {
        key: "uppercase",
        label: "One uppercase letter",
        error: "Password must include an uppercase letter.",
        test: (password) => /[A-Z]/.test(password),
    },
    {
        key: "lowercase",
        label: "One lowercase letter",
        error: "Password must include a lowercase letter.",
        test: (password) => /[a-z]/.test(password),
    },
    {
        key: "number",
        label: "One number",
        error: "Password must include a number.",
        test: (password) => /\d/.test(password),
    },
    {
        key: "special",
        label: "One special character",
        error: "Password must include a special character.",
        test: (password) => /[^A-Za-z0-9]/.test(password),
    },
];

export function validatePassword(password) {
    if (!password) return "Password is required.";
    return passwordRules.find(({ test }) => !test(password))?.error ?? null;
}

export function validateSignup({ displayName, username, email, password, confirmPassword }) {
    const errors = {};

    const displayNameError = validateDisplayName(displayName);
    if (displayNameError) return { displayName: displayNameError };

    const usernameError = validateUsername(username);
    if (usernameError) return { username: usernameError };

    if (!email?.trim()) return { email: "Email address is required." };

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) return { email: "Please enter a valid email address." };

    const passwordError = validatePassword(password);
    if (passwordError) return { password: passwordError };

    if (!confirmPassword) return { confirmPassword: "Please confirm your password." };
    if (password !== confirmPassword) return { confirmPassword: "Passwords do not match." };

    return errors;
}

// Return the shared password requirements and their current validation state.
export function getPasswordRequirements(password = "") {
    return passwordRules.map(({ key, label, test }) => ({ key, label, met: test(password) }));
}

// Check whether a password satisfies every shared password requirement.
export function isPasswordValid(password = "") {
    return getPasswordRequirements(password).every(({ met }) => met);
}