import { useState } from "react";

// Manage login form state and UI behavior.
export function useLoginForm(initialIdentifier = "") {
    const [identifier, setIdentifier] = useState(initialIdentifier);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    return {
        identifier, setIdentifier,
        password, setPassword,
        showPassword, setShowPassword,
        error, setError,
        loading, setLoading,
    };
}