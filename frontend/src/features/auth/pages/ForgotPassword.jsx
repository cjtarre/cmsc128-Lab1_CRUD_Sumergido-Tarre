import { ArrowLeft, Mail, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";

import { authService } from "../services/authService";

function ForgotPassword() {
    const location = useLocation();
    const cameFromAuthPanel = location.state?.from === "auth-panel";

    const [email, setEmail] = useState(location.state?.email ?? "");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    // Request a password recovery email
    const handleSubmit = async (e) => {
        e.preventDefault();

        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            toast.error("Email address is required.");
            return;
        }

        setLoading(true);

        try {
            const data = await authService.forgotPassword(trimmedEmail);
            setSent(true);
            toast.success(data.message || "If that email is registered, a reset link has been sent.");
        } catch (error) {
            toast.error(error.response?.data?.error || "Unable to request a password reset.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f5faf7] px-4 py-8 dark:bg-slate-950">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-8">

                {/* Return to home */}
                <Link
                    to={cameFromAuthPanel ? "/" : "/login"}
                    state={cameFromAuthPanel
                        ? { openAuth: true, email: location.state?.loginEmail ?? "" }
                        : { email: location.state?.loginEmail ?? "" }
                    }
                    aria-label={cameFromAuthPanel ? "Back to home" : "Back to login"}
                    className="group mb-6 flex h-10 w-10 items-center overflow-hidden whitespace-nowrap rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-300 hover:w-36 hover:border-green-300 hover:bg-green-50 hover:text-green-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-green-700 dark:hover:bg-green-950 dark:hover:text-green-400"
                >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center">
                        <ArrowLeft size={18} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
                    </span>

                    <span className="pr-4 text-sm font-medium opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        {cameFromAuthPanel ? "Back to home" : "Back to login"}
                    </span>
                </Link>

                {/* Page heading */}
                <div className="mb-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-500 dark:bg-green-950 dark:text-green-400">
                        <Mail size={20} />
                    </div>

                    <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">Forgot password?</h1>
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                {/* Success message */}
                {sent ? (
                    <div className="space-y-5">
                        <div className="rounded-xl border border-green-100 bg-green-50 p-4 text-sm leading-6 text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300">
                            If that email is registered, a password reset link has been sent. Check your inbox and spam folder.
                        </div>

                        <button type="button" onClick={() => setSent(false)} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                            Try another email
                        </button>
                    </div>
                ) : (

                    /* Recovery form */
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label htmlFor="email" className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                Email address
                            </label>

                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="Enter your email address" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-green-600 dark:focus:ring-green-950" />

                                {email && (
                                    <button type="button" onClick={() => setEmail("")} aria-label="Clear email" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full rounded-xl bg-green-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60">
                            {loading ? "Sending..." : "Send reset link"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default ForgotPassword;