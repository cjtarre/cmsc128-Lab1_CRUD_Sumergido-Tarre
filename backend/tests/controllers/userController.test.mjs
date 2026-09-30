import { beforeEach, describe, expect, it, vi } from "vitest";

const supabaseAdmin =
    (await import("../../config/supabaseAdmin.js")).default;

const {
    updateProfile,
    updateEmail,
    updatePassword,
} = await import("../../controllers/userController.js");

const createResponse = () => ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
});

const createUser = () => ({
    id: "test-user-id",
    email: "user@example.com",
    user_metadata: {
        username: "Christie",
        display_name: "Christie",
        existing_field: "preserved",
    },
});

beforeEach(() => {
    vi.clearAllMocks();

    supabaseAdmin.auth.admin.updateUserById = vi.fn();
});

describe("updateProfile", () => {
    it("should return 400 when there is nothing to update", async () => {
        const req = {
            user: createUser(),
            body: {},
        };

        const res = createResponse();

        await updateProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Nothing to update",
        });

        expect(
            supabaseAdmin.auth.admin.updateUserById
        ).not.toHaveBeenCalled();
    });

    it("should reject a blank display name", async () => {
        const req = {
            user: createUser(),
            body: {
                display_name: "   ",
            },
        };

        const res = createResponse();

        await updateProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Display name is required",
        });
    });

    it("should reject a display name longer than 50 characters", async () => {
        const req = {
            user: createUser(),
            body: {
                display_name: "a".repeat(51),
            },
        };

        const res = createResponse();

        await updateProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Display name must be 50 characters or fewer",
        });
    });

    it("should trim and update the display name", async () => {
        const req = {
            user: createUser(),
            body: {
                display_name: "  Christie Jude  ",
            },
        };

        const res = createResponse();

        const updatedUser = {
            ...req.user,
            user_metadata: {
                ...req.user.user_metadata,
                display_name: "Christie Jude",
            },
        };

        supabaseAdmin.auth.admin.updateUserById.mockResolvedValue({
            data: {
                user: updatedUser,
            },
            error: null,
        });

        await updateProfile(req, res);

        expect(
            supabaseAdmin.auth.admin.updateUserById
        ).toHaveBeenCalledWith(
            "test-user-id",
            {
                user_metadata: {
                    username: "Christie",
                    display_name: "Christie Jude",
                    existing_field: "preserved",
                },
            }
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Profile updated successfully",
            user: updatedUser,
        });
    });

    it("should reject a blank username", async () => {
        const req = {
            user: createUser(),
            body: {
                username: "   ",
            },
        };

        const res = createResponse();

        await updateProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Username is required",
        });
    });

    it("should reject a username longer than 50 characters", async () => {
        const req = {
            user: createUser(),
            body: {
                username: "a".repeat(51),
            },
        };

        const res = createResponse();

        await updateProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Username must be 50 characters or fewer",
        });
    });

    it("should trim and update the username", async () => {
        const req = {
            user: createUser(),
            body: {
                username: "  NewUsername  ",
            },
        };

        const res = createResponse();

        const updatedUser = {
            ...req.user,
            user_metadata: {
                ...req.user.user_metadata,
                username: "NewUsername",
            },
        };

        supabaseAdmin.auth.admin.updateUserById.mockResolvedValue({
            data: {
                user: updatedUser,
            },
            error: null,
        });

        await updateProfile(req, res);

        expect(
            supabaseAdmin.auth.admin.updateUserById
        ).toHaveBeenCalledWith(
            "test-user-id",
            {
                user_metadata: {
                    username: "NewUsername",
                    display_name: "Christie",
                    existing_field: "preserved",
                },
            }
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Profile updated successfully",
            user: updatedUser,
        });
    });

    it("should update both display name and username together", async () => {
        const req = {
            user: createUser(),
            body: {
                display_name: "  Christie Tarre  ",
                username: "  cjtarre  ",
            },
        };

        const res = createResponse();

        const updatedUser = {
            ...req.user,
            user_metadata: {
                ...req.user.user_metadata,
                display_name: "Christie Tarre",
                username: "cjtarre",
            },
        };

        supabaseAdmin.auth.admin.updateUserById.mockResolvedValue({
            data: {
                user: updatedUser,
            },
            error: null,
        });

        await updateProfile(req, res);

        expect(
            supabaseAdmin.auth.admin.updateUserById
        ).toHaveBeenCalledWith(
            "test-user-id",
            {
                user_metadata: {
                    username: "cjtarre",
                    display_name: "Christie Tarre",
                    existing_field: "preserved",
                },
            }
        );

        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should preserve existing user metadata", async () => {
        const req = {
            user: createUser(),
            body: {
                display_name: "Updated Name",
            },
        };

        const res = createResponse();

        supabaseAdmin.auth.admin.updateUserById.mockResolvedValue({
            data: {
                user: req.user,
            },
            error: null,
        });

        await updateProfile(req, res);

        expect(
            supabaseAdmin.auth.admin.updateUserById
        ).toHaveBeenCalledWith(
            "test-user-id",
            {
                user_metadata: expect.objectContaining({
                    username: "Christie",
                    display_name: "Updated Name",
                    existing_field: "preserved",
                }),
            }
        );
    });

    it("should return 500 when Supabase fails to update the profile", async () => {
        const req = {
            user: createUser(),
            body: {
                display_name: "Updated Name",
            },
        };

        const res = createResponse();

        supabaseAdmin.auth.admin.updateUserById.mockResolvedValue({
            data: null,
            error: new Error("Database error"),
        });

        await updateProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: "Internal Server Error",
        });
    });
});

describe("updateEmail", () => {
    it("should return 400 when email is missing", async () => {
        const req = {
            user: createUser(),
            headers: {},
            body: {
                email: "",
            },
        };

        const res = createResponse();

        await updateEmail(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Email is required",
        });
    });

    it("should reject an invalid email address", async () => {
        const req = {
            user: createUser(),
            headers: {},
            body: {
                email: "invalid-email",
            },
        };

        const res = createResponse();

        await updateEmail(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Please enter a valid email address",
        });
    });

    it("should reject a request without access and refresh tokens", async () => {
        const req = {
            user: createUser(),
            headers: {},
            body: {
                email: "new@example.com",
            },
        };

        const res = createResponse();

        await updateEmail(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Missing access_token or refresh_token",
        });
    });
});

describe("updatePassword", () => {
    it("should return 400 when the password is missing", async () => {
        const req = {
            body: {},
            headers: {},
        };

        const res = createResponse();

        await updatePassword(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Password is required",
        });
    });

    it("should reject a password shorter than 8 characters", async () => {
        const req = {
            body: {
                password: "Ab1!",
            },
            headers: {},
        };

        const res = createResponse();

        await updatePassword(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Password must be at least 8 characters",
        });
    });

    it("should reject a request without access and refresh tokens", async () => {
        const req = {
            body: {
                password: "Secret123!",
            },
            headers: {},
        };

        const res = createResponse();

        await updatePassword(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Missing access_token or refresh_token",
        });
    });
});