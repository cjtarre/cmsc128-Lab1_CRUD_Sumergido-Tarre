import { X } from "lucide-react";
import { useEffect, useState } from "react";
import Login from "../pages/Login";
import Signup from "../pages/Signup";

function AuthPanel({ isOpen, onClose }) {
    const [isSignup, setIsSignup] = useState(false);
    const [shouldRender, setShouldRender] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShouldRender(true);
        } else {
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 700);

            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!shouldRender) {
        return (
            <div
                className="relative min-h-screen shrink-0 w-0
                    overflow-visible bg-[#02341e]"
            />
        );
    }

    return (
        <div
            className={`relative min-h-screen shrink-0 overflow-visible
                bg-[#02341e] transition-[width] duration-700
                ease-[cubic-bezier(0.22,1,0.36,1)]
                ${isOpen ? "w-full sm:w-[52%]" : "w-0"}`}
        >
            <svg
                className="pointer-events-none absolute -left-20 top-0 hidden
                    h-full w-24 sm:block"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
            >
                <path
                    d="M100 0 C20 18 20 82 100 100 L100 0 Z"
                    fill="#02341e"
                />
            </svg>

            <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute right-5 top-5 z-20 flex h-9 w-9
                    items-center justify-center rounded-full
                    border border-white/15 bg-white/10
                    text-white/80 transition
                    hover:bg-white/15 hover:text-white"
            >
                <X size={18} />
            </button>

            <div
                className={`min-h-screen w-full overflow-y-auto
                    transition-all duration-500
                    ${
                        isOpen
                            ? "translate-y-0 opacity-100"
                            : "translate-y-4 opacity-0"
                    }`}
            >
                {isSignup ? (
                    <Signup
                        embedded
                        onSwitchToLogin={() => setIsSignup(false)}
                    />
                ) : (
                    <Login
                        embedded
                        onSwitchToSignup={() => setIsSignup(true)}
                    />
                )}
            </div>
        </div>
    );
}

export default AuthPanel;