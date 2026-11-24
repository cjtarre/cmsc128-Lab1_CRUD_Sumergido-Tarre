import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { validateSignup } from "../../src/shared/utils/validation";
import { authService } from "../../src/features/auth/services/authService";
import {
    handleSignup,
    handleLogin,
    handleForgotPassword,
} from "../../src/features/auth/handlers/authHandlers";

vi.mock("sonner", () => ({
    toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("../../src/shared/utils/validation", () => ({
    validateSignup: vi.fn(),
}));

vi.mock("../../src/features/auth/services/authService", () => ({
    authService: { forgotPassword: vi.fn() },
}));

describe("authHandlers", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        validateSignup.mockReturnValue({});
    });

    it("rejects invalid signup data before submitting", async () => {
        validateSignup.mockReturnValue({ email: "Invalid email" });

        const signup = vi.fn();
        const setErrors = vi.fn();

        const result = await handleSignup({
            event: { preventDefault: vi.fn() },
            displayName: "Christie",
            username: "christie",
            email: "bad",
            password: "Password1!",
            confirmPassword: "Password1!",
            signup,
            navigate: vi.fn(),
            setErrors,
            setError: vi.fn(),
            setLoading: vi.fn(),
            clearSignupDraft: vi.fn(),
        });

        expect(result).toBe(false);
        expect(setErrors).toHaveBeenCalledWith({ email: "Invalid email" });
        expect(signup).not.toHaveBeenCalled();
    });

    it("submits normalized signup data and redirects to login", async () => {
        const signup = vi.fn().mockResolvedValue({});
        const navigate = vi.fn();
        const clearSignupDraft = vi.fn();
        const setLoading = vi.fn();

        const result = await handleSignup({
            event: { preventDefault: vi.fn() },
            displayName: " Christie Tarre ",
            username: " Christie ",
            email: " christie@example.com ",
            password: "Password1!",
            confirmPassword: "Password1!",
            signup,
            navigate,
            setErrors: vi.fn(),
            setError: vi.fn(),
            setLoading,
            clearSignupDraft,
        });

        expect(result).toBe(true);
        expect(signup).toHaveBeenCalledWith(
            "christie@example.com",
            "Password1!",
            "christie",
            "Christie Tarre"
        );
        expect(clearSignupDraft).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith("Account created successfully!");
        expect(navigate).toHaveBeenCalledWith("/login", {
            state: { accountCreated: true, email: "christie@example.com" },
        });
        expect(setLoading).toHaveBeenLastCalledWith(false);
    });

    it.each([
        ["Rate limit exceeded", "Too many verification emails were requested. Please try again later."],
        ["Username already taken", "Username already taken"],
        ["Email already registered", "An account with this email already exists. Try signing in instead."],
        ["", "Unable to create account."],
    ])("maps signup error %s", async (message, expected) => {
        const setError = vi.fn();

        await handleSignup({
            event: { preventDefault: vi.fn() },
            displayName: "Christie",
            username: "christie",
            email: "christie@example.com",
            password: "Password1!",
            confirmPassword: "Password1!",
            signup: vi.fn().mockRejectedValue({ response: { data: { error: message } } }),
            navigate: vi.fn(),
            setErrors: vi.fn(),
            setError,
            setLoading: vi.fn(),
            clearSignupDraft: vi.fn(),
        });

        expect(setError).toHaveBeenLastCalledWith(expected);
    });

    it("logs in with a trimmed identifier", async () => {
        const login = vi.fn().mockResolvedValue({});
        const navigate = vi.fn();

        const result = await handleLogin({
            event: { preventDefault: vi.fn() },
            identifier: " christie ",
            password: "secret",
            login,
            navigate,
            setError: vi.fn(),
            setLoading: vi.fn(),
        });

        expect(result).toBe(true);
        expect(login).toHaveBeenCalledWith("christie", "secret");
        expect(navigate).toHaveBeenCalledWith("/my-tasks", { replace: true });
    });

    it("shows the email confirmation login message", async () => {
        const setError = vi.fn();

        const result = await handleLogin({
            event: { preventDefault: vi.fn() },
            identifier: "christie",
            password: "secret",
            login: vi.fn().mockRejectedValue({
                response: { data: { error: "Email not confirmed" } },
            }),
            navigate: vi.fn(),
            setError,
            setLoading: vi.fn(),
        });

        expect(result).toBe(false);
        expect(setError).toHaveBeenLastCalledWith("Please verify your email before signing in.");
    });

    it("uses the fallback login error", async () => {
        const setError = vi.fn();

        await handleLogin({
            event: { preventDefault: vi.fn() },
            identifier: "christie",
            password: "wrong",
            login: vi.fn().mockRejectedValue(new Error("failed")),
            navigate: vi.fn(),
            setError,
            setLoading: vi.fn(),
        });

        expect(setError).toHaveBeenLastCalledWith("Invalid username/email or password.");
    });

    it("rejects an empty password-recovery email", async () => {
        const result = await handleForgotPassword({
            event: { preventDefault: vi.fn() },
            email: "   ",
            setLoading: vi.fn(),
            setSent: vi.fn(),
        });

        expect(result).toBe(false);
        expect(authService.forgotPassword).not.toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalledWith("Email address is required.");
    });

    it("requests a password reset with the trimmed email", async () => {
        authService.forgotPassword.mockResolvedValue({ message: "Reset sent." });
        const setSent = vi.fn();

        const result = await handleForgotPassword({
            event: { preventDefault: vi.fn() },
            email: " christie@example.com ",
            setLoading: vi.fn(),
            setSent,
        });

        expect(result).toBe(true);
        expect(authService.forgotPassword).toHaveBeenCalledWith("christie@example.com");
        expect(setSent).toHaveBeenCalledWith(true);
        expect(toast.success).toHaveBeenCalledWith("Reset sent.");
    });

    it("handles password recovery failure", async () => {
        authService.forgotPassword.mockRejectedValue({
            response: { data: { error: "Try again later" } },
        });

        const result = await handleForgotPassword({
            event: { preventDefault: vi.fn() },
            email: "christie@example.com",
            setLoading: vi.fn(),
            setSent: vi.fn(),
        });

        expect(result).toBe(false);
        expect(toast.error).toHaveBeenCalledWith("Try again later");
    });
});
