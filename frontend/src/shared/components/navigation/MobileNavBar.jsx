import { CalendarDays, CheckSquare, FolderKanban } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";


const links = [
    { to: "/my-tasks", label: "Tasks", icon: CheckSquare },
    { to: "/projects", label: "Projects", icon: FolderKanban },
    { to: "/calendar", label: "Calendar", icon: CalendarDays },
];

function MobileNavbar() {
    const { pathname } = useLocation();
    const reduceMotion = useReducedMotion();

    const activeIndex = links.findIndex(({ to }) =>
        to === "/my-tasks"
            ? pathname === "/my-tasks"
            : pathname.startsWith(to)
    );

    return (
        <nav
            aria-label="Mobile navigation"
            className="pointer-events-auto relative z-10 mx-auto w-[calc(100%_-_2rem)] max-w-md rounded-[22px] border border-white/75 bg-white/80 px-1.5 py-1.5 shadow-[0_14px_38px_rgba(15,23,42,0.16)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/80 dark:shadow-[0_14px_38px_rgba(0,0,0,0.38)] xl:hidden"
        >
            <div className="relative mx-auto flex max-w-md items-stretch justify-around gap-0.5">
                {activeIndex >= 0 && (
                    <motion.div
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-0 top-0 rounded-2xl bg-green-100/80 shadow-[0_4px_14px_rgba(34,197,94,0.10)] dark:bg-green-950/55"
                        initial={false}
                        animate={{ left: `${activeIndex * (100 / links.length)}%` }}
                        transition={
                            reduceMotion
                                ? { duration: 0 }
                                : { duration: 0.18, ease: [0.22, 1, 0.36, 1] }
                        }
                        style={{ width: "33.3333%" }}
                    />
                )}

                {links.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `relative z-10 flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[9px] font-medium transition-colors duration-100 ${
                                isActive
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <motion.span
                                    className="relative"
                                    initial={false}
                                    animate={
                                        reduceMotion
                                            ? { y: 0, scale: 1 }
                                            : isActive
                                                ? { y: -1, scale: 1.04 }
                                                : { y: 0, scale: 1 }
                                    }
                                    transition={{ duration: reduceMotion ? 0 : 0.12, ease: "easeOut" }}
                                >
                                    <Icon
                                        size={18}
                                        strokeWidth={isActive ? 2.5 : 2}
                                        aria-hidden="true"
                                    />

                                </motion.span>

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