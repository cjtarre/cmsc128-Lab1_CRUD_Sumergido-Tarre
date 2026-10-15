import { useEffect, useState } from "react";
import { Check, ChevronLeft, Circle, Eye, EyeOff, GraduationCap, Lock, Mail, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import HoverText from "../../../shared/components/effects/HoverText";
import { useAuth } from "../hooks/useAuth";
import { DISPLAY_NAME_MAX_LENGTH, PASSWORD_MIN_LENGTH, USERNAME_MAX_LENGTH, validateSignup } from "../../../shared/utils/validation";
import { getAuthFormStyles } from "../styles/authStyles";

function Signup({ embedded = false, onSwitchToLogin }) {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

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

    const passwordRequirements = [
        { label: `At least ${PASSWORD_MIN_LENGTH} characters`, met: password.length >= PASSWORD_MIN_LENGTH },
        { label: "One uppercase letter", met: /[A-Z]/.test(password) },
        { label: "One lowercase letter", met: /[a-z]/.test(password) },
        { label: "One number", met: /\d/.test(password) },
        { label: "One special character", met: /[^A-Za-z0-9]/.test(password) },
    ];

    const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

    // Preserve non-sensitive signup progress across accidental refreshes
    useEffect(() => {
        sessionStorage.setItem("signupDisplayName", displayName);
        sessionStorage.setItem("signupUsername", username);
        sessionStorage.setItem("signupEmail", email);
    }, [displayName, username, email]);

    const clearSignupDraft = () => {
        sessionStorage.removeItem("signupDisplayName");
        sessionStorage.removeItem("signupUsername");
        sessionStorage.removeItem("signupEmail");
    };

    const clearFieldError = (field) => setErrors((prev) => ({ ...prev, [field]: undefined }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const validationErrors = validateSignup({ displayName, username, email, password, confirmPassword });

        if (Object.keys(validationErrors).length) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            await signup(email.trim(), password, username.trim().toLowerCase(), displayName.trim());

            clearSignupDraft();

            toast.success("Account created successfully!");
            navigate("/login", { state: { accountCreated: true, email: email.trim() } });
        } catch (err) {
            const message = err.response?.data?.error || "";

            if (message.toLowerCase().includes("rate limit")) setError("Too many verification emails were requested. Please try again later.");
            else if (message.toLowerCase().includes("username")) setError(message);
            else if (message.toLowerCase().includes("already")) setError("An account with this email already exists. Try signing in instead.");
            else setError(message || "Unable to create account.");
        } finally {
            setLoading(false);
        }
    };

    const { inputClass, labelClass, iconClass, eyeClass, fieldErrorClass } = getAuthFormStyles(embedded);

    const requirementClass = (met) => met
        ? embedded ? "text-green-300 dark:text-green-600" : "text-green-600 dark:text-green-400"
        : embedded ? "text-white/45 dark:text-slate-500" : "text-slate-400 dark:text-slate-500";

    const form = (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label htmlFor="signup-display-name" className={`text-sm font-medium ${labelClass}`}>Display name</label>
                <div className="relative mt-2">
                    <User size={17} className={`absolute left-3 top-1/2 -translate-y-1/2 ${iconClass}`} />
                    <input
                        id="signup-display-name"
                        type="text"
                        value={displayName}
                        onChange={(e) => {
                            setDisplayName(e.target.value);
                            clearFieldError("displayName");
                        }}
                        maxLength={DISPLAY_NAME_MAX_LENGTH}
                        placeholder="Enter your name"
                        className={inputClass}
                    />
                </div>
                {errors.displayName && <p className={fieldErrorClass}>{errors.displayName}</p>}
            </div>

            <div>
                <label htmlFor="signup-username" className={`text-sm font-medium ${labelClass}`}>Username</label>
                <div className="relative mt-2">
                    <User size={17} className={`absolute left-3 top-1/2 -translate-y-1/2 ${iconClass}`} />
                    <input
                        id="signup-username"
                        type="text"
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value.toLowerCase());
                            clearFieldError("username");
                        }}
                        maxLength={USERNAME_MAX_LENGTH}
                        autoComplete="username"
                        placeholder="Choose a username"
                        className={inputClass}
                    />
                </div>
                {errors.username && <p className={fieldErrorClass}>{errors.username}</p>}
            </div>

            <div>
                <label htmlFor="signup-email" className={`text-sm font-medium ${labelClass}`}>Email address</label>
                <div className="relative mt-2">
                    <Mail size={17} className={`absolute left-3 top-1/2 -translate-y-1/2 ${iconClass}`} />
                    <input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            clearFieldError("email");
                        }}
                        autoComplete="email"
                        placeholder="Enter your email"
                        className={inputClass}
                    />
                </div>
                {errors.email && <p className={fieldErrorClass}>{errors.email}</p>}
            </div>

            <div>
                <label htmlFor="signup-password" className={`text-sm font-medium ${labelClass}`}>Password</label>
                <div className="relative mt-2">
                    <Lock size={17} className={`absolute left-3 top-1/2 -translate-y-1/2 ${iconClass}`} />
                    <input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            clearFieldError("password");
                            clearFieldError("confirmPassword");
                        }}
                        autoComplete="new-password"
                        placeholder="Create a password"
                        className={inputClass}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} className={`absolute right-3 top-1/2 -translate-y-1/2 ${eyeClass}`}>
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                </div>

                {errors.password && <p className={fieldErrorClass}>{errors.password}</p>}

                {password && (
                    <div className="mt-3 grid gap-x-4 gap-y-1.5 text-xs sm:grid-cols-2">
                        {passwordRequirements.map(({ label, met }) => (
                            <div key={label} className={`flex items-center gap-1.5 transition-colors ${requirementClass(met)}`}>
                                {met ? <Check size={13} strokeWidth={2.5} /> : <Circle size={10} />}
                                <span>{label}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <label htmlFor="signup-confirm" className={`text-sm font-medium ${labelClass}`}>Confirm password</label>
                <div className="relative mt-2">
                    <Lock size={17} className={`absolute left-3 top-1/2 -translate-y-1/2 ${iconClass}`} />
                    <input
                        id="signup-confirm"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            clearFieldError("confirmPassword");
                        }}
                        autoComplete="new-password"
                        placeholder="Enter your password again"
                        className={inputClass}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? "Hide password" : "Show password"} className={`absolute right-3 top-1/2 -translate-y-1/2 ${eyeClass}`}>
                        {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                </div>

                {errors.confirmPassword && <p className={fieldErrorClass}>{errors.confirmPassword}</p>}

                {confirmPassword && !errors.confirmPassword && (
                    <p className={`mt-2 flex items-center gap-1.5 text-xs ${
                        passwordsMatch
                            ? embedded ? "text-green-300 dark:text-green-600" : "text-green-600 dark:text-green-400"
                            : embedded ? "text-red-200 dark:text-red-600" : "text-red-500 dark:text-red-400"
                    }`}>
                        {passwordsMatch ? <Check size={13} strokeWidth={2.5} /> : <Circle size={10} />}
                        {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                    </p>
                )}
            </div>

            {error && <p className={`text-sm ${embedded ? "text-red-200 dark:text-red-600" : "text-red-500 dark:text-red-400"}`}>{error}</p>}

            <p className={`pt-1 text-xs leading-5 ${embedded ? "text-white/55 dark:text-slate-500" : "text-slate-500 dark:text-slate-400"}`}>
                By creating an account, you agree to our{" "}
                <Link to="/privacy" target="_blank" rel="noopener noreferrer" className={`font-medium underline ${embedded ? "text-green-300 dark:text-green-600" : "text-green-600 dark:text-green-400"}`}>Privacy Policy</Link>.
            </p>

            <button type="submit" disabled={loading} className="w-full rounded-lg bg-green-500 py-2.5 text-sm font-medium text-white transition hover:bg-green-600 disabled:opacity-60">
                {loading ? "Creating account..." : "Create account"}
            </button>
        </form>
    );

    if (embedded) {
        return (
            <div className="flex min-h-full items-start px-6 pb-12 pt-24 sm:px-10 sm:pt-28">
                <div className="mx-auto w-full max-w-md">
                    <div className="mb-8 flex flex-col items-center text-center">
                        <div className="flex items-center gap-2 text-green-300 dark:text-green-500">
                            <GraduationCap size={24} />
                            <span className="font-bold text-white dark:text-slate-800">Takda</span>
                        </div>

                        <h1 className="mt-8 text-center text-3xl font-black tracking-tight text-white dark:text-slate-800">
                            <HoverText text="Create your account" />
                        </h1>
                        <p className="mx-auto mt-3 max-w-sm text-center text-sm leading-6 text-white/60 dark:text-slate-500">Start organizing your schoolwork with Takda.</p>
                    </div>

                    {form}

                    <p className="mt-8 text-center text-sm text-white/60 dark:text-slate-500">
                        Already have an account?{" "}
                        <button type="button" onClick={onSwitchToLogin} className="font-semibold text-green-300 hover:text-green-200 dark:text-green-600 dark:hover:text-green-700">Sign in</button>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5faf7] px-6 py-6 dark:bg-slate-950">
            <div className="mx-auto max-w-md">
                <Link to="/" onClick={clearSignupDraft} aria-label="Back to home" className="group flex h-10 w-10 items-center overflow-hidden rounded-full border border-slate-200 bg-white px-3 text-slate-500 shadow-sm transition-all duration-300 hover:w-32 hover:border-green-200 hover:text-green-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-green-800 dark:hover:text-green-400">
                    <ChevronLeft size={18} className="shrink-0 transition-transform duration-300 group-hover:-translate-x-0.5" />
                    <span className="ml-1 max-w-0 whitespace-nowrap text-sm font-medium opacity-0 transition-all duration-300 group-hover:max-w-24 group-hover:opacity-100">Back to home</span>
                </Link>

                <div className="flex min-h-[90vh] items-center">
                    <div className="w-full">
                        <div className="mb-10 text-center">
                            <div className="flex items-center justify-center gap-2 text-green-500 dark:text-green-400">
                                <GraduationCap size={24} />
                                <span className="font-bold">Takda</span>
                            </div>
                            <h1 className="mt-10 text-3xl font-black tracking-tight text-slate-800 dark:text-white">Create your account</h1>
                            <p className="mx-auto mt-3 max-w-sm text-center text-sm leading-6 text-slate-500 dark:text-slate-400">Start organizing your schoolwork with Takda.</p>
                        </div>

                        {form}

                        <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                            Already have an account?{" "}
                            <Link to="/login" state={{ email: location.state?.loginEmail ?? "" }} className="font-semibold text-green-600 dark:text-green-400">Sign in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signup;