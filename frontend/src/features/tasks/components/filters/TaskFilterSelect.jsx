import { ChevronDown } from "lucide-react";

function TaskFilterSelect({ value, onChange, children, className = "" }) {
    return (
        <div className={`relative min-w-0 shrink-0 ${className}`}>
            <select value={value} onChange={onChange}
                className="h-9 w-full appearance-none rounded-xl border border-white/80 bg-white/55 py-0 pl-3 pr-8 font-medium text-slate-500 outline-none transition hover:bg-white/75 focus:border-green-200 focus:ring-2 focus:ring-green-100/50 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-400 dark:hover:bg-white/[0.06] dark:focus:border-green-800 dark:focus:ring-green-900/30"
                style={{ fontSize: "12px", lineHeight: "1" }}>
                {children}
            </select>
            <ChevronDown size={12} strokeWidth={2} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
        </div>
    );
}

export default TaskFilterSelect;
