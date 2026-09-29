import { beforeEach, describe, expect, it, vi } from "vitest";

const { supabase } = await import("../../config/supabaseClient.js");

const {
    requireAuth,
    signUpUser,
    logInUser,
    logOutUser,
    getCurrentUser,
    refreshToken,
    forgotPassword,
    resetPassword,
} = await import("../../controllers/authController.js");

const createResponse = () => ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
});

beforeEach(() => {
    vi.clearAllMocks();

    process.env.FRONTEND_URL = "http://localhost:5173";

    supabase.auth.getUser = vi.fn();
    supabase.auth.signUp = vi.fn();
    supabase.auth.signInWithPassword = vi.fn();
    supabase.auth.refreshSession = vi.fn();
    supabase.auth.resetPasswordForEmail = vi.fn();
});

describe("requireAuth", () => {
    it("should return 401 when the authorization header is missing", async () => {
        const req = {
            headers: {},
        };

        const res = createResponse();
        const next = vi.fn();

        await requireAuth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: "Access token missing or invalid",
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 when the authorization header is malformed", async () => {
        const req = {
            headers: {
                authorization: "Invalid token",
            },
        };

        const res = createResponse();
        const next = vi.fn();

        await requireAuth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: "Access token missing or invalid",
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 when the access token is invalid", async () => {
        const req = {
            headers: {
                authorization: "Bearer invalid-token",
            },
        };

        const res = createResponse();
        const next = vi.fn();

        supabase.auth.getUser.mockResolvedValue({
            data: {
                user: null,
            },
            error: new Error("Invalid token"),
        });

        await requireAuth(req, res, next);

        expect(supabase.auth.getUser).toHaveBeenCalledWith("invalid-token");

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: "Access token missing or invalid",
        });

        expect(next).not.toHaveBeenCalled();
    });

    it("should attach the authenticated user and call next", async () => {
        const user = {
            id: "test-user-id",
            email: "user@example.com",
        };

        const req = {
            headers: {
                authorization: "Bearer valid-token",
            },
        };

        const res = createResponse();
        const next = vi.fn();

        supabase.auth.getUser.mockResolvedValue({
            data: {
                user,
            },
            error: null,
        });

        await requireAuth(req, res, next);

        expect(supabase.auth.getUser).toHaveBeenCalledWith("valid-token");
        expect(req.user).toEqual(user);
        expect(next).toHaveBeenCalledOnce();
    });
});

describe("signUpUser", () => {
    it("should return 400 when required fields are missing", async () => {
        const req = {
            body: {
                email: "",
                password: "",
                username: "",
            },
        };

        const res = createResponse();

        await signUpUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Email, password, and username are required",
        });

        expect(supabase.auth.signUp).not.toHaveBeenCalled();
    });

    it("should sign up a user with trimmed email and username", async () => {
        const user = {
            id: "test-user-id",
            email: "user@example.com",
        };

        const req = {
            body: {
                email: "  user@example.com  ",
                password: "secret123",
                username: "  Christie  ",
            },
        };

        const res = createResponse();

        supabase.auth.signUp.mockResolvedValue({
            data: {
                user,
            },
            error: null,
        });

        await signUpUser(req, res);

        expect(supabase.auth.signUp).toHaveBeenCalledWith({
            email: "user@example.com",
            password: "secret123",
            options: {
                data: {
                    username: "Christie",
                    display_name: "Christie",
                },
            },
        });

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: "User signed up successfully",
            user,
        });
    });

    it("should reject signup when the email is already registered", async () => {
        const req = {
            body: {
                email: "user@example.com",
                password: "secret123",
                username: "Christie",
            },
        };

        const res = createResponse();

        supabase.auth.signUp.mockResolvedValue({
            data: null,
            error: new Error("User already registered"),
        });

        await signUpUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "User already registered",
        });
    });
});

describe("logInUser", () => {
    it("should return 400 when credentials are missing", async () => {
        const req = {
            body: {
                email: "",
                password: "",
            },
        };

        const res = createResponse();

        await logInUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Email and password are required",
        });
    });

    it("should log in a user successfully", async () => {
        const user = {
            id: "test-user-id",
            email: "user@example.com",
        };

        const session = {
            access_token: "access-token",
            refresh_token: "refresh-token",
        };

        const req = {
            body: {
                email: "  user@example.com  ",
                password: "secret123",
            },
        };

        const res = createResponse();

        supabase.auth.signInWithPassword.mockResolvedValue({
            data: {
                user,
                session,
            },
            error: null,
        });

        await logInUser(req, res);

        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
            email: "user@example.com",
            password: "secret123",
        });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "User signed in successfully",
            user,
            session,
        });
    });

    it("should return 400 for invalid credentials", async () => {
        const req = {
            body: {
                email: "user@example.com",
                password: "wrong-password",
            },
        };

        const res = createResponse();

        supabase.auth.signInWithPassword.mockResolvedValue({
            data: null,
            error: new Error("Invalid login credentials"),
        });

        await logInUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Invalid login credentials",
        });
    });
});

describe("logOutUser", () => {
    it("should succeed when no access token is provided", async () => {
        const req = {
            headers: {},
            body: {},
        };

        const res = createResponse();

        await logOutUser(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "User logged out successfully",
        });
    });
});

describe("getCurrentUser", () => {
    it("should return the authenticated user", async () => {
        const user = {
            id: "test-user-id",
            email: "user@example.com",
        };

        const req = {
            user,
        };

        const res = createResponse();

        await getCurrentUser(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            user,
        });
    });
});

describe("refreshToken", () => {
    it("should return 400 when the refresh token is missing", async () => {
        const req = {
            body: {},
        };

        const res = createResponse();

        await refreshToken(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Refresh token is required",
        });
    });

    it("should refresh the session successfully", async () => {
        const session = {
            access_token: "new-access-token",
            refresh_token: "new-refresh-token",
        };

        const req = {
            body: {
                refresh_token: "refresh-token",
            },
        };

        const res = createResponse();

        supabase.auth.refreshSession.mockResolvedValue({
            data: {
                session,
            },
            error: null,
        });

        await refreshToken(req, res);

        expect(supabase.auth.refreshSession).toHaveBeenCalledWith({
            refresh_token: "refresh-token",
        });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Session refreshed successfully",
            session,
        });
    });

    it("should return 400 when the refresh token is invalid", async () => {
        const req = {
            body: {
                refresh_token: "invalid-refresh-token",
            },
        };

        const res = createResponse();

        supabase.auth.refreshSession.mockResolvedValue({
            data: null,
            error: new Error("Invalid refresh token"),
        });

        await refreshToken(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Invalid refresh token",
        });
    });
});

describe("forgotPassword", () => {
    it("should return 400 when email is missing", async () => {
        const req = {
            body: {
                email: "",
            },
        };

        const res = createResponse();

        await forgotPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Email address is required",
        });
    });

    it("should request a recovery email successfully", async () => {
        const req = {
            body: {
                email: "  user@example.com  ",
            },
        };

        const res = createResponse();

        supabase.auth.resetPasswordForEmail.mockResolvedValue({
            error: null,
        });

        await forgotPassword(req, res);

        expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
            "user@example.com",
            {
                redirectTo: "http://localhost:5173/reset-password",
            }
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "If that email is registered, a reset link has been sent.",
        });
    });

    it("should return 429 when recovery emails are rate limited", async () => {
        const req = {
            body: {
                email: "user@example.com",
            },
        };

        const res = createResponse();

        supabase.auth.resetPasswordForEmail.mockResolvedValue({
            error: {
                code: "over_email_send_rate_limit",
            },
        });

        await forgotPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(429);
        expect(res.json).toHaveBeenCalledWith({
            error: "Too many reset requests. Please wait a few minutes before trying again.",
        });
    });

    it("should return a generic 500 error for unexpected recovery failures", async () => {
        const req = {
            body: {
                email: "user@example.com",
            },
        };

        const res = createResponse();

        supabase.auth.resetPasswordForEmail.mockResolvedValue({
            error: new Error("Provider unavailable"),
        });

        await forgotPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: "Unable to send a reset link right now. Please try again later.",
        });
    });
});

describe("resetPassword", () => {
    it("should return 400 when recovery data is missing", async () => {
        const req = {
            body: {
                access_token: "",
                refresh_token: "",
                password: "",
            },
        };

        const res = createResponse();

        await resetPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "access_token, refresh_token, and password are required",
        });
    });

    it("should reject a password shorter than 6 characters", async () => {
        const req = {
            body: {
                access_token: "access-token",
                refresh_token: "refresh-token",
                password: "12345",
            },
        };

        const res = createResponse();

        await resetPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Password must be at least 6 characters",
        });
    });
});