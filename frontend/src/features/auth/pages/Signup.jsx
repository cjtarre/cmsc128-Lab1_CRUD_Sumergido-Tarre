import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, GraduationCap, Lock, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import HoverText from "../../../shared/components/effects/HoverText";
import { useAuth } from "../hooks/useAuth";

function Signup() {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            await signup(email, password);
            navigate("/login");
        } catch (error) {
            setError(error.response?.data?.error || "Unable to create account.");
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-11 text-sm outline-none focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100";

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5faf7] px-4 py-10">
            <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-green-100/60 blur-3xl" />

            <Link
                to="/"
                className="absolute left-5 top-5 flex items-center gap-2 text-sm text-slate-500 hover:text-green-600 sm:left-8 sm:top-7"
            >
                <ArrowLeft size={16} /> Back to home
            </Link>

            <div className="relative w-full max-w-md">
                <div className="mb-7 text-center">
                    <Link
                        to="/"
                        className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-500"
                    >
                        <GraduationCap size={28} strokeWidth={1.7} />
                    </Link>

                    <HoverText
                        text="Create your account"
                        className="text-3xl font-bold tracking-tight text-slate-800"
                    />

                    <p className="mt-2 text-sm text-slate-500">
                        Start organizing your schoolwork with StudyBoard.
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/40 sm:p-8">
                    {error && (
                        <div
                            role="alert"
                            className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
                        >
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
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        {[
                            ["password", "Password", password, setPassword, showPassword, setShowPassword, "Create a password"],
                            ["confirmPassword", "Confirm password", confirmPassword, setConfirmPassword, showConfirmPassword, setShowConfirmPassword, "Re-enter your password"],
                        ].map(([id, label, value, setValue, show, setShow, placeholder]) => (
                            <div key={id}>
                                <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-700">
                                    {label}
                                </label>

                                <div className="relative">
                                    <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />

                                    <input
                                        id={id}
                                        type={show ? "text" : "password"}
                                        value={value}
                                        onChange={(event) => setValue(event.target.value)}
                                        placeholder={placeholder}
                                        autoComplete="new-password"
                                        required
                                        className={inputClass}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShow(!show)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {show ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-green-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Creating account..." : "Create account"}
                        </button>

                        <p className="text-center text-xs text-slate-400">
                            By creating an account, you acknowledge our{" "}
                            <Link to="/privacy" className="font-medium text-green-600 hover:text-green-700">
                                Privacy Policy
                            </Link>
                            .
                        </p>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-500">
                        Already have an account?{" "}
                        <Link to="/login" className="font-semibold text-green-600 hover:text-green-700">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Signup;