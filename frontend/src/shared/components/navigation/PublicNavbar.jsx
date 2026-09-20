import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

function PublicNavbar({ showAuth }) {
    return (
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                <Link
                    to="/"
                    className="flex items-center gap-2 text-lg font-bold"
                >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-500">
                        <GraduationCap size={20} strokeWidth={1.8} />
                    </span>
                    Takda
                </Link>

                <nav className="flex items-center gap-0.5 sm:gap-1">
                    <Link
                        to="/about"
                        className="rounded-lg px-2.5 py-2 text-xs font-medium text-slate-500 hover:bg-green-50 hover:text-green-600 sm:px-4 sm:text-sm"
                    >
                        About
                    </Link>

                    {!showAuth && (
                        <>
                            <Link
                                to="/login"
                                className="rounded-lg px-2.5 py-2 text-xs font-medium text-slate-500 hover:bg-green-50 hover:text-green-600 sm:px-4 sm:text-sm"
                            >
                                Log in
                            </Link>

                            <Link
                                to="/signup"
                                className="rounded-lg bg-green-500 px-3 py-2 text-xs font-medium text-white hover:bg-green-600 sm:px-4 sm:text-sm"
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