import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const mock = require("mock-require");

const supabase = {
    auth: {
        getUser: vi.fn(),
        signUp: vi.fn(),
        signInWithPassword: vi.fn(),
        refreshSession: vi.fn(),
        resetPasswordForEmail: vi.fn(),
    },
};

const supabaseAdmin = {
    from: vi.fn(),
    auth: {
        admin: {
            getUserById: vi.fn(),
            deleteUser: vi.fn(),
        },
    },
};

const createClient = vi.fn();

mock(path.resolve("config/supabaseClient.js"), {
    supabase,
    supabaseUrl: "http://localhost:54321",
    supabaseKey: "test-key",
});

mock(path.resolve("config/supabaseAdmin.js"), supabaseAdmin);
mock("@supabase/supabase-js", { createClient });

const { requireAuth, signUpUser, logInUser, logOutUser, getCurrentUser, refreshToken, forgotPassword, resetPassword } = require("../../controllers/authController.js");

const createResponse = () => ({ status: vi.fn().mockReturnThis(), json: vi.fn() });

const mockProfileQuery = ({ data = null, error = null } = {}) => {
    const query = {
        select: vi.fn(),
        eq: vi.fn(),
        maybeSingle: vi.fn(),
        single: vi.fn(),
        insert: vi.fn(),
    };

    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.maybeSingle.mockResolvedValue({ data, error });
    query.single.mockResolvedValue({ data, error });
    query.insert.mockResolvedValue({ data, error });

    supabaseAdmin.from.mockReturnValue(query);
    return query;
};

beforeEach(() => {
    vi.clearAllMocks();
    process.env.FRONTEND_URL = "http://localhost:5173";
});

describe("requireAuth", () => {
    it("returns 401 when authorization is missing", async () => {
        const req = { headers: {} }, res = createResponse(), next = vi.fn();

        await requireAuth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Access token missing or invalid" });
        expect(next).not.toHaveBeenCalled();
    });

    it("returns 401 when authorization is malformed", async () => {
        const req = { headers: { authorization: "Invalid token" } }, res = createResponse(), next = vi.fn();

        await requireAuth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Access token missing or invalid" });
    });

    it("returns 401 for an invalid token", async () => {
        const req = { headers: { authorization: "Bearer invalid-token" } }, res = createResponse(), next = vi.fn();
        supabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: new Error("Invalid token") });

        await requireAuth(req, res, next);

        expect(supabase.auth.getUser).toHaveBeenCalledWith("invalid-token");
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Access token missing or invalid" });
        expect(next).not.toHaveBeenCalled();
    });

    it("attaches the authenticated user and calls next", async () => {
        const user = { id: "user-1", email: "user@example.com" };
        const req = { headers: { authorization: "Bearer valid-token" } }, res = createResponse(), next = vi.fn();
        supabase.auth.getUser.mockResolvedValue({ data: { user }, error: null });

        await requireAuth(req, res, next);

        expect(req.user).toEqual(user);
        expect(next).toHaveBeenCalledOnce();
    });

    it("returns 500 when authentication throws", async () => {
        const req = { headers: { authorization: "Bearer token" } }, res = createResponse(), next = vi.fn();
        supabase.auth.getUser.mockRejectedValue(new Error("Failure"));

        await requireAuth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
});

