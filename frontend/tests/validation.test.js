import { describe, expect, it } from "vitest";

import {
    DISPLAY_NAME_MAX_LENGTH, INFO_MAX_LENGTH, NAME_MAX_LENGTH, PASSWORD_MIN_LENGTH,
    USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH, validateDisplayName, validatePassword,
    validateSignup, validateTask, validateUsername,
} from "../src/shared/utils/validation";

describe("validateTask", () => {
    const validTask = {
        title: "Finish CMSC 128 Lab",
        description: "Complete the remaining requirements.",
        dueDate: "30/09/2026",
        dueTime: "23:59",
    };

    it("accepts valid task data", () => {
        expect(validateTask(validTask)).toEqual({});
    });

    it("requires a task title", () => {
        expect(validateTask({ ...validTask, title: " " })).toEqual({ title: "Task title is required." });
    });

    it("rejects a task title that is too long", () => {
        expect(validateTask({ ...validTask, title: "a".repeat(NAME_MAX_LENGTH + 1) })).toEqual({
            title: `Task title must be ${NAME_MAX_LENGTH} characters or fewer.`,
        });
    });

    it("rejects a task description that is too long", () => {
        expect(validateTask({ ...validTask, description: "a".repeat(INFO_MAX_LENGTH + 1) })).toEqual({
            description: `Description must be ${INFO_MAX_LENGTH} characters or fewer.`,
        });
    });

    it("requires a due date", () => {
        expect(validateTask({ ...validTask, dueDate: "" })).toEqual({ dueDate: "Due date is required." });
    });

    it("requires a due time", () => {
        expect(validateTask({ ...validTask, dueTime: "" })).toEqual({ dueTime: "Due time is required." });
    });
});

describe("account validation", () => {
    it("validates display names", () => {
        expect(validateDisplayName("Christie Jude")).toBeNull();
        expect(validateDisplayName(" ")).toBe("Display name is required.");
        expect(validateDisplayName("a".repeat(DISPLAY_NAME_MAX_LENGTH + 1))).toBe(`Display name must be ${DISPLAY_NAME_MAX_LENGTH} characters or fewer.`);
    });

    it("validates usernames", () => {
        expect(validateUsername("christie.jude")).toBeNull();
        expect(validateUsername(" ")).toBe("Username is required.");
        expect(validateUsername("a".repeat(USERNAME_MIN_LENGTH - 1))).toBe(`Username must be at least ${USERNAME_MIN_LENGTH} characters.`);
        expect(validateUsername("a".repeat(USERNAME_MAX_LENGTH + 1))).toBe(`Username must be ${USERNAME_MAX_LENGTH} characters or fewer.`);
        expect(validateUsername("christie jude")).toBe("Username can only contain lowercase letters, numbers, periods, and underscores.");
    });

    it("validates passwords", () => {
        expect(validatePassword("Password1!")).toBeNull();
        expect(validatePassword("")).toBe("Password is required.");
        expect(validatePassword("Ab1!")).toBe(`Password must be at least ${PASSWORD_MIN_LENGTH} characters.`);
        expect(validatePassword("password1!")).toBe("Password must include an uppercase letter.");
        expect(validatePassword("PASSWORD1!")).toBe("Password must include a lowercase letter.");
        expect(validatePassword("Password!")).toBe("Password must include a number.");
        expect(validatePassword("Password1")).toBe("Password must include a special character.");
    });
});

describe("validateSignup", () => {
    const validSignup = {
        displayName: "Christie Jude",
        username: "christie.jude",
        email: "christie@example.com",
        password: "Password1!",
        confirmPassword: "Password1!",
    };

    it("accepts valid signup data", () => {
        expect(validateSignup(validSignup)).toEqual({});
    });

    it("requires a display name", () => {
        expect(validateSignup({ ...validSignup, displayName: " " })).toEqual({ displayName: "Display name is required." });
    });

    it("rejects a display name that is too long", () => {
        expect(validateSignup({ ...validSignup, displayName: "a".repeat(DISPLAY_NAME_MAX_LENGTH + 1) })).toEqual({
            displayName: `Display name must be ${DISPLAY_NAME_MAX_LENGTH} characters or fewer.`,
        });
    });

    it("requires a username", () => {
        expect(validateSignup({ ...validSignup, username: " " })).toEqual({ username: "Username is required." });
    });

    it("rejects an invalid username", () => {
        expect(validateSignup({ ...validSignup, username: "Christie Jude" })).toEqual({
            username: "Username can only contain lowercase letters, numbers, periods, and underscores.",
        });
    });

    it("requires an email address", () => {
        expect(validateSignup({ ...validSignup, email: " " })).toEqual({ email: "Email address is required." });
    });

    it("rejects an invalid email address", () => {
        expect(validateSignup({ ...validSignup, email: "invalid-email" })).toEqual({ email: "Please enter a valid email address." });
    });

    it("requires a password", () => {
        expect(validateSignup({ ...validSignup, password: "" })).toEqual({ password: "Password is required." });
    });

    it("rejects a short password", () => {
        expect(validateSignup({ ...validSignup, password: "Ab1!", confirmPassword: "Ab1!" })).toEqual({
            password: `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
        });
    });

    it("requires an uppercase letter", () => {
        expect(validateSignup({ ...validSignup, password: "password1!", confirmPassword: "password1!" })).toEqual({
            password: "Password must include an uppercase letter.",
        });
    });

    it("requires a lowercase letter", () => {
        expect(validateSignup({ ...validSignup, password: "PASSWORD1!", confirmPassword: "PASSWORD1!" })).toEqual({
            password: "Password must include a lowercase letter.",
        });
    });

    it("requires a number", () => {
        expect(validateSignup({ ...validSignup, password: "Password!", confirmPassword: "Password!" })).toEqual({
            password: "Password must include a number.",
        });
    });

    it("requires a special character", () => {
        expect(validateSignup({ ...validSignup, password: "Password1", confirmPassword: "Password1" })).toEqual({
            password: "Password must include a special character.",
        });
    });

    it("requires password confirmation", () => {
        expect(validateSignup({ ...validSignup, confirmPassword: "" })).toEqual({ confirmPassword: "Please confirm your password." });
    });

    it("requires matching passwords", () => {
        expect(validateSignup({ ...validSignup, confirmPassword: "Different1!" })).toEqual({ confirmPassword: "Passwords do not match." });
    });
});