import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useSignupForm } from "../../src/features/auth/hooks/useSignupForm";
import { useLoginForm } from "../../src/features/auth/hooks/useLoginForm";
import { useForgotPasswordForm } from "../../src/features/auth/hooks/useForgotPasswordForm";

describe("auth form hooks", () => {
    beforeEach(() => sessionStorage.clear());

    describe("useSignupForm", () => {
        it("restores non-sensitive signup fields from session storage", () => {
            sessionStorage.setItem("signupDisplayName", "Christie");
            sessionStorage.setItem("signupUsername", "cjtarre");
            sessionStorage.setItem("signupEmail", "c@example.com");

            const { result } = renderHook(() => useSignupForm());

            expect(result.current.displayName).toBe("Christie");
            expect(result.current.username).toBe("cjtarre");
            expect(result.current.email).toBe("c@example.com");
            expect(result.current.password).toBe("");
            expect(result.current.confirmPassword).toBe("");
        });

        it("persists only non-sensitive signup progress", () => {
            const { result } = renderHook(() => useSignupForm());

            act(() => {
                result.current.setDisplayName("Christie");
                result.current.setUsername("cjtarre");
                result.current.setEmail("c@example.com");
                result.current.setPassword("secret");
            });

            expect(sessionStorage.getItem("signupDisplayName")).toBe("Christie");
            expect(sessionStorage.getItem("signupUsername")).toBe("cjtarre");
            expect(sessionStorage.getItem("signupEmail")).toBe("c@example.com");
            expect(sessionStorage.getItem("signupPassword")).toBeNull();
        });

        it("detects matching confirmation passwords", () => {
            const { result } = renderHook(() => useSignupForm());

            act(() => {
                result.current.setPassword("Password1!");
                result.current.setConfirmPassword("Password1!");
            });

            expect(result.current.passwordsMatch).toBe(true);

            act(() => result.current.setConfirmPassword("different"));
            expect(result.current.passwordsMatch).toBe(false);
        });

        it("clears one field error without removing the others", () => {
            const { result } = renderHook(() => useSignupForm());

            act(() => result.current.setErrors({
                email: "Bad email",
                username: "Bad username",
            }));

            act(() => result.current.clearFieldError("email"));

            expect(result.current.errors.email).toBeUndefined();
            expect(result.current.errors.username).toBe("Bad username");
        });

        it("clears the saved signup draft", () => {
            sessionStorage.setItem("signupDisplayName", "Christie");
            sessionStorage.setItem("signupUsername", "cjtarre");
            sessionStorage.setItem("signupEmail", "c@example.com");

            const { result } = renderHook(() => useSignupForm());

            act(() => result.current.clearSignupDraft());

            expect(sessionStorage.getItem("signupDisplayName")).toBeNull();
            expect(sessionStorage.getItem("signupUsername")).toBeNull();
            expect(sessionStorage.getItem("signupEmail")).toBeNull();
        });
    });

    describe("useLoginForm", () => {
        it("uses the provided initial identifier and manages form state", () => {
            const { result } = renderHook(() => useLoginForm("christie@example.com"));

            expect(result.current.identifier).toBe("christie@example.com");

            act(() => {
                result.current.setPassword("secret");
                result.current.setShowPassword(true);
                result.current.setError("error");
                result.current.setLoading(true);
            });

            expect(result.current.password).toBe("secret");
            expect(result.current.showPassword).toBe(true);
            expect(result.current.error).toBe("error");
            expect(result.current.loading).toBe(true);
        });
    });

    describe("useForgotPasswordForm", () => {
        it("uses the initial email and manages sent/loading state", () => {
            const { result } = renderHook(() => useForgotPasswordForm("c@example.com"));

            expect(result.current.email).toBe("c@example.com");

            act(() => {
                result.current.setLoading(true);
                result.current.setSent(true);
            });

            expect(result.current.loading).toBe(true);
            expect(result.current.sent).toBe(true);
        });
    });
});
