import { Bell, LogOut, Settings, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ConfirmDialog from "../common/ConfirmDialog";
import { useAuth } from "../../../features/auth/hooks/useAuth";

function ProfileMenu() {
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const navigate = useNavigate();

    const handleLogoutClick = () => {
        setOpen(false);
        setShowLogoutDialog(true);
    };

    const handleConfirmLogout = async () => {
        setShowLogoutDialog(false);

        try {
            await logout();
        } finally {
            navigate("/", { replace: true });
        }
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                aria-label="Open profile menu"
                aria-expanded={open}
                title="Profile"
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-green-50 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-100 dark:text-slate-400 dark:hover:bg-green-950 dark:hover:text-green-400 dark:focus:ring-green-900"
            >
                <User size={19} strokeWidth={1.8} />
            </button>

            {open && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpen(false)}
                    />

                    <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
                        <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-700">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                {user?.display_name ||
                                    user?.username ||
                                    "User"}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500">
                                {user?.email || ""}
                            </p>
                        </div>

                        <div className="p-1.5">
                            <Link
                                to="/profile"
                                onClick={() => setOpen(false)}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-green-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-green-400"
                            >
                                <User size={16} />
                                Profile
                            </Link>

                            <Link
                                to="/settings"
                                onClick={() => setOpen(false)}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-green-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-green-400"
                            >
                                <Settings size={16} />
                                Settings
                            </Link>

                            <Link
                                to="/notifications"
                                onClick={() => setOpen(false)}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-green-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-green-400"
                            >
                                <Bell size={16} />
                                Notifications
                            </Link>
                        </div>

                        <div className="border-t border-slate-100 p-1.5 dark:border-slate-700">
                            <button
                                type="button"
                                onClick={handleLogoutClick}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-500 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                            >
                                <LogOut size={16} />
                                Logout
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