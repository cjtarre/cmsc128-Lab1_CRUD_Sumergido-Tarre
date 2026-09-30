export const NAME_MAX_LENGTH = 80;
export const INFO_MAX_LENGTH = 500;
export const PASSWORD_MIN_LENGTH = 8;
export const DISPLAY_NAME_MAX_LENGTH = 50;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;

export function validateTask({ title, description, dueDate, dueTime }) {
    const errors = {};

    if (!title?.trim()) errors.title = "Task title is required.";
    else if (title.trim().length > NAME_MAX_LENGTH) errors.title = `Task title must be ${NAME_MAX_LENGTH} characters or fewer.`;
    else if (description?.trim().length > INFO_MAX_LENGTH) errors.description = `Description must be ${INFO_MAX_LENGTH} characters or fewer.`;
    else if (!dueDate) errors.dueDate = "Due date is required.";
    else if (!dueTime) errors.dueTime = "Due time is required.";

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

export function validatePassword(password) {
    if (!password) return "Password is required.";
    if (password.length < PASSWORD_MIN_LENGTH) return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
    if (!/[A-Z]/.test(password)) return "Password must include an uppercase letter.";
    if (!/[a-z]/.test(password)) return "Password must include a lowercase letter.";
    if (!/\d/.test(password)) return "Password must include a number.";
    if (!/[^A-Za-z0-9]/.test(password)) return "Password must include a special character.";
    return null;
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