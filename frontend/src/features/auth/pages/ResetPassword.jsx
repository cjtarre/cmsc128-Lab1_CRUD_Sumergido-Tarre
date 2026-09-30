import { ArrowLeft, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { authService } from "../services/authService";

function ResetPassword() {
    const navigate = useNavigate();

    const [accessToken, setAccessToken] = useState("");
    const [refreshToken, setRefreshToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [validLink, setValidLink] = useState(null);

    // Read recovery tokens from the redirect URL
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

    // Validate and submit the new password
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newPassword) return toast.error("Enter a new password.");
        if (newPassword.length < 8) return toast.error("Password must be at least 8 characters.");
        if (!confirmPassword) return toast.error("Confirm your new password.");
        if (newPassword !== confirmPassword) return toast.error("Passwords do not match.");

        setLoading(true);

        try {
            await authService.resetPassword(accessToken, refreshToken, newPassword);
            toast.success("Password reset successfully! You can now sign in.");
            navigate("/login", { replace: true });
        } catch (error) {
            toast.error(error.response?.data?.error || "Invalid or expired reset link.");
        } finally {
            setLoading(false);
        }
    };

    // Check recovery link
    if (validLink === null) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f5faf7] dark:bg-slate-950">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-green-500" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f5faf7] px-4 py-8 dark:bg-slate-950">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-8">

                {/* Back to login */}
                <Link to="/login" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-green-600 dark:text-slate-400 dark:hover:text-green-400">
                    <ArrowLeft size={16} /> Back to login
                </Link>

                {/* Page heading */}
                <div className="mb-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-500 dark:bg-green-950 dark:text-green-400">
                        <LockKeyhole size={20} />
                    </div>

                    <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">Reset password</h1>
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        Choose a new password for your Takda account.
                    </p>
                </div>

                {!validLink ? (
                    /* Invalid or expired recovery link */
                    <div className="space-y-5">
                        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                            This password reset link is invalid or has expired. Request a new reset link and try again.
                        </div>

                        <Link to="/forgot-password" className="block w-full rounded-xl bg-green-500 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-green-600">
                            Request another link
                        </Link>
                    </div>
                ) : (
                    /* New password form */
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label htmlFor="newPassword" className="text-xs font-medium text-slate-600 dark:text-slate-300">New password</label>

                            <div className="relative">
                                <input id="newPassword" type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" placeholder="Enter new password" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-green-600 dark:focus:ring-green-950" />

                                <button type="button" onClick={() => setShowNewPassword((show) => !show)} aria-label={showNewPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200">
                                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="confirmPassword" className="text-xs font-medium text-slate-600 dark:text-slate-300">Confirm new password</label>

                            <div className="relative">
                                <input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" placeholder="Confirm new password" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-green-600 dark:focus:ring-green-950" />

                                <button type="button" onClick={() => setShowConfirmPassword((show) => !show)} aria-label={showConfirmPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200">
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <p className="text-xs text-slate-400 dark:text-slate-500">Use at least 8 characters.</p>

                        <button type="submit" disabled={loading} className="w-full rounded-xl bg-green-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60">
                            {loading ? "Resetting..." : "Reset password"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default ResetPassword;