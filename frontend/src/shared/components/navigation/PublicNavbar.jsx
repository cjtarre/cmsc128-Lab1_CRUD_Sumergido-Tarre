import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

function PublicNavbar({ showAuth }) {
    return (
        <header className="relative w-full">
            {/* Navbar surface */}
            <div className="absolute inset-0 bg-white/65 shadow-[0_1px_16px_rgba(15,23,42,0.03)] backdrop-blur-xl dark:bg-slate-950/65" />

            {/* Surface continues underneath the auth panel */}
            <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-y-0 left-full bg-white/65 backdrop-blur-xl transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] dark:bg-slate-950/65 ${
                    showAuth ? "w-[30%]" : "w-0"
                }`}
            />

            {/* Bottom border */}
            <div
                aria-hidden="true"
                className={`pointer-events-none absolute bottom-0 left-0 h-px bg-white/60 transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] dark:bg-white/10 ${
                    showAuth ? "w-[130%]" : "w-full"
                }`}
            />

            {/* Navbar content */}
            <div className="relative z-20 mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                <Link
                    to="/"
                    className="flex shrink-0 items-center gap-2 text-lg font-bold text-slate-800 dark:text-white"
                >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/70 bg-green-50/80 text-green-500 shadow-sm dark:border-white/10 dark:bg-green-950/60 dark:text-green-400">
                        <GraduationCap size={20} strokeWidth={1.8} />
                    </span>
                    <span>Takda</span>
                </Link>

                <nav className="flex shrink-0 items-center gap-1">
                    <Link
                        to="/about"
                        className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-green-50/70 hover:text-green-600 dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-green-400 sm:px-4"
                    >
                        About
                    </Link>

                    {!showAuth && (
                        <>
                            <Link
                                to="/login"
                                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-green-50/70 hover:text-green-600 dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-green-400 sm:px-4"
                            >
                                Log in
                            </Link>

                            <Link
                                to="/signup"
                                className="rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(34,197,94,0.18)] transition hover:bg-green-600 hover:shadow-[0_8px_22px_rgba(34,197,94,0.24)] focus:outline-none focus:ring-2 focus:ring-green-300/60 dark:hover:bg-green-400"
                            >
                                Sign up
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default PublicNavbar;