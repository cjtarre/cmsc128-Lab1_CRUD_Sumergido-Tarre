import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    ListTodo,
    LogOut,
} from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import ConfirmDialog from "../common/ConfirmDialog";

function Navbar() {
    const [collapsed, setCollapsed] = useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    const navigate = useNavigate();

    const navigationItems = [
        {
            to: "/dashboard",
            label: "Dashboard",
            icon: ListTodo,
        },
        {
            to: "/calendar",
            label: "Calendar",
            icon: CalendarDays,
        },
    ];

    const handleConfirmLogout = () => {
        setShowLogoutDialog(false);
        navigate("/");
    };

    return (
        <nav
            className={`sticky top-16 flex h-[calc(100vh-4rem)] shrink-0 flex-col border-r border-slate-200 bg-white px-3 py-6 transition-all duration-100 ${
                collapsed ? "w-20" : "w-56"
            }`}
        >
            {/* Navigation Items */}
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
                                        ? "bg-green-50 text-green-600"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-green-600"
                                }`
                            }
                        >
                            <Icon size={18} />

                            {!collapsed && (
                                <span>{item.label}</span>
                            )}
                        </NavLink>
                    );
                })}
            </div>

            {/* Logout */}
            <div className="mt-auto">
                <button
                    type="button"
                    onClick={() => setShowLogoutDialog(true)}
                    title="Logout"
                    aria-label="Logout"
                    className={`flex w-full items-center rounded-lg py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-50 hover:text-red-500 ${
                        collapsed
                            ? "justify-center"
                            : "gap-3 px-3"
                    }`}
                >
                    <LogOut size={18} />

                    {!collapsed && <span>Logout</span>}
                </button>
            </div>

            {/* Collapse / Expand Button */}
            <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                title={
                    collapsed
                        ? "Expand navigation"
                        : "Collapse navigation"
                }
                aria-label={
                    collapsed
                        ? "Expand navigation"
                        : "Collapse navigation"
                }
                className="absolute -right-3 top-8 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-green-50 hover:text-green-600"
            >
                {collapsed ? (
                    <ChevronRight size={14} />
                ) : (
                    <ChevronLeft size={14} />
                )}
            </button>

            {/* Logout Confirmation */}
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