import { useState } from "react";

// Manage forgot-password form state.
export function useForgotPasswordForm(initialEmail = "") {
    const [email, setEmail] = useState(initialEmail);
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    return {
        email, setEmail,
        loading, setLoading,
        sent, setSent,
    };
}