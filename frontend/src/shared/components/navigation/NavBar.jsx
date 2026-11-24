import { CalendarDays, ChevronLeft, ChevronRight, FolderKanban, ListTodo, LogOut, Target } from "lucide-react";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { NavLink, useLocation } from "react-router-dom";
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
    const { pathname } = useLocation();
    const reduceMotion = useReducedMotion();

    const activeIndex = navigationItems.findIndex(({ to }) =>
        to === "/my-tasks"
            ? pathname === "/my-tasks"
            : pathname.startsWith(to)
    );

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
            <div className="relative space-y-1">
                {activeIndex >= 0 && (
                    <motion.div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 h-10 rounded-xl bg-green-100/70 shadow-sm dark:bg-green-950/50"
                        initial={false}
                        animate={{ y: activeIndex * 44 }}
                        transition={
                            reduceMotion
                                ? { duration: 0 }
                                : { duration: 0.18, ease: [0.22, 1, 0.36, 1] }
                        }
                    />
                )}

                {navigationItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        title={label}
                        className={({ isActive }) =>
                            `relative z-10 flex h-10 w-full items-center overflow-hidden rounded-xl text-sm font-medium transition-colors duration-100 ${collapsed ? "justify-center" : "gap-3 px-3"} ${
                                isActive
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-slate-500 hover:bg-white/60 hover:text-green-600 dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-green-400"
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <motion.span
                                    className="shrink-0"
                                    initial={false}
                                    animate={
                                        reduceMotion
                                            ? { scale: 1 }
                                            : isActive
                                                ? { scale: 1.04 }
                                                : { scale: 1 }
                                    }
                                    transition={{ duration: reduceMotion ? 0 : 0.12, ease: "easeOut" }}
                                >
                                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                </motion.span>
                                <motion.span
                                    aria-hidden={collapsed}
                                    className="min-w-0 whitespace-nowrap overflow-hidden text-sm"
                                    initial={false}
                                    animate={{
                                        width: collapsed ? 0 : 140,
                                        opacity: collapsed ? 0 : 1,
                                    }}
                                    transition={
                                        reduceMotion
                                            ? { duration: 0 }
                                            : { duration: 0.18, ease: [0.22, 1, 0.36, 1] }
                                    }
                                >
                                    {label}
                                </motion.span>
                            </>
                        )}
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