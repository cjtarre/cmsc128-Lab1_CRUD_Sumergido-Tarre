import { Bell, CalendarDays, CheckSquare, FolderKanban, User } from "lucide-react";
import { NavLink } from "react-router-dom";

import { useNotifications } from "../../../features/notifications/context/NotificationContext";

const links = [
    { to: "/my-tasks", label: "Tasks", icon: CheckSquare },
    { to: "/projects", label: "Projects", icon: FolderKanban },
    { to: "/calendar", label: "Calendar", icon: CalendarDays },
    { to: "/notifications", label: "Alerts", icon: Bell },
    { to: "/profile", label: "Profile", icon: User },
];

function MobileNavbar() {
    const { unreadCount } = useNotifications();

    return (
        <nav className="sticky bottom-3 left-3 right-3 z-40 rounded-2xl border border-white/70 bg-white/75 px-2 py-1.5 shadow-[0_10px_35px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75 dark:shadow-black/30 xl:hidden">
            <div className="mx-auto flex max-w-md items-center justify-around gap-1">
                {links.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `relative flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl py-2.5 text-[10px] font-medium transition ${
                                isActive
                                    ? "bg-green-100/70 text-green-600 shadow-sm dark:bg-green-950/50 dark:text-green-400"
                                    : "text-slate-400 hover:bg-white/60 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-white/[0.05] dark:hover:text-slate-300"
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <span className="relative">
                                    <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />

                                    {to === "/notifications" && unreadCount > 0 && (
                                        <span className="absolute -right-2.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-bold leading-none text-white">
                                            {unreadCount > 9 ? "9+" : unreadCount}
                                        </span>
                                    )}
                                </span>

                                <span className="max-w-full truncate">{label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}

export default MobileNavbar;