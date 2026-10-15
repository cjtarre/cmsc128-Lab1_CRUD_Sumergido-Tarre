import { X } from "lucide-react";
import { useEffect, useState } from "react";
import Login from "../pages/Login";
import Signup from "../pages/Signup";

function AuthPanel({ isOpen, onClose, initialEmail = "" }) {
    const [isSignup, setIsSignup] = useState(false);
    const [loginEmail, setLoginEmail] = useState(initialEmail);
    const [shouldRender, setShouldRender] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShouldRender(true);
            if (initialEmail) setLoginEmail(initialEmail);
        } else {
            const timer = setTimeout(() => setShouldRender(false), 700);
            return () => clearTimeout(timer);
        }
    }, [isOpen, initialEmail]);

    const handleClose = () => {
        sessionStorage.removeItem("signupDisplayName");
        sessionStorage.removeItem("signupUsername");
        sessionStorage.removeItem("signupEmail");
        setIsSignup(false);
        onClose();
    };

    if (!shouldRender) return <div className="min-h-screen w-0 shrink-0" />;

    return (
        <div
            className={`relative min-h-screen shrink-0 overflow-hidden bg-[#02341e] shadow-[-18px_0_50px_rgba(2,52,30,0.12)] transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] dark:bg-[#dff5e8] dark:shadow-[-18px_0_50px_rgba(15,23,42,0.08)] sm:[clip-path:ellipse(115%_85%_at_115%_50%)] ${
                isOpen ? "w-full sm:w-[54%]" : "w-0"
            }`}
        >
            {/* Ambient background */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-400/10 blur-[90px] dark:bg-emerald-300/30" />
                <div className="absolute -bottom-32 right-[15%] h-96 w-96 rounded-full bg-green-300/[0.07] blur-[110px] dark:bg-green-300/25" />
                <div className="absolute left-[20%] top-[30%] h-72 w-72 rounded-full bg-white/[0.025] blur-[90px] dark:bg-white/30" />
            </div>

            {/* Soft surface depth */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-black/[0.04] dark:from-white/25 dark:to-emerald-100/20" />

            <button
                type="button"
                onClick={handleClose}
                aria-label="Close"
                className="absolute right-5 top-5 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/75 shadow-sm backdrop-blur-md transition hover:bg-white/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20 dark:border-white/60 dark:bg-white/45 dark:text-slate-600 dark:hover:bg-white/75 dark:hover:text-slate-800 dark:focus:ring-green-300/50"
            >
                <X size={18} />
            </button>

            <div
                className={`relative z-10 h-screen w-full overflow-y-auto transition-all duration-500 sm:pl-12 ${
                    isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
            >
                {isSignup ? (
                    <Signup embedded onSwitchToLogin={() => setIsSignup(false)} />
                ) : (
                    <Login
                        embedded
                        initialEmail={loginEmail}
                        onEmailChange={setLoginEmail}
                        onSwitchToSignup={() => setIsSignup(true)}
                    />
                )}
            </div>
        </div>
    );
}

export default AuthPanel;