export const NAME_MAX_LENGTH = 80;
export const INFO_MAX_LENGTH = 500;

export function validateTask(task) {
    const errors = {};

    if (!task.title?.trim()) {
        errors.title = "Task title is required.";
        return errors;
    }

    if (task.title.trim().length > NAME_MAX_LENGTH) {
        errors.title = `Task title must be ${NAME_MAX_LENGTH} characters or fewer.`;
        return errors;
    }

    if (task.description?.trim().length > INFO_MAX_LENGTH) {
        errors.description = `Description must be ${INFO_MAX_LENGTH} characters or fewer.`;
        return errors;
    }

    if (!task.dueDate) {
        errors.dueDate = "Due date is required.";
        return errors;
    }

    if (!task.dueTime) {
        errors.dueTime = "Due time is required.";
        return errors;
    }

    return errors;
}


export const PASSWORD_MIN_LENGTH = 8;

export function validateSignup({ username, email, password, confirmPassword }) {
    const errors = {};

    if (!username?.trim()) {
        errors.username = "Display name is required.";
        return errors;
    }

    if (username.trim().length > NAME_MAX_LENGTH) {
        errors.username = `Display name must be ${NAME_MAX_LENGTH} characters or fewer.`;
        return errors;
    }

    if (!email?.trim()) {
        errors.email = "Email address is required.";
        return errors;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
        errors.email = "Please enter a valid email address.";
        return errors;
    }

    if (!password) {
        errors.password = "Password is required.";
        return errors;
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
        errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
        return errors;
    }

    if (!/[A-Z]/.test(password)) {
        errors.password = "Password must include an uppercase letter.";
        return errors;
    }

    if (!/[a-z]/.test(password)) {
        errors.password = "Password must include a lowercase letter.";
        return errors;
    }

    if (!/\d/.test(password)) {
        errors.password = "Password must include a number.";
        return errors;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
        errors.password = "Password must include a special character.";
        return errors;
    }

    if (!confirmPassword) {
        errors.confirmPassword = "Please confirm your password.";
        return errors;
    }

    if (password !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match.";
        return errors;
    }

    return errors;
}