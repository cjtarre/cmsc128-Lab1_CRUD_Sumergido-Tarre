import { toast } from "sonner";

import { validateSignup } from "../../../shared/utils/validation";

// Validate and submit account registration.
export async function handleSignup({
    event,
    displayName,
    username,
    email,
    password,
    confirmPassword,
    signup,
    navigate,
    setErrors,
    setError,
    setLoading,
    clearSignupDraft,
}) {
    event.preventDefault();
    setError("");

    const validationErrors = validateSignup({
        displayName,
        username,
        email,
        password,
        confirmPassword,
    });

    if (Object.keys(validationErrors).length) {
        setErrors(validationErrors);
        return false;
    }

    setErrors({});
    setLoading(true);

    try {
        await signup(
            email.trim(),
            password,
            username.trim().toLowerCase(),
            displayName.trim()
        );

        clearSignupDraft();
        toast.success("Account created successfully!");

        navigate("/login", {
            state: {
                accountCreated: true,
                email: email.trim(),
            },
        });

        return true;
    } catch (error) {
        const message = error.response?.data?.error || "";
        const normalizedMessage = message.toLowerCase();

        if (normalizedMessage.includes("rate limit")) {
            setError(
                "Too many verification emails were requested. Please try again later."
            );
        } else if (normalizedMessage.includes("username")) {
            setError(message);
        } else if (normalizedMessage.includes("already")) {
            setError(
                "An account with this email already exists. Try signing in instead."
            );
        } else {
            setError(message || "Unable to create account.");
        }

        return false;
    } finally {
        setLoading(false);
    }
}

// Authenticate the user and redirect to My Tasks.
export async function handleLogin({
    event,
    identifier,
    password,
    login,
    navigate,
    setError,
    setLoading,
}) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
        await login(identifier.trim(), password);

        toast.success("Welcome back! You’re signed in.");
        navigate("/my-tasks", { replace: true });

        return true;
    } catch (error) {
        const message = error.response?.data?.error || "";

        setError(
            message.toLowerCase().includes("email not confirmed")
                ? "Please verify your email before signing in."
                : message || "Invalid username/email or password."
        );

        return false;
    } finally {
        setLoading(false);
    }
}

import { authService } from "../services/authService";

// Request a password recovery email.
export async function handleForgotPassword({
    event,
    email,
    setLoading,
    setSent,
}) {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
        toast.error("Email address is required.");
        return false;
    }

    setLoading(true);

    try {
        const data = await authService.forgotPassword(trimmedEmail);

        setSent(true);
        toast.success(
            data.message ||
            "If that email is registered, a reset link has been sent."
        );

        return true;
    } catch (error) {
        toast.error(
            error.response?.data?.error ||
            "Unable to request a password reset."
        );

        return false;
    } finally {
        setLoading(false);
    }
}