describe("signUpUser", () => {
    const body = {
        email: "user@example.com",
        password: "Password1!",
        username: "test.user",
        display_name: "Test User",
    };

    it("requires all signup fields", async () => {
        const req = { body: { ...body, display_name: "" } }, res = createResponse();

        await signUpUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Email, password, username, and display name are required" });
    });

    it("rejects an invalid password", async () => {
        const req = { body: { ...body, password: "short" } }, res = createResponse();

        await signUpUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("rejects an invalid username", async () => {
        const req = { body: { ...body, username: "ab" } }, res = createResponse();

        await signUpUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Username must be at least 3 characters" });
    });

    it("rejects a duplicate username", async () => {
        const req = { body }, res = createResponse();
        mockProfileQuery({ data: { user_id: "existing-user" } });

        await signUpUser(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({ error: "That username is already taken" });
        expect(supabase.auth.signUp).not.toHaveBeenCalled();
    });

    it("creates an Auth user and profile", async () => {
        const req = { body }, res = createResponse();
        const query = mockProfileQuery();

        supabase.auth.signUp.mockResolvedValue({
            data: { user: { id: "user-1", email: "user@example.com", identities: [{}] } },
            error: null,
        });

        await signUpUser(req, res);

        expect(supabase.auth.signUp).toHaveBeenCalledWith({ email: "user@example.com", password: "Password1!" });
        expect(query.insert).toHaveBeenCalledWith({
            user_id: "user-1",
            username: "test.user",
            display_name: "Test User",
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: "User signed up successfully",
            user: { id: "user-1", email: "user@example.com", username: "test.user", display_name: "Test User" },
        });
    });

    it("normalizes username and trims signup data", async () => {
        const req = {
            body: {
                email: "  user@example.com  ",
                password: "Password1!",
                username: "  Test.User  ",
                display_name: "  Test User  ",
            },
        };
        const res = createResponse();
        const query = mockProfileQuery();

        supabase.auth.signUp.mockResolvedValue({
            data: { user: { id: "user-1", email: "user@example.com", identities: [{}] } },
            error: null,
        });

        await signUpUser(req, res);

        expect(query.eq).toHaveBeenCalledWith("username", "test.user");
        expect(query.insert).toHaveBeenCalledWith({
            user_id: "user-1",
            username: "test.user",
            display_name: "Test User",
        });
    });

    it("returns the Supabase signup error", async () => {
        const req = { body }, res = createResponse();
        mockProfileQuery();
        supabase.auth.signUp.mockResolvedValue({ data: null, error: new Error("Signup failed") });

        await signUpUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Signup failed" });
    });

    it("rejects a duplicate email", async () => {
        const req = { body }, res = createResponse();
        mockProfileQuery();

        supabase.auth.signUp.mockResolvedValue({
            data: { user: { id: "user-1", email: "user@example.com", identities: [] } },
            error: null,
        });

        await signUpUser(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({ error: "An account with this email already exists" });
    });

    it("deletes the Auth user when profile creation fails", async () => {
        const req = { body }, res = createResponse();

        const query = mockProfileQuery();
        query.insert.mockResolvedValue({ data: null, error: new Error("Profile failed") });

        supabase.auth.signUp.mockResolvedValue({
            data: { user: { id: "user-1", email: "user@example.com", identities: [{}] } },
            error: null,
        });
        supabaseAdmin.auth.admin.deleteUser.mockResolvedValue({ error: null });

        await signUpUser(req, res);

        expect(supabaseAdmin.auth.admin.deleteUser).toHaveBeenCalledWith("user-1");
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
});

describe("logInUser", () => {
    const user = { id: "user-1", email: "user@example.com" };
    const profile = { username: "test.user", display_name: "Test User" };
    const session = { access_token: "access-token", refresh_token: "refresh-token" };

    it("requires an identifier and password", async () => {
        const req = { body: { identifier: "", password: "" } }, res = createResponse();

        await logInUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Username or email and password are required" });
    });

    it("logs in with an email", async () => {
        const req = { body: { identifier: "user@example.com", password: "Password1!" } }, res = createResponse();
        mockProfileQuery({ data: profile });
        supabase.auth.signInWithPassword.mockResolvedValue({ data: { user, session }, error: null });

        await logInUser(req, res);

        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({ email: "user@example.com", password: "Password1!" });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "User signed in successfully",
            user: { ...user, ...profile },
            session,
        });
    });

    it("logs in with a username", async () => {
        const req = { body: { identifier: "Test.User", password: "Password1!" } }, res = createResponse();

        const lookupQuery = {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: { user_id: "user-1" }, error: null }),
        };

        const profileQuery = {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: profile, error: null }),
        };

        supabaseAdmin.from.mockReturnValueOnce(lookupQuery).mockReturnValueOnce(profileQuery);
        supabaseAdmin.auth.admin.getUserById.mockResolvedValue({ data: { user }, error: null });
        supabase.auth.signInWithPassword.mockResolvedValue({ data: { user, session }, error: null });

        await logInUser(req, res);

        expect(lookupQuery.eq).toHaveBeenCalledWith("username", "test.user");
        expect(supabaseAdmin.auth.admin.getUserById).toHaveBeenCalledWith("user-1");
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({ email: "user@example.com", password: "Password1!" });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("rejects an unknown username", async () => {
        const req = { body: { identifier: "unknown", password: "Password1!" } }, res = createResponse();
        mockProfileQuery({ data: null });

        await logInUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid username/email or password" });
        expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    it("rejects invalid credentials", async () => {
        const req = { body: { identifier: "user@example.com", password: "Wrong1!" } }, res = createResponse();
        supabase.auth.signInWithPassword.mockResolvedValue({ data: null, error: new Error("Invalid credentials") });

        await logInUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid username/email or password" });
    });

    it("returns 500 when profile retrieval fails", async () => {
        const req = { body: { identifier: "user@example.com", password: "Password1!" } }, res = createResponse();
        mockProfileQuery({ error: new Error("Profile failed") });
        supabase.auth.signInWithPassword.mockResolvedValue({ data: { user, session }, error: null });

        await logInUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
});

describe("logOutUser", () => {
    it("returns success when no token exists", async () => {
        const req = { headers: {}, body: {} }, res = createResponse();

        await logOutUser(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "User logged out successfully" });
    });

    it("sets the session and signs out", async () => {
        const requestClient = {
            auth: {
                setSession: vi.fn().mockResolvedValue({ error: null }),
                signOut: vi.fn().mockResolvedValue({ error: null }),
            },
        };

        createClient.mockReturnValue(requestClient);

        const req = {
            headers: { authorization: "Bearer access-token" },
            body: { refresh_token: "refresh-token" },
        };
        const res = createResponse();

        await logOutUser(req, res);

        expect(requestClient.auth.setSession).toHaveBeenCalledWith({
            access_token: "access-token",
            refresh_token: "refresh-token",
        });
        expect(requestClient.auth.signOut).toHaveBeenCalledOnce();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "User logged out successfully" });
    });

    it("returns 500 when logout fails", async () => {
        const requestClient = {
            auth: {
                setSession: vi.fn().mockResolvedValue({ error: null }),
                signOut: vi.fn().mockResolvedValue({ error: new Error("Logout failed") }),
            },
        };

        createClient.mockReturnValue(requestClient);

        const req = {
            headers: { authorization: "Bearer access-token" },
            body: { refresh_token: "refresh-token" },
        };
        const res = createResponse();

        await logOutUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
});

describe("getCurrentUser", () => {
    it("returns the authenticated user with profile data", async () => {
        const req = { user: { id: "user-1", email: "user@example.com" } }, res = createResponse();
        mockProfileQuery({ data: { username: "test.user", display_name: "Test User" } });

        await getCurrentUser(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            user: {
                id: "user-1",
                email: "user@example.com",
                username: "test.user",
                display_name: "Test User",
            },
        });
    });

    it("returns 500 when profile retrieval fails", async () => {
        const req = { user: { id: "user-1", email: "user@example.com" } }, res = createResponse();
        mockProfileQuery({ error: new Error("Profile failed") });

        await getCurrentUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
});

describe("refreshToken", () => {
    it("requires a refresh token", async () => {
        const req = { body: {} }, res = createResponse();

        await refreshToken(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Refresh token is required" });
    });

    it("refreshes the session", async () => {
        const session = { access_token: "new-access", refresh_token: "new-refresh" };
        const req = { body: { refresh_token: "refresh-token" } }, res = createResponse();

        supabase.auth.refreshSession.mockResolvedValue({ data: { session }, error: null });

        await refreshToken(req, res);

        expect(supabase.auth.refreshSession).toHaveBeenCalledWith({ refresh_token: "refresh-token" });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Session refreshed successfully", session });
    });

    it("returns the refresh error", async () => {
        const req = { body: { refresh_token: "invalid" } }, res = createResponse();
        supabase.auth.refreshSession.mockResolvedValue({ data: null, error: new Error("Invalid refresh token") });

        await refreshToken(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid refresh token" });
    });
});

describe("forgotPassword", () => {
    it("requires an email", async () => {
        const req = { body: { email: "" } }, res = createResponse();

        await forgotPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Email address is required" });
    });

    it("sends a password reset email", async () => {
        const req = { body: { email: " user@example.com " } }, res = createResponse();
        supabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null });

        await forgotPassword(req, res);

        expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith("user@example.com", {
            redirectTo: "http://localhost:5173/reset-password",
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "If that email is registered, a reset link has been sent." });
    });

    it("returns 429 when recovery is rate limited", async () => {
        const req = { body: { email: "user@example.com" } }, res = createResponse();
        supabase.auth.resetPasswordForEmail.mockResolvedValue({
            error: { code: "over_email_send_rate_limit" },
        });

        await forgotPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(429);
        expect(res.json).toHaveBeenCalledWith({
            error: "Too many reset requests. Please wait a few minutes before trying again.",
        });
    });

    it("returns 500 for an unexpected recovery error", async () => {
        const req = { body: { email: "user@example.com" } }, res = createResponse();
        supabase.auth.resetPasswordForEmail.mockResolvedValue({ error: new Error("Failure") });

        await forgotPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: "Unable to send a reset link right now. Please try again later.",
        });
    });
});

describe("resetPassword", () => {
    it("requires recovery tokens and a password", async () => {
        const req = { body: {} }, res = createResponse();

        await resetPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "access_token, refresh_token, and password are required" });
    });

    it("rejects an invalid password", async () => {
        const req = {
            body: { access_token: "access-token", refresh_token: "refresh-token", password: "short" },
        };
        const res = createResponse();

        await resetPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("resets the password", async () => {
        const requestClient = {
            auth: {
                setSession: vi.fn().mockResolvedValue({ error: null }),
                updateUser: vi.fn().mockResolvedValue({ error: null }),
            },
        };

        createClient.mockReturnValue(requestClient);

        const req = {
            body: {
                access_token: "access-token",
                refresh_token: "refresh-token",
                password: "NewPassword1!",
            },
        };
        const res = createResponse();

        await resetPassword(req, res);

        expect(requestClient.auth.setSession).toHaveBeenCalledWith({
            access_token: "access-token",
            refresh_token: "refresh-token",
        });
        expect(requestClient.auth.updateUser).toHaveBeenCalledWith({ password: "NewPassword1!" });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Password reset successfully" });
    });

    it("returns 400 for an invalid or expired recovery session", async () => {
        const requestClient = {
            auth: {
                setSession: vi.fn().mockResolvedValue({ error: new Error("Invalid session") }),
                updateUser: vi.fn(),
            },
        };

        createClient.mockReturnValue(requestClient);

        const req = {
            body: {
                access_token: "invalid",
                refresh_token: "invalid",
                password: "NewPassword1!",
            },
        };
        const res = createResponse();

        await resetPassword(req, res);

        expect(requestClient.auth.updateUser).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid or expired reset link" });
    });
});