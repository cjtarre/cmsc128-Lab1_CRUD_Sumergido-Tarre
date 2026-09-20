import { useState } from "react";
import {
    ChevronLeft,
    Eye,
    EyeOff,
    GraduationCap,
    Lock,
    Mail,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import HoverText from "../../../shared/components/effects/HoverText";
import { useAuth } from "../hooks/useAuth";

function Login({ embedded = false, onSwitchToSignup }) {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(email, password);
            navigate("/dashboard");
        } catch (err) {
            setError(
                err.response?.data?.error || "Invalid email or password."
            );
        } finally {
            setLoading(false);
        }
    };

    const inputClass = embedded
        ? "w-full rounded-lg border border-white/15 bg-white/10 py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-white/45 outline-none focus:border-white/40 focus:ring-2 focus:ring-white/10"
        : "w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100";

    const form = (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label
                    htmlFor="login-email"
                    className={`text-sm font-medium ${
                        embedded ? "text-white/80" : "text-slate-700"
                    }`}
                >
                    Email
                </label>

                <div className="relative mt-2">
                    <Mail
                        size={17}
                        className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                            embedded ? "text-white/45" : "text-slate-400"
                        }`}
                    />

                    <input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="you@example.com"
                        className={inputClass}
                    />
                </div>
            </div>

            <div>
                <label
                    htmlFor="login-password"
                    className={`text-sm font-medium ${
                        embedded ? "text-white/80" : "text-slate-700"
                    }`}
                >
                    Password
                </label>

                <div className="relative mt-2">
                    <Lock
                        size={17}
                        className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                            embedded ? "text-white/45" : "text-slate-400"
                        }`}
                    />

                    <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Enter your password"
                        className={inputClass}
                    />

                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Toggle password visibility"
                        className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                            embedded
                                ? "text-white/45 hover:text-white"
                                : "text-slate-400"
                        }`}
                    >
                        {showPassword ? (
                            <EyeOff size={17} />
                        ) : (
                            <Eye size={17} />
                        )}
                    </button>
                </div>
            </div>

            {error && (
                <p
                    className={`text-sm ${
                        embedded ? "text-red-200" : "text-red-500"
                    }`}
                >
                    {error}
                </p>
            )}

            <div className="flex justify-end">
                <Link
                    to="/forgot-password"
                    className={`text-xs font-medium ${
                        embedded
                            ? "text-green-300 hover:text-green-200"
                            : "text-green-600 hover:text-green-700"
                    }`}
                >
                    Forgot password?
                </Link>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-green-500 py-2.5 text-sm font-medium
                    text-white transition hover:bg-green-600 disabled:opacity-60"
            >
                {loading ? "Signing in..." : "Sign in"}
            </button>
        </form>
    );

    if (embedded) {
        return (
            <div className="flex min-h-screen items-start px-6 pt-24 pb-12 sm:px-10 sm:pt-28">
                <div className="mx-auto w-full max-w-md">
                    <div className="mb-10 flex flex-col items-center text-center">
                        <div className="flex items-center gap-2 text-green-300">
                            <GraduationCap size={24} />
                            <span className="font-bold text-white">
                                Takda
                            </span>
                        </div>

                        <h1 className="mt-10 text-3xl font-black tracking-tight text-white">
                            <HoverText text="Welcome back" />
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-white/60">
                            Sign in to continue to Takda.
                        </p>
                    </div>

                    {form}

                    <p className="mt-8 text-center text-sm text-white/60">
                        Don't have an account?{" "}
                        <button
                            type="button"
                            onClick={onSwitchToSignup}
                            className="font-semibold text-green-300 hover:text-green-200"
                        >
                            Create one
                        </button>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5faf7] px-6 py-6">
            <div className="mx-auto max-w-md">
                <Link
                    to="/"
                    aria-label="Back to home"
                    className="group flex h-10 w-10 items-center overflow-hidden
                        rounded-full border border-slate-200 bg-white px-3
                        text-slate-500 shadow-sm transition-all duration-300
                        hover:w-32 hover:border-green-200 hover:text-green-600"
                >
                    <ChevronLeft
                        size={18}
                        className="shrink-0 transition-transform duration-300
                            group-hover:-translate-x-0.5"
                    />

                    <span
                        className="ml-1 max-w-0 whitespace-nowrap text-sm
                            font-medium opacity-0 transition-all duration-300
                            group-hover:max-w-24 group-hover:opacity-100"
                    >
                        Back to home
                    </span>
                </Link>

                <div className="flex min-h-[90vh] items-center">
                    <div className="w-full">
                        <div className="mb-10 text-center">
                            <div className="flex items-center justify-center gap-2 text-green-500">
                                <GraduationCap size={24} />
                                <span className="font-bold">Takda</span>
                            </div>

                            <h1 className="mt-10 text-3xl font-black tracking-tight">
                                Welcome back
                            </h1>

                            <p className="mt-3 text-sm leading-6 text-slate-500">
                                Sign in to continue to Takda.
                            </p>
                        </div>

                        {form}

                        <p className="mt-8 text-center text-sm text-slate-500">
                            Don't have an account?{" "}
                            <Link
                                to="/signup"
                                className="font-semibold text-green-600"
                            >
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