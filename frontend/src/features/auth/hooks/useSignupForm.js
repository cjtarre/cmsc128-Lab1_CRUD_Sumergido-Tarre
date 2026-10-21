import { useEffect, useState } from "react";

export function useSignupForm() {
    const [displayName, setDisplayName] = useState(() => sessionStorage.getItem("signupDisplayName") || "");
    const [username, setUsername] = useState(() => sessionStorage.getItem("signupUsername") || "");
    const [email, setEmail] = useState(() => sessionStorage.getItem("signupEmail") || "");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

    // Preserve only non-sensitive signup progress.
    useEffect(() => {
        sessionStorage.setItem("signupDisplayName", displayName);
        sessionStorage.setItem("signupUsername", username);
        sessionStorage.setItem("signupEmail", email);
    }, [displayName, username, email]);

    // Remove the preserved signup draft.
    const clearSignupDraft = () => {
        sessionStorage.removeItem("signupDisplayName");
        sessionStorage.removeItem("signupUsername");
        sessionStorage.removeItem("signupEmail");
    };

    // Clear validation feedback when a field changes.
    const clearFieldError = (field) =>
        setErrors((current) => ({ ...current, [field]: undefined }));

    return {
        displayName, setDisplayName,
        username, setUsername,
        email, setEmail,
        password, setPassword,
        confirmPassword, setConfirmPassword,
        showPassword, setShowPassword,
        showConfirmPassword, setShowConfirmPassword,
        errors, setErrors,
        error, setError,
        loading, setLoading,
        passwordsMatch,
        clearSignupDraft,
        clearFieldError,
    };
}