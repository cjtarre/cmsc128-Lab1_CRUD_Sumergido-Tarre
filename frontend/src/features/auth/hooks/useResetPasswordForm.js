import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { isPasswordValid } from "../../../shared/utils/validation";
import { authService } from "../services/authService";

export function useResetPasswordForm() {
    const navigate = useNavigate();

    const [accessToken, setAccessToken] = useState("");
    const [refreshToken, setRefreshToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [validLink, setValidLink] = useState(null);

    const passwordsMatch =
        confirmPassword.length > 0 &&
        newPassword === confirmPassword;

    // Read recovery tokens from the redirect URL.
    useEffect(() => {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);

        const access =
            hashParams.get("access_token") ||
            queryParams.get("access_token");

        const refresh =
            hashParams.get("refresh_token") ||
            queryParams.get("refresh_token");

        const type =
            hashParams.get("type") ||
            queryParams.get("type");

        if (access && refresh && (!type || type === "recovery")) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setAccessToken(access);
            setRefreshToken(refresh);
            setValidLink(true);
        } else {
            setValidLink(false);
        }
    }, []);

    // Validate and submit the new password.
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newPassword) return toast.error("Enter a new password.");
        if (!isPasswordValid(newPassword)) {
            return toast.error("Your password does not meet all requirements.");
        }
        if (!confirmPassword) return toast.error("Confirm your new password.");
        if (!passwordsMatch) return toast.error("Passwords do not match.");

        setLoading(true);

        try {
            await authService.resetPassword(
                accessToken,
                refreshToken,
                newPassword
            );

            toast.success(
                "Password reset successfully! You can now sign in."
            );

            navigate("/login", { replace: true });
        } catch (error) {
            toast.error(
                error.response?.data?.error ||
                "Invalid or expired reset link."
            );
        } finally {
            setLoading(false);
        }
    };

    return {
        newPassword, setNewPassword, confirmPassword, setConfirmPassword,
        showNewPassword, setShowNewPassword, showConfirmPassword, setShowConfirmPassword,
        loading, validLink, passwordsMatch, handleSubmit,
    };
}
