import { useState } from "react";
import { ChevronLeft, Eye, EyeOff, GraduationCap, Lock, UserRound, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import HoverText from "../../../shared/components/effects/HoverText";
import { useAuth } from "../hooks/useAuth";

function Login({ embedded = false, initialEmail = "", onEmailChange, onSwitchToSignup }) {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Login form state; retain identifier passed from related auth pages
    const [identifier, setIdentifier] = useState(initialEmail || location.state?.email || "");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Authenticate the user and redirect to the dashboard on success
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(identifier.trim(), password);
            toast.success("Welcome back! You’re signed in.");
            navigate("/dashboard", { replace: true });
        } catch (err) {
            const message = err.response?.data?.error || "";
            setError(
                message.toLowerCase().includes("email not confirmed")
                    ? "Please verify your email before signing in."
                    : message || "Invalid username/email or password."
            );
        } finally {
            setLoading(false);
        }
    };

    // Shared form styles adapt to standalone and embedded auth layouts
    const inputClass = embedded
        ? "w-full rounded-lg border border-white/15 bg-white/10 py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-white/45 outline-none focus:border-white/40 focus:ring-2 focus:ring-white/10 dark:border-slate-300 dark:bg-white/60 dark:text-slate-800 dark:placeholder:text-slate-400 dark:focus:border-green-500 dark:focus:ring-green-200"
        : "w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-green-400 dark:focus:ring-green-900/50";

    const labelClass = embedded
        ? "text-white/80 dark:text-slate-700"
        : "text-slate-700 dark:text-slate-200";

    const iconClass = embedded
        ? "text-white/45 dark:text-slate-500"
        : "text-slate-400 dark:text-slate-500";

    // Displayed after a newly created account is redirected to login
    const verificationNotice = location.state?.accountCreated && (
        <div className={`mb-5 rounded-lg border px-4 py-3 text-sm ${embedded ? "border-green-300/20 bg-green-400/10 text-green-100 dark:border-green-700/20 dark:bg-green-600/10 dark:text-green-800" : "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300"}`}>
            <span className="font-semibold">Account created!</span> Check your email and verify your account before signing in.
        </div>
    );

    // Reused by both the embedded landing panel and standalone login page
    const form = (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label htmlFor="login-identifier" className={`text-sm font-medium ${labelClass}`}>Username or email</label>
                <div className="relative mt-2">
                    <UserRound size={17} className={`absolute left-3 top-1/2 -translate-y-1/2 ${iconClass}`} />
                    <input
                        id="login-identifier"
                        type="text"
                        value={identifier}
                        onChange={(e) => {
                            const value = e.target.value;
                            setIdentifier(value);
                            onEmailChange?.(value.includes("@") ? value : "");
                        }}
                        required
                        autoComplete="username"
                        placeholder="Enter your username or email"
                        className={inputClass}
                    />

                    {identifier && (
                        <button type="button" onClick={() => { setIdentifier(""); onEmailChange?.(""); }} aria-label="Clear username or email" className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${embedded ? "text-white/45 hover:text-white dark:text-slate-500 dark:hover:text-slate-700" : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"}`}>
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            <div>
                <label htmlFor="login-password" className={`text-sm font-medium ${labelClass}`}>Password</label>
                <div className="relative mt-2">
                    <Lock size={17} className={`absolute left-3 top-1/2 -translate-y-1/2 ${iconClass}`} />
                    <input id="login-password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" placeholder="Enter your password" className={inputClass} />

                    <button type="button" onClick={() => setShowPassword((show) => !show)} aria-label={showPassword ? "Hide password" : "Show password"} className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${embedded ? "text-white/45 hover:text-white dark:text-slate-500 dark:hover:text-slate-700" : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"}`}>
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                </div>
            </div>

            {error && (
                <p className={`text-sm ${embedded ? "text-red-200 dark:text-red-600" : "text-red-500 dark:text-red-400"}`}>
                    {error}
                </p>
            )}

            <div className="flex justify-end">
                <Link to="/forgot-password" state={{ from: embedded ? "auth-panel" : "login", email: identifier.includes("@") ? identifier : "", loginEmail: identifier}} className={`text-xs font-medium transition ${
                        embedded ? "text-green-300 hover:text-green-200 dark:text-green-700 dark:hover:text-green-800" : "text-green-700 hover:text-green-800 dark:text-green-300 dark:hover:text-green-200" }`}
                >
                    Forgot password?
                </Link>
            </div>

            <button type="submit" disabled={loading} className="w-full rounded-lg bg-green-500 py-2.5 text-sm font-medium text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? "Signing in..." : "Sign in"}
            </button>
        </form>
    );

    // Embedded version displayed inside the animated landing-page auth panel
    if (embedded) {
        return (
            <div className="flex min-h-full items-start px-6 pb-12 pt-24 sm:px-10 sm:pt-28">
                <div className="mx-auto w-full max-w-md">
                    <div className="mb-10 flex flex-col items-center text-center">
                        <div className="flex items-center gap-2 text-green-300 dark:text-green-700">
                            <GraduationCap size={24} />
                            <span className="font-bold text-white dark:text-slate-800">Takda</span>
                        </div>

                        <h1 className="mt-10 text-3xl font-black tracking-tight text-white dark:text-slate-800">
                            <HoverText text="Welcome back" />
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-white/60 dark:text-slate-500">
                            Sign in to continue to Takda.
                        </p>
                    </div>

                    {verificationNotice}
                    {form}

                    <p className="mt-8 text-center text-sm text-white/60 dark:text-slate-500">
                        Don't have an account?{" "}
                        <button type="button" onClick={onSwitchToSignup} className="font-semibold text-green-300 transition hover:text-green-200 dark:text-green-700 dark:hover:text-green-800">
                            Create one
                        </button>
                    </p>
                </div>
            </div>
        );
    }

    // Standalone login page used when visiting /login directly
    return (
        <div className="min-h-screen bg-[#f5faf7] px-6 py-6 dark:bg-slate-950">
            <div className="mx-auto max-w-md">
                <Link to="/" aria-label="Back to home" className="group flex h-10 w-10 translate-y-25 items-center overflow-hidden rounded-full border border-slate-200 bg-white px-3 text-slate-500 shadow-sm transition-all duration-300 hover:w-32 hover:border-green-200 hover:text-green-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-green-800 dark:hover:text-green-400">
                    <ChevronLeft size={18} className="shrink-0 transition-transform duration-300 group-hover:-translate-x-0.5" />
                    <span className="ml-1 max-w-0 whitespace-nowrap text-sm font-medium opacity-0 transition-all duration-300 group-hover:max-w-24 group-hover:opacity-100">
                        Back to home
                    </span>
                </Link>

                <div className="flex min-h-[90vh] items-center">
                    <div className="w-full">
                        <div className="mb-10 text-center">
                            <div className="flex items-center justify-center gap-2 text-green-500 dark:text-green-400">
                                <GraduationCap size={24} />
                                <span className="font-bold">Takda</span>
                            </div>

                            <h1 className="mt-10 text-3xl font-black tracking-tight text-slate-800 dark:text-white">
                                Welcome back
                            </h1>

                            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                Sign in to continue to Takda.
                            </p>
                        </div>

                        {verificationNotice}
                        {form}

                        <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                            Don't have an account?{" "}
                            <Link to="/signup" state={{ loginEmail: identifier.includes("@") ? identifier : "" }} className="font-semibold text-green-600 dark:text-green-400">
                                Create one
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;