import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    apiInstance: {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),

        interceptors: {
            request: {
                use: vi.fn(),
            },
            response: {
                use: vi.fn(),
            },
        },
    },
}));

vi.mock("axios", () => ({
    default: {
        create: vi.fn(() => mocks.apiInstance),
    },
}));

import { authService } from "../src/features/auth/services/authService";

describe("authService", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        globalThis.localStorage = {
            getItem: vi.fn(),
        };
    });

    it("signs up a user", async () => {
        const response = {
            user: {
                id: "user-1",
                email: "user@example.com",
            },
        };

        mocks.apiInstance.post.mockResolvedValue({
            data: response,
        });

        const result = await authService.signup(
            "user@example.com",
            "password123",
            "Test User"
        );

        expect(mocks.apiInstance.post).toHaveBeenCalledWith(
            "/api/auth/signup",
            {
                email: "user@example.com",
                password: "password123",
                username: "Test User",
            }
        );

        expect(result).toEqual(response);
    });

    it("logs in a user", async () => {
        const response = {
            user: {
                id: "user-1",
                email: "user@example.com",
            },
            session: {
                access_token: "access-token",
                refresh_token: "refresh-token",
            },
        };

        mocks.apiInstance.post.mockResolvedValue({
            data: response,
        });

        const result = await authService.login(
            "user@example.com",
            "password123"
        );

        expect(mocks.apiInstance.post).toHaveBeenCalledWith(
            "/api/auth/login",
            {
                email: "user@example.com",
                password: "password123",
            }
        );

        expect(result).toEqual(response);
    });

    it("gets the current authenticated user", async () => {
        const response = {
            user: {
                id: "user-1",
                email: "user@example.com",
            },
        };

        mocks.apiInstance.get.mockResolvedValue({
            data: response,
        });

        const result = await authService.getCurrentUser();

        expect(mocks.apiInstance.get).toHaveBeenCalledWith(
            "/api/auth/me"
        );

        expect(result).toEqual(response);
    });

    it("requests a password recovery email", async () => {
        const response = {
            message: "Password reset email sent.",
        };

        mocks.apiInstance.post.mockResolvedValue({
            data: response,
        });

        const result = await authService.forgotPassword(
            "user@example.com"
        );

        expect(mocks.apiInstance.post).toHaveBeenCalledWith(
            "/api/auth/forgot-password",
            {
                email: "user@example.com",
            }
        );

        expect(result).toEqual(response);
    });

    it("resets a password", async () => {
        const response = {
            message: "Password updated successfully.",
        };

        mocks.apiInstance.post.mockResolvedValue({
            data: response,
        });

        const result = await authService.resetPassword(
            "access-token",
            "refresh-token",
            "newpassword123"
        );

        expect(mocks.apiInstance.post).toHaveBeenCalledWith(
            "/api/auth/reset-password",
            {
                access_token: "access-token",
                refresh_token: "refresh-token",
                password: "newpassword123",
            }
        );

        expect(result).toEqual(response);
    });

    it("updates the user profile", async () => {
        const response = {
            user: {
                id: "user-1",
                user_metadata: {
                    username: "Updated User",
                },
            },
        };

        mocks.apiInstance.patch.mockResolvedValue({
            data: response,
        });

        const result = await authService.updateProfile(
            "Updated User"
        );

        expect(mocks.apiInstance.patch).toHaveBeenCalledWith(
            "/api/users/me",
            {
                username: "Updated User",
            }
        );

        expect(result).toEqual(response);
    });

    it("updates the email using the stored refresh token", async () => {
        localStorage.getItem.mockReturnValue("refresh-token");

        const response = {
            message: "Confirmation email sent.",
        };

        mocks.apiInstance.patch.mockResolvedValue({
            data: response,
        });

        const result = await authService.updateEmail(
            "new@example.com"
        );

        expect(localStorage.getItem).toHaveBeenCalledWith(
            "refreshToken"
        );

        expect(mocks.apiInstance.patch).toHaveBeenCalledWith(
            "/api/users/me/email",
            {
                email: "new@example.com",
                refresh_token: "refresh-token",
            }
        );

        expect(result).toEqual(response);
    });

    it("updates the password using the stored refresh token", async () => {
        localStorage.getItem.mockReturnValue("refresh-token");

        const response = {
            message: "Password updated successfully.",
        };

        mocks.apiInstance.patch.mockResolvedValue({
            data: response,
        });

        const result = await authService.updatePassword(
            "newpassword123"
        );

        expect(localStorage.getItem).toHaveBeenCalledWith(
            "refreshToken"
        );

        expect(mocks.apiInstance.patch).toHaveBeenCalledWith(
            "/api/users/me/password",
            {
                password: "newpassword123",
                refresh_token: "refresh-token",
            }
        );

        expect(result).toEqual(response);
    });

    it("logs out using the refresh token", async () => {
        const response = {
            message: "Logged out successfully.",
        };

        mocks.apiInstance.post.mockResolvedValue({
            data: response,
        });

        const result = await authService.logout(
            "refresh-token"
        );

        expect(mocks.apiInstance.post).toHaveBeenCalledWith(
            "/api/auth/logout",
            {
                refresh_token: "refresh-token",
            }
        );

        expect(result).toEqual(response);
    });
});