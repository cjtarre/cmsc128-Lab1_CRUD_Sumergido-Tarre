// @vitest-environment jsdom

import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useContext } from "react";

import { AuthContext, AuthProvider } from "../src/features/auth/context/AuthContext";
import { authService } from "../src/features/auth/services/authService";

vi.mock("../src/features/auth/services/authService", () => ({
    authService: {
        login: vi.fn(),
        signup: vi.fn(),
        getCurrentUser: vi.fn(),
        updateProfile: vi.fn(),
        updateEmail: vi.fn(),
        updatePassword: vi.fn(),
        logout: vi.fn(),
    },
}));

let authContext;

function TestConsumer() {
    // eslint-disable-next-line react-hooks/globals
    authContext = useContext(AuthContext);

    return (
        <div>
            <span data-testid="loading">
                {authContext.authLoading ? "loading" : "ready"}
            </span>

            <span data-testid="authenticated">
                {authContext.isAuthenticated ? "yes" : "no"}
            </span>

            <span data-testid="user">
                {authContext.user?.email || "none"}
            </span>
        </div>
    );
}

describe("AuthProvider", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        authContext = null;
    });

    afterEach(() => {
        cleanup();
    });

    it("starts unauthenticated when no access token exists", async () => {
        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId("loading").textContent).toBe("ready");
        });

        expect(screen.getByTestId("authenticated").textContent).toBe("no");
        expect(screen.getByTestId("user").textContent).toBe("none");
        expect(authService.getCurrentUser).not.toHaveBeenCalled();
    });

    it("restores the authenticated user when a valid session exists", async () => {
        localStorage.setItem("accessToken", "access-token");

        authService.getCurrentUser.mockResolvedValue({
            user: {
                id: "user-1",
                email: "user@example.com",
            },
        });

        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId("authenticated").textContent).toBe("yes");
        });

        expect(authService.getCurrentUser).toHaveBeenCalledOnce();
        expect(screen.getByTestId("user").textContent).toBe("user@example.com");
    });

    it("clears stored tokens when session restoration fails", async () => {
        localStorage.setItem("accessToken", "invalid-token");
        localStorage.setItem("refreshToken", "refresh-token");

        authService.getCurrentUser.mockRejectedValue(
            new Error("Invalid session")
        );

        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId("loading").textContent).toBe("ready");
        });

        expect(localStorage.getItem("accessToken")).toBeNull();
        expect(localStorage.getItem("refreshToken")).toBeNull();
        expect(screen.getByTestId("authenticated").textContent).toBe("no");
    });

    it("logs in and stores the session tokens", async () => {
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

        authService.login.mockResolvedValue(response);

        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId("loading").textContent).toBe("ready");
        });

        await act(async () => {
            await authContext.login(
                "user@example.com",
                "password123"
            );
        });

        expect(authService.login).toHaveBeenCalledWith(
            "user@example.com",
            "password123"
        );

        expect(localStorage.getItem("accessToken")).toBe("access-token");
        expect(localStorage.getItem("refreshToken")).toBe("refresh-token");
        expect(screen.getByTestId("authenticated").textContent).toBe("yes");
        expect(screen.getByTestId("user").textContent).toBe("user@example.com");
    });

    it("logs out and clears the authenticated user", async () => {
        localStorage.setItem("refreshToken", "refresh-token");

        authService.logout.mockResolvedValue({
            message: "Logged out successfully.",
        });

        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId("loading").textContent).toBe("ready");
        });

        await act(async () => {
            await authContext.logout();
        });

        expect(authService.logout).toHaveBeenCalledWith("refresh-token");
        expect(localStorage.getItem("accessToken")).toBeNull();
        expect(localStorage.getItem("refreshToken")).toBeNull();
        expect(screen.getByTestId("authenticated").textContent).toBe("no");
    });

    it("clears stored tokens even when backend logout fails", async () => {
        localStorage.setItem("accessToken", "access-token");
        localStorage.setItem("refreshToken", "refresh-token");

        authService.getCurrentUser.mockResolvedValue({
            user: {
                id: "user-1",
                email: "user@example.com",
            },
        });

        authService.logout.mockRejectedValue(
            new Error("Logout failed")
        );

        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId("authenticated").textContent).toBe("yes");
        });

        await expect(
            authContext.logout()
        ).rejects.toThrow("Logout failed");

        expect(authService.logout).toHaveBeenCalledWith(
            "refresh-token"
        );

        expect(localStorage.getItem("accessToken")).toBeNull();
        expect(localStorage.getItem("refreshToken")).toBeNull();
    });

    it("updates the user after a profile update", async () => {
        const updatedUser = {
            id: "user-1",
            email: "user@example.com",
            user_metadata: {
                username: "Updated User",
            },
        };

        authService.updateProfile.mockResolvedValue({
            user: updatedUser,
        });

        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId("loading").textContent).toBe("ready");
        });

        await act(async () => {
            await authContext.updateProfile("Updated User");
        });

        expect(authService.updateProfile).toHaveBeenCalledWith(
            "Updated User"
        );

        expect(authContext.user).toEqual(updatedUser);
        expect(authContext.isAuthenticated).toBe(true);
    });
});