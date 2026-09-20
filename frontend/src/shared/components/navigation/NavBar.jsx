import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    ListTodo,
    LogOut,
} from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../../features/auth/hooks/useAuth";

import ConfirmDialog from "../common/ConfirmDialog";

function Navbar() {
    const [collapsed, setCollapsed] = useState(true);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const { logout } = useAuth();
    const navigate = useNavigate();

    const navigationItems = [
        { to: "/dashboard", label: "Dashboard", icon: ListTodo },
        { to: "/calendar", label: "Calendar", icon: CalendarDays },
    ];

    const handleConfirmLogout = async () => {
        setShowLogoutDialog(false);

        try {
            await logout();
        } finally {
            navigate("/", { replace: true });
        }
    };

    return (
        <nav
            className={`sticky top-16 flex h-[calc(100vh-4rem)] shrink-0 flex-col border-r border-slate-200 bg-white px-3 py-6 transition-all duration-100 dark:border-slate-700 dark:bg-slate-900 ${
                collapsed ? "w-20" : "w-56"
            }`}
        >
            <div className="space-y-1">
                {navigationItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            title={item.label}
                            className={({ isActive }) =>
                                `flex w-full items-center rounded-lg py-2.5 text-sm font-medium transition ${
                                    collapsed
                                        ? "justify-center"
                                        : "gap-3 px-3"
                                } ${
                                    isActive
                                        ? "bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-green-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-green-400"
                                }`
                            }
                        >
                            <Icon size={18} />
                            {!collapsed && <span>{item.label}</span>}
                        </NavLink>
                    );
                })}
            </div>

            <div className="mt-auto">
                <button
                    type="button"
                    onClick={() => setShowLogoutDialog(true)}
                    title="Logout"
                    aria-label="Logout"
                    className={`flex w-full items-center rounded-lg py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-50 hover:text-red-500 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300 ${
                        collapsed ? "justify-center" : "gap-3 px-3"
                    }`}
                >
                    <LogOut size={18} />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>

            <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                title={collapsed ? "Expand navigation" : "Collapse navigation"}
                aria-label={
                    collapsed ? "Expand navigation" : "Collapse navigation"
                }
                className="absolute -right-3 top-8 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-green-50 hover:text-green-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-green-950 dark:hover:text-green-400"
            >
                {collapsed ? (
                    <ChevronRight size={14} />
                ) : (
                    <ChevronLeft size={14} />
                )}
            </button>

            <ConfirmDialog
                isOpen={showLogoutDialog}
                title="Log out?"
                message="Are you sure you want to log out of your account?"
                confirmText="Log out"
                onConfirm={handleConfirmLogout}
                onCancel={() => setShowLogoutDialog(false)}
            />
        </nav>
    );
}

export default Navbar;