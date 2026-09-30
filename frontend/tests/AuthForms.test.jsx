// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import AuthPanel from "../src/features/auth/components/AuthPanel";
import { useAuth } from "../src/features/auth/hooks/useAuth";
import ForgotPassword from "../src/features/auth/pages/ForgotPassword";
import Login from "../src/features/auth/pages/Login";
import Signup from "../src/features/auth/pages/Signup";

vi.mock("../src/features/auth/hooks/useAuth", () => ({
    useAuth: vi.fn(),
}));

vi.mock("../src/features/auth/services/authService", () => ({
    authService: { forgotPassword: vi.fn() },
}));

vi.mock("../src/shared/components/effects/HoverText", () => ({
    default: ({ text }) => <span>{text}</span>,
}));

describe("Auth forms", () => {
    const signup = vi.fn();
    const login = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        sessionStorage.clear();
        useAuth.mockReturnValue({ signup, login });
    });

    afterEach(cleanup);

    it("restores non-sensitive signup progress from sessionStorage", () => {
        sessionStorage.setItem("signupDisplayName", "Christie Jude");
        sessionStorage.setItem("signupUsername", "christie.jude");
        sessionStorage.setItem("signupEmail", "signup@example.com");

        render(<MemoryRouter><Signup /></MemoryRouter>);

        expect(screen.getByLabelText("Display name").value).toBe("Christie Jude");
        expect(screen.getByLabelText("Username").value).toBe("christie.jude");
        expect(screen.getByLabelText("Email address").value).toBe("signup@example.com");
        expect(screen.getByLabelText("Password").value).toBe("");
        expect(screen.getByLabelText("Confirm password").value).toBe("");
    });

    it("preserves signup progress while typing", async () => {
        render(<MemoryRouter><Signup /></MemoryRouter>);

        fireEvent.change(screen.getByLabelText("Display name"), { target: { value: "Christie Jude" } });
        fireEvent.change(screen.getByLabelText("Username"), { target: { value: "christie.jude" } });
        fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "signup@example.com" } });

        await waitFor(() => {
            expect(sessionStorage.getItem("signupDisplayName")).toBe("Christie Jude");
            expect(sessionStorage.getItem("signupUsername")).toBe("christie.jude");
            expect(sessionStorage.getItem("signupEmail")).toBe("signup@example.com");
        });
    });

    it("preserves the login email when navigating to signup and back", () => {
        render(
            <MemoryRouter initialEntries={["/login"]}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                </Routes>
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText("Username or email"), { target: { value: "login@example.com" } });
        fireEvent.click(screen.getByText("Create one"));

        expect(screen.getByText("Create your account")).toBeTruthy();
        expect(screen.getByLabelText("Email address").value).toBe("");

        fireEvent.click(screen.getByText("Sign in"));

        expect(screen.getByText("Welcome back")).toBeTruthy();
        expect(screen.getByLabelText("Username or email").value).toBe("login@example.com");
    });

    it("restores the original login email after editing the recovery email", () => {
        render(
            <MemoryRouter initialEntries={[{
                pathname: "/forgot-password",
                state: { from: "login", email: "login@example.com", loginEmail: "login@example.com" },
            }]}>
                <Routes>
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/login" element={<Login />} />
                </Routes>
            </MemoryRouter>
        );

        const recoveryEmail = screen.getByLabelText("Email address");
        expect(recoveryEmail.value).toBe("login@example.com");

        fireEvent.change(recoveryEmail, { target: { value: "recovery@example.com" } });
        fireEvent.click(screen.getByLabelText("Back to login"));

        expect(screen.getByLabelText("Username or email").value).toBe("login@example.com");
    });

    it("clears the signup draft when the auth panel is closed", () => {
        sessionStorage.setItem("signupDisplayName", "Christie Jude");
        sessionStorage.setItem("signupUsername", "christie.jude");
        sessionStorage.setItem("signupEmail", "signup@example.com");

        const onClose = vi.fn();

        render(<MemoryRouter><AuthPanel isOpen onClose={onClose} /></MemoryRouter>);
        fireEvent.click(screen.getByLabelText("Close"));

        expect(sessionStorage.getItem("signupDisplayName")).toBeNull();
        expect(sessionStorage.getItem("signupUsername")).toBeNull();
        expect(sessionStorage.getItem("signupEmail")).toBeNull();
        expect(onClose).toHaveBeenCalledOnce();
    });
});