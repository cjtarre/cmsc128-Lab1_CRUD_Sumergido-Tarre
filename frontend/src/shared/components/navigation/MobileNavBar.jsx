import { Bell, CalendarDays, CheckSquare, FolderKanban, User } from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
    { to: "/my-tasks", label: "Tasks", icon: CheckSquare },
    { to: "/projects", label: "Projects", icon: FolderKanban },
    { to: "/calendar", label: "Calendar", icon: CalendarDays },
    { to: "/notifications", label: "Alerts", icon: Bell },
    { to: "/profile", label: "Profile", icon: User },
];

function MobileNavbar() {
    return (
        <nav className="sticky bottom-3 left-3 right-3 z-40 rounded-2xl border border-white/70 bg-white/75 px-2 py-1.5 shadow-[0_10px_35px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75 dark:shadow-black/30 xl:hidden">
            <div className="mx-auto flex max-w-md items-center justify-around gap-1">
                {links.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl py-2.5 text-[10px] font-medium transition ${
                                isActive
                                    ? "bg-green-100/70 text-green-600 shadow-sm dark:bg-green-950/50 dark:text-green-400"
                                    : "text-slate-400 hover:bg-white/60 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-white/[0.05] dark:hover:text-slate-300"
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="truncate">{label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}

export default MobileNavbar;