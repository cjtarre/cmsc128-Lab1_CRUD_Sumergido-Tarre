import { Mail, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/hooks/useAuth";
import ConfirmDialog from "../../../shared/components/common/ConfirmDialog";

function Profile() {
    const { user, authLoading, logout } = useAuth();
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const navigate = useNavigate();

    const handleConfirmLogout = async () => {
        setShowLogoutDialog(false);

        try {
            await logout();
        } finally {
            navigate("/", { replace: true });
        }
    };

    if (authLoading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                <div className="flex items-center gap-3 text-sm text-slate-400 dark:text-slate-500">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-green-500 dark:border-slate-700 dark:border-t-green-400" />
                    Loading profile...
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-2xl space-y-6">
            <div>
                <h1 className="text-xl font-semibold text-slate-800 dark:text-white sm:text-2xl">
                    Profile
                </h1>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 sm:text-sm">
                    View your account information.
                </p>
            </div>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:rounded-2xl">
                <div className="flex items-center gap-4 border-b border-slate-100 px-5 py-5 dark:border-slate-700 sm:px-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-500 dark:bg-green-950/50 dark:text-green-400">
                        <User size={22} />
                    </div>

                    <div className="min-w-0">
                        <h2 className="truncate text-base font-semibold text-slate-800 dark:text-slate-100">
                            {user?.display_name || user?.username || "User"}
                        </h2>

                        {user?.username && (
                            <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                                @{user.username}
                            </p>
                        )}
                    </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {user?.display_name && (
                        <div className="px-5 py-4 sm:px-6">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                Display Name
                            </p>
                            <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                                {user.display_name}
                            </p>
                        </div>
                    )}

                    {user?.username && (
                        <div className="px-5 py-4 sm:px-6">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                Username
                            </p>
                            <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                                {user.username}
                            </p>
                        </div>
                    )}

                    {user?.email && (
                        <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
                            <Mail
                                size={16}
                                className="shrink-0 text-slate-400 dark:text-slate-500"
                            />
                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                    Email
                                </p>
                                <p className="mt-1 truncate text-sm text-slate-700 dark:text-slate-200">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <button
                type="button"
                onClick={() => setShowLogoutDialog(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-white px-4 py-3 text-sm font-medium text-red-500 transition hover:border-red-200 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-100 dark:border-red-900/50 dark:bg-slate-900 dark:text-red-400 dark:hover:border-red-800 dark:hover:bg-red-950/30 dark:focus:ring-red-900"
            >
                <LogOut size={16} />
                Log Out
            </button>

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

export default Profile;