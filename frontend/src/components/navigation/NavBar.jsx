import { useState } from "react";
import {
    CalendarDays,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    ListTodo,
    Sun,
} from "lucide-react";

function Navbar() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <nav
            className={`sticky top-16 h-[calc(100vh-4rem)] shrink-0 border-r border-slate-200 bg-white px-3 py-6 transition-all duration-100 ${
                collapsed ? "w-20" : "w-56"
            }`}
        >
            {/* Navigation Items */}
            <div className="space-y-1">
                {/* Dashboard */}
                <button
                    type="button"
                    title="Dashboard"
                    className={`flex w-full items-center rounded-lg bg-green-50 py-2.5 text-sm font-medium text-green-600 transition ${
                        collapsed
                            ? "justify-center"
                            : "gap-3 px-3"
                    }`}
                >
                    <ListTodo size={18} />

                    {!collapsed && <span>Dashboard</span>}
                </button>

                {/* Calendar */}
                <button
                    type="button"
                    title="Calendar"
                    className={`flex w-full items-center rounded-lg py-2.5 text-sm text-slate-500 transition hover:bg-slate-50 hover:text-green-600 ${
                        collapsed
                            ? "justify-center"
                            : "gap-3 px-3"
                    }`}
                >
                    <CalendarDays size={18} />

                    {!collapsed && <span>Calendar</span>}
                </button>

                {/* Today */}
                <button
                    type="button"
                    title="Today"
                    className={`flex w-full items-center rounded-lg py-2.5 text-sm text-slate-500 transition hover:bg-slate-50 hover:text-green-600 ${
                        collapsed
                            ? "justify-center"
                            : "gap-3 px-3"
                    }`}
                >
                    <Sun size={18} />

                    {!collapsed && <span>Today</span>}
                </button>

                {/* Completed */}
                <button
                    type="button"
                    title="Completed"
                    className={`flex w-full items-center rounded-lg py-2.5 text-sm text-slate-500 transition hover:bg-slate-50 hover:text-green-600 ${
                        collapsed
                            ? "justify-center"
                            : "gap-3 px-3"
                    }`}
                >
                    <CheckCircle size={18} />

                    {!collapsed && <span>Completed</span>}
                </button>
            </div>

            {/* Tags */}
            {!collapsed && (
                <div className="mt-8">
                    <h2 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Tags
                    </h2>

                    <div className="space-y-1">
                        <button
                            type="button"
                            className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-500 transition hover:bg-slate-50 hover:text-green-600"
                        >
                            School
                        </button>

                        <button
                            type="button"
                            className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-500 transition hover:bg-slate-50 hover:text-green-600"
                        >
                            Personal
                        </button>

                        <button
                            type="button"
                            className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-500 transition hover:bg-slate-50 hover:text-green-600"
                        >
                            Others
                        </button>
                    </div>
                </div>
            )}

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
        </nav>
    );
}

export default Navbar;