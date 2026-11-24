import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

import NotificationMenu from "./NotificationMenu";
import ProfileMenu from "./ProfileMenu";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import { getDisplayName } from "../../utils/userUtils";

function Header() {
    const { user, authLoading } = useAuth();
    const displayName = getDisplayName(user);

    return (
        <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-white/60 bg-white/70 px-4 shadow-[0_1px_16px_rgba(15,23,42,0.035)] backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-slate-950/65 sm:h-16 sm:px-6">
            <Link
                to="/my-tasks"
                className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white sm:text-xl"
            >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/70 bg-green-50/80 text-green-500 shadow-sm dark:border-white/10 dark:bg-green-950/60 dark:text-green-400">
                    <GraduationCap size={18} strokeWidth={1.8} />
                </span>

                <span>Takda</span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
                {!authLoading && (
                    <p className="hidden text-sm font-medium text-slate-600 dark:text-slate-300 md:block">
                        Welcome, {displayName}!
                    </p>
                )}

                <NotificationMenu />
                <ProfileMenu />
            </div>
        </header>
    );
}

export default Header;