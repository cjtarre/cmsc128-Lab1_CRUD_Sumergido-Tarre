// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../src/routes/ProtectedRoute";
import { useAuth } from "../src/features/auth/hooks/useAuth";

vi.mock("../src/features/auth/hooks/useAuth", () => ({
    useAuth: vi.fn(),
}));

describe("ProtectedRoute", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it("renders protected content when the user is authenticated", () => {
        useAuth.mockReturnValue({
            isAuthenticated: true,
        });

        render(
            <MemoryRouter initialEntries={["/dashboard"]}>
                <Routes>
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <div>Protected content</div>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/login"
                        element={<div>Login page</div>}
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText("Protected content")).toBeTruthy();
        expect(screen.queryByText("Login page")).toBeNull();
    });

    it("redirects unauthenticated users to the login page", () => {
        useAuth.mockReturnValue({
            isAuthenticated: false,
        });

        render(
            <MemoryRouter initialEntries={["/dashboard"]}>
                <Routes>
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <div>Protected content</div>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/login"
                        element={<div>Login page</div>}
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText("Login page")).toBeTruthy();
        expect(screen.queryByText("Protected content")).toBeNull();
    });
});