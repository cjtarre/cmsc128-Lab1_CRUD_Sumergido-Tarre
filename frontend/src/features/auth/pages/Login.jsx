import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, GraduationCap, Lock, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import HoverText from "../../../shared/components/effects/HoverText";

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(email, password);
            navigate("/dashboard");
        } catch (error) {
            setError(error.response?.data?.error || "Invalid email or password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5faf7] px-4 py-10">
            <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-green-100/60 blur-3xl" />

            <Link to="/" className="absolute left-5 top-5 flex items-center gap-2 text-sm text-slate-500 hover:text-green-600 sm:left-8 sm:top-7">
                <ArrowLeft size={16} /> Back to home
            </Link>

            <div className="relative w-full max-w-md">
                <div className="mb-7 text-center">
                    <Link to="/" className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-500">
                        <GraduationCap size={28} strokeWidth={1.7} />
                    </Link>
                    <HoverText text="Welcome back" className="text-3xl font-bold tracking-tight text-slate-800"/>
                    <p className="mt-2 text-sm text-slate-500">Sign in to continue to your StudyBoard.</p>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/40 sm:p-8">
                    {error && (
                        <div role="alert" className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                                Email
                            </label>
                            <div className="relative">
                                <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    required
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 text-sm outline-none focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                                    Password
                                </label>
                                <Link to="/forgot-password" className="text-xs font-medium text-green-600 hover:text-green-700">
                                    Forgot password?
                                </Link>
                            </div>

                            <div className="relative">
                                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    required
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-11 text-sm outline-none focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-green-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-500">
                        Don't have an account?{" "}
                        <Link to="/signup" className="font-semibold text-green-600 hover:text-green-700">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;