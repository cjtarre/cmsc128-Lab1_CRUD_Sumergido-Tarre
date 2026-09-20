import { NavLink } from "react-router-dom";
import { CheckSquare, CalendarDays, Bell, User } from "lucide-react";

const links = [
    { to: "/dashboard", label: "Tasks", icon: CheckSquare },
    { to: "/calendar", label: "Calendar", icon: CalendarDays },
    { to: "/notifications", label: "Alerts", icon: Bell },
    { to: "/profile", label: "Profile", icon: User },
];

function MobileNavbar() {
    return (
        <nav className="sticky bottom-3 left-3 right-3 z-40 rounded-2xl border border-slate-200 bg-white/95 px-2 py-1.5 shadow-lg backdrop-blur xl:hidden">
            <div className="mx-auto flex max-w-md items-center justify-around gap-1">
                {links.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex flex-1 flex-col items-center gap-1 rounded-xl py-2.5 text-[10px] font-medium transition ${
                                isActive
                                    ? "bg-green-50 text-green-600"
                                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <Icon
                                    size={19}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                <span>{label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}

export default MobileNavbar;