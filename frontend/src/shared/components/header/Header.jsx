import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import ProfileMenu from "./ProfileMenu";
import { useAuth } from "../../../features/auth/hooks/useAuth";

function Header() {
    const { user, authLoading } = useAuth();

    return (
        <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 transition-colors dark:border-slate-700 dark:bg-slate-900 sm:h-16 sm:px-6">
            <Link
                to="/dashboard"
                className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white sm:text-xl"
            >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-500 dark:bg-green-950 dark:text-green-400">
                    <GraduationCap size={18} strokeWidth={1.8} />
                </span>

                <span>Takda</span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-4">
                {!authLoading && (
                    <p className="hidden text-sm font-medium text-slate-600 dark:text-slate-300 md:block">
                        Welcome, {user?.username || "User"}!
                    </p>
                )}

                <ProfileMenu />
            </div>
        </header>
    );
}

export default Header;