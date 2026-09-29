// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, renderHook } from "@testing-library/react";
import { AuthContext } from "../src/features/auth/context/AuthContext";
import { useAuth } from "../src/features/auth/hooks/useAuth";

afterEach(() => {
    cleanup();
});

describe("useAuth", () => {
    it("returns the authentication context when used inside AuthProvider", () => {
        const mockAuthContext = {
            user: {
                id: "user-1",
                email: "user@example.com",
            },
            authLoading: false,
            isAuthenticated: true,
        };

        const wrapper = ({ children }) => (
            <AuthContext.Provider value={mockAuthContext}>
                {children}
            </AuthContext.Provider>
        );

        const { result } = renderHook(() => useAuth(), { wrapper });

        expect(result.current).toBe(mockAuthContext);
    });

    it("throws an error when used outside AuthProvider", () => {
        expect(() => {
            renderHook(() => useAuth());
        }).toThrow("useAuth must be used inside AuthProvider");
    });
});