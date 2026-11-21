// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Profile from "../../src/features/profile/pages/Profile";

const auth = {
    user: {
        id: "user-1",
        email: "user@example.com",
        username: "test.user",
        display_name: "Test User",
    },
    authLoading: false,
    logout: vi.fn(),
    updateProfile: vi.fn(),
    updateEmail: vi.fn(),
    updatePassword: vi.fn(),
};

const setTheme = vi.fn();

vi.mock("../../src/features/auth/hooks/useAuth", () => ({
    useAuth: () => auth,
}));

vi.mock("../../src/shared/context/ThemeContext", () => ({
    useTheme: () => ({ theme: "light", setTheme }),
}));

vi.mock("sonner", () => ({
    toast: {
        error: vi.fn(),
        info: vi.fn(),
        success: vi.fn(),
    },
}));

describe("Profile", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("renders the authenticated user's account summary", () => {
        render(<Profile />);

        expect(screen.getByRole("heading", { name: "Account" })).toBeTruthy();
        expect(screen.getByText("Test User")).toBeTruthy();
        expect(screen.getByText("@test.user")).toBeTruthy();
        expect(screen.getByText("user@example.com")).toBeTruthy();
    });

    it("updates the profile after editing account information", async () => {
        auth.updateProfile.mockResolvedValue({});

        render(<Profile />);
        fireEvent.click(screen.getByRole("button", { name: /account information/i }));

        fireEvent.change(screen.getByLabelText("Display name"), {
            target: { value: "Updated User" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

        await waitFor(() => {
            expect(auth.updateProfile).toHaveBeenCalledWith({
                display_name: "Updated User",
            });
        });
    });

    it("persists the companion preference for the current user", () => {
        render(<Profile />);

        fireEvent.click(screen.getByRole("button", { name: /preferences/i }));
        fireEvent.click(screen.getByRole("switch", { name: /companion/i }));

        expect(localStorage.getItem("takda-companion-enabled:user-1")).toBe("false");
    });
});