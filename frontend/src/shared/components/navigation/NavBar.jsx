import { CalendarDays, ChevronLeft, ChevronRight, FolderKanban, ListTodo, LogOut, Target } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import ConfirmDialog from "../common/ConfirmDialog";

const navigationItems = [
    { to: "/my-tasks", label: "My Tasks", icon: ListTodo },
    { to: "/projects", label: "Projects", icon: FolderKanban },
    { to: "/calendar", label: "Calendar", icon: CalendarDays },
    { to: "/focus", label: "Focus Mode", icon: Target },
];

function Navbar() {
    const [collapsed, setCollapsed] = useState(true);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const { logout } = useAuth();

    const handleConfirmLogout = async () => {
        setShowLogoutDialog(false);
        try {
            await logout();
        } finally {
            window.location.replace("/");
        }
    };

    return (
        <nav className={`sticky top-16 flex h-[calc(100vh-4rem)] shrink-0 flex-col border-r border-white/60 bg-white/55 px-3 py-6 shadow-[4px_0_20px_rgba(15,23,42,0.025)] backdrop-blur-xl transition-all duration-200 dark:border-white/10 dark:bg-slate-950/55 ${collapsed ? "w-20" : "w-56"}`}>
            <div className="space-y-1">
                {navigationItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        title={label}
                        className={({ isActive }) =>
                            `flex w-full items-center rounded-xl py-2.5 text-sm font-medium transition ${collapsed ? "justify-center" : "gap-3 px-3"} ${
                                isActive
                                    ? "bg-green-100/70 text-green-600 shadow-sm dark:bg-green-950/50 dark:text-green-400"
                                    : "text-slate-500 hover:bg-white/60 hover:text-green-600 dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-green-400"
                            }`
                        }
                    >
                        <Icon size={18} />
                        {!collapsed && <span>{label}</span>}
                    </NavLink>
                ))}
            </div>

            <div className="mt-auto">
                <button
                    type="button"
                    onClick={() => setShowLogoutDialog(true)}
                    title="Logout"
                    aria-label="Logout"
                    className={`flex w-full items-center rounded-xl py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-50/60 hover:text-red-500 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300 ${collapsed ? "justify-center" : "gap-3 px-3"}`}
                >
                    <LogOut size={18} />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>

            <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                title={collapsed ? "Expand navigation" : "Collapse navigation"}
                aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
                className="absolute -right-3 top-8 flex h-6 w-6 items-center justify-center rounded-full border border-white/70 bg-white/80 text-slate-500 shadow-sm backdrop-blur-md transition hover:bg-green-50 hover:text-green-600 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-400 dark:hover:bg-green-950 dark:hover:text-green-400"
            >
                {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
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