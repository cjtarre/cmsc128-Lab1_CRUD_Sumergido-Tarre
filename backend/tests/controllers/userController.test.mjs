import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const mock = require("mock-require");

const supabaseAdmin = { from: vi.fn() };
const createClient = vi.fn();

mock(path.resolve("config/supabaseAdmin.js"), supabaseAdmin);
mock(path.resolve("config/supabaseClient.js"), {
    supabaseUrl: "http://localhost:54321",
    supabaseKey: "test-key",
});
mock("@supabase/supabase-js", { createClient });

const { updateProfile, updateEmail, updatePassword } =
    require("../../controllers/userController.js");

const createResponse = () => ({ status: vi.fn().mockReturnThis(), json: vi.fn() });

const mockProfileUpdate = ({ data = null, error = null } = {}) => {
    const query = { update: vi.fn(), eq: vi.fn(), select: vi.fn(), single: vi.fn() };
    query.update.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.select.mockReturnValue(query);
    query.single.mockResolvedValue({ data, error });
    supabaseAdmin.from.mockReturnValue(query);
    return query;
};

const mockUserClient = ({ setSessionError = null, updateData = {}, updateError = null } = {}) => {
    const client = {
        auth: {
            setSession: vi.fn().mockResolvedValue({ error: setSessionError }),
            updateUser: vi.fn().mockResolvedValue({ data: updateData, error: updateError }),
        },
    };

    createClient.mockReturnValue(client);
    return client;
};

beforeEach(() => vi.clearAllMocks());

describe("updateProfile", () => {
    const user = { id: "user-1", email: "user@example.com" };

    it("rejects an empty update", async () => {
        const req = { user, body: {} }, res = createResponse();
        await updateProfile(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Nothing to update" });
    });

    it("requires a display name", async () => {
        const req = { user, body: { display_name: " " } }, res = createResponse();
        await updateProfile(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Display name is required" });
    });

    it("rejects a display name over 50 characters", async () => {
        const req = { user, body: { display_name: "a".repeat(51) } }, res = createResponse();
        await updateProfile(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Display name must be 50 characters or fewer" });
    });

    it("rejects an invalid username", async () => {
        const req = { user, body: { username: "ab" } }, res = createResponse();
        await updateProfile(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Username must be at least 3 characters" });
    });

    it("updates display name and username", async () => {
        const req = { user, body: { display_name: "  Updated User  ", username: "  Updated.User  " } };
        const res = createResponse();
        const query = mockProfileUpdate({
            data: { user_id: "user-1", username: "updated.user", display_name: "Updated User" },
        });

        await updateProfile(req, res);

        expect(supabaseAdmin.from).toHaveBeenCalledWith("profiles");
        expect(query.update).toHaveBeenCalledWith({ display_name: "Updated User", username: "updated.user" });
        expect(query.eq).toHaveBeenCalledWith("user_id", "user-1");
        expect(query.select).toHaveBeenCalledWith("user_id, username, display_name");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Profile updated successfully",
            user: { id: "user-1", email: "user@example.com", username: "updated.user", display_name: "Updated User" },
        });
    });

    it("updates only the display name", async () => {
        const req = { user, body: { display_name: "Updated User" } }, res = createResponse();
        const query = mockProfileUpdate({
            data: { user_id: "user-1", username: "test.user", display_name: "Updated User" },
        });

        await updateProfile(req, res);

        expect(query.update).toHaveBeenCalledWith({ display_name: "Updated User" });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("updates only the username", async () => {
        const req = { user, body: { username: "Updated.User" } }, res = createResponse();
        const query = mockProfileUpdate({
            data: { user_id: "user-1", username: "updated.user", display_name: "Test User" },
        });

        await updateProfile(req, res);

        expect(query.update).toHaveBeenCalledWith({ username: "updated.user" });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("rejects a duplicate username", async () => {
        const req = { user, body: { username: "existing.user" } }, res = createResponse();
        mockProfileUpdate({ error: { code: "23505" } });

        await updateProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({ error: "That username is already taken" });
    });

    it("returns 500 when profile update fails", async () => {
        const req = { user, body: { display_name: "Updated User" } }, res = createResponse();
        mockProfileUpdate({ error: new Error("Database error") });

        await updateProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
});

describe("updateEmail", () => {
    const baseReq = {
        user: { id: "user-1", email: "user@example.com" },
        headers: { authorization: "Bearer access-token" },
    };

    it("requires an email", async () => {
        const req = { ...baseReq, body: { email: "", refresh_token: "refresh-token" } }, res = createResponse();
        await updateEmail(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Email is required" });
    });

    it("rejects an invalid email", async () => {
        const req = { ...baseReq, body: { email: "invalid-email", refresh_token: "refresh-token" } }, res = createResponse();
        await updateEmail(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Please enter a valid email address" });
    });

    it("requires access and refresh tokens", async () => {
        const req = { ...baseReq, headers: {}, body: { email: "new@example.com" } }, res = createResponse();
        await updateEmail(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Missing access_token or refresh_token" });
    });

    it("updates the email", async () => {
        const updatedUser = { id: "user-1", email: "new@example.com" };
        const client = mockUserClient({ updateData: { user: updatedUser } });
        const req = { ...baseReq, body: { email: " new@example.com ", refresh_token: "refresh-token" } };
        const res = createResponse();

        await updateEmail(req, res);

        expect(client.auth.setSession).toHaveBeenCalledWith({ access_token: "access-token", refresh_token: "refresh-token" });
        expect(client.auth.updateUser).toHaveBeenCalledWith({ email: "new@example.com" });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Confirmation email sent — check your new inbox to complete the change.",
            user: updatedUser,
        });
    });

    it("returns 500 when setting the session fails", async () => {
        mockUserClient({ setSessionError: new Error("Invalid session") });
        const req = { ...baseReq, body: { email: "new@example.com", refresh_token: "refresh-token" } };
        const res = createResponse();

        await updateEmail(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });

    it("returns 500 when email update fails", async () => {
        mockUserClient({ updateError: new Error("Update failed") });
        const req = { ...baseReq, body: { email: "new@example.com", refresh_token: "refresh-token" } };
        const res = createResponse();

        await updateEmail(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
});

describe("updatePassword", () => {
    const baseReq = {
        user: { id: "user-1", email: "user@example.com" },
        headers: { authorization: "Bearer access-token" },
    };

    it("requires a password", async () => {
        const req = { ...baseReq, body: { password: "", refresh_token: "refresh-token" } }, res = createResponse();
        await updatePassword(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Password is required" });
    });

    it("rejects a weak password", async () => {
        const req = { ...baseReq, body: { password: "Ab1!", refresh_token: "refresh-token" } }, res = createResponse();
        await updatePassword(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Password must be at least 8 characters" });
    });

    it("requires access and refresh tokens", async () => {
        const req = { ...baseReq, headers: {}, body: { password: "Password1!" } }, res = createResponse();
        await updatePassword(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Missing access_token or refresh_token" });
    });

    it("updates the password", async () => {
        const client = mockUserClient();
        const req = { ...baseReq, body: { password: "NewPassword1!", refresh_token: "refresh-token" } };
        const res = createResponse();

        await updatePassword(req, res);

        expect(client.auth.setSession).toHaveBeenCalledWith({ access_token: "access-token", refresh_token: "refresh-token" });
        expect(client.auth.updateUser).toHaveBeenCalledWith({ password: "NewPassword1!" });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Password updated successfully" });
    });

    it("returns 500 when password update fails", async () => {
        mockUserClient({ updateError: new Error("Update failed") });
        const req = { ...baseReq, body: { password: "NewPassword1!", refresh_token: "refresh-token" } };
        const res = createResponse();

        await updatePassword(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
});