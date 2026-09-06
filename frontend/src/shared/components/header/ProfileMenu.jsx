import { Bell, LogOut, Settings, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ConfirmDialog from "../common/ConfirmDialog";

function ProfileMenu() {
    const [open, setOpen] = useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const navigate = useNavigate();

    const handleLogoutClick = () => {
        setOpen(false);
        setShowLogoutDialog(true);
    };

    const handleConfirmLogout = () => {
        setShowLogoutDialog(false);
        navigate("/");
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                aria-label="Open profile menu"
                aria-expanded={open}
                title="Profile"
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-green-50 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-100"
            >
                <User size={19} strokeWidth={1.8} />
            </button>

            {open && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpen(false)}
                    />

                    <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                        <div className="border-b border-slate-100 px-4 py-3">
                            <p className="text-sm font-semibold text-slate-800">Student</p>
                            <p className="mt-0.5 text-xs text-slate-400">student@studyboard.com</p>
                        </div>

                        <div className="p-1.5">
                            <Link
                                to="/profile"
                                onClick={() => setOpen(false)}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-green-600"
                            >
                                <User size={16} /> Profile
                            </Link>

                            <Link
                                to="/settings"
                                onClick={() => setOpen(false)}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-green-600"
                            >
                                <Settings size={16} /> Settings
                            </Link>

                            <Link
                                to="/notifications"
                                onClick={() => setOpen(false)}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-green-600"
                            >
                                <Bell size={16} /> Notifications
                            </Link>
                        </div>

                        <div className="border-t border-slate-100 p-1.5">
                            <button
                                type="button"
                                onClick={handleLogoutClick}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-500 transition hover:bg-red-50"
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