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
    refreshUser: vi.fn(),
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

    it("shows a pending notice without replacing the current confirmed email", async () => {
        auth.updateEmail.mockResolvedValue({ message: "Confirmation requested" });
        render(<Profile />);
        fireEvent.click(screen.getByRole("button", { name: /account information/i }));
        fireEvent.change(screen.getByLabelText("Email address"), {
            target: { value: "new@example.com" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

        await waitFor(() => {
            expect(screen.getByRole("status", { name: "Pending email change" })).toBeTruthy();
        });
        expect(auth.updateEmail).toHaveBeenCalledWith("new@example.com");
        expect(localStorage.getItem("takda-pending-email:user-1")).toBe("new@example.com");
        expect(screen.getByLabelText("Email address").value).toBe("user@example.com");
    });

    it("keeps pending status until the server confirms the new email", async () => {
        localStorage.setItem("takda-pending-email:user-1", "new@example.com");
        auth.refreshUser.mockResolvedValueOnce({ ...auth.user, email: "user@example.com" })
            .mockResolvedValueOnce({ ...auth.user, email: "new@example.com" });
        render(<Profile />);

        await screen.findByRole("status", { name: "Pending email change" });
        fireEvent.click(screen.getByRole("button", { name: "Check confirmation status" }));
        await waitFor(() => {
            expect(auth.refreshUser).toHaveBeenCalledTimes(1);
            expect(screen.getByRole("button", { name: "Check confirmation status" }).disabled).toBe(false);
        });
        expect(localStorage.getItem("takda-pending-email:user-1")).toBe("new@example.com");

        fireEvent.click(screen.getByRole("button", { name: "Check confirmation status" }));
        await waitFor(() => expect(localStorage.getItem("takda-pending-email:user-1")).toBeNull());
        expect(screen.queryByRole("status", { name: "Pending email change" })).toBeNull();
    });

    it("uses a compact status button and can dismiss a stale notice without cancelling the request", async () => {
        localStorage.setItem("takda-pending-email:user-1", "new@example.com");
        render(<Profile />);
        await screen.findByRole("status", { name: "Pending email change" });

        const checkButton = screen.getByRole("button", { name: "Check confirmation status" });
        expect(checkButton.style.fontSize).toBe("11px");
        expect(checkButton.style.padding).toBe("5px 9px");

        fireEvent.click(screen.getByRole("button", { name: "Dismiss notice" }));
        expect(screen.queryByRole("status", { name: "Pending email change" })).toBeNull();
        expect(localStorage.getItem("takda-pending-email:user-1")).toBeNull();
        expect(auth.updateEmail).not.toHaveBeenCalled();
    });

    it("refreshes the confirmed email when returning to the browser tab", async () => {
        localStorage.setItem("takda-pending-email:user-1", "new@example.com");
        auth.refreshUser.mockResolvedValue({ ...auth.user, email: "new@example.com" });
        render(<Profile />);
        await screen.findByRole("status", { name: "Pending email change" });

        fireEvent.focus(window);
        await waitFor(() => expect(localStorage.getItem("takda-pending-email:user-1")).toBeNull());
        expect(screen.queryByRole("status", { name: "Pending email change" })).toBeNull();
    });

    it("persists the companion preference for the current user", () => {
        render(<Profile />);

        fireEvent.click(screen.getByRole("button", { name: /preferences/i }));
        fireEvent.click(screen.getByRole("switch", { name: /companion/i }));

        expect(localStorage.getItem("takda-companion-enabled:user-1")).toBe("false");
    });
});