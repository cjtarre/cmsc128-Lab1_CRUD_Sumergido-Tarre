import { LogOut, Settings, User } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import ConfirmDialog from "../common/ConfirmDialog";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import { getDisplayName, getInitials } from "../../utils/userUtils";

function ProfileMenu() {
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    const displayName = getDisplayName(user);
    const initials = getInitials(displayName);

    const handleLogoutClick = () => {
        setOpen(false);
        setShowLogoutDialog(true);
    };

    const handleConfirmLogout = async () => {
        setShowLogoutDialog(false);

        try {
            await logout();
        } finally {
            window.location.replace("/");
        }
    };

    const itemClass =
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-green-50/60 hover:text-green-600 dark:text-slate-300 dark:hover:bg-white/[0.05] dark:hover:text-green-400";

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((open) => !open)}
                aria-label="Open profile menu"
                aria-expanded={open}
                title={displayName}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-green-100/80 text-xs font-semibold tracking-wide text-green-700 shadow-sm transition hover:bg-green-200/80 focus:outline-none focus:ring-2 focus:ring-green-200 dark:border-white/10 dark:bg-green-950/70 dark:text-green-300 dark:hover:bg-green-900"
            >
                {initials}
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

                    <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-white/70 bg-white/90 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90">
                        <div className="flex items-center gap-3 border-b border-slate-100/70 px-4 py-3 dark:border-white/10">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-semibold tracking-wide text-green-700 dark:bg-green-950 dark:text-green-300">
                                {initials}
                            </div>

                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                                    {displayName}
                                </p>

                                <p className="mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500">
                                    {user?.email || ""}
                                </p>
                            </div>
                        </div>

                        <div className="p-1.5">
                            <Link to="/profile" onClick={() => setOpen(false)} className={itemClass}>
                                <User size={16} /> Profile
                            </Link>

                            <Link to="/settings" onClick={() => setOpen(false)} className={itemClass}>
                                <Settings size={16} /> Settings
                            </Link>
                        </div>

                        <div className="border-t border-slate-100/70 p-1.5 dark:border-white/10">
                            <button
                                type="button"
                                onClick={handleLogoutClick}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-500 transition hover:bg-red-50/70 dark:text-red-400 dark:hover:bg-red-950/40"
                            >
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    </div>
                </>
            )}

            <ConfirmDialog
                isOpen={showLogoutDialog}
                title="Log out?"
                message="Are you sure you want to log out of your account?"
                confirmText="Log out"
                onConfirm={handleConfirmLogout}
                onCancel={() => setShowLogoutDialog(false)}
            />
        </div>
    );
}

export default ProfileMenu;