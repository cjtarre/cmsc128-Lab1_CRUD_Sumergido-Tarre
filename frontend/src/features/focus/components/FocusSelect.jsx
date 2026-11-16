import { ChevronDown } from "lucide-react";

import { focusControlStyle } from "../utils/focusControlStyle";

function FocusSelect({ className = "", children, ...props }) {
    return (
        <div className={`relative min-w-0 ${className}`}>
            <select {...props} style={focusControlStyle}
                className="h-9 w-full cursor-pointer truncate rounded-lg border border-white/75 bg-white/55 py-1.5 pr-7 pl-2.5 text-slate-800 outline-none hover:bg-white/80 focus-visible:ring-2 focus-visible:ring-emerald-500/60 disabled:cursor-default disabled:opacity-70 dark:border-white/15 dark:bg-slate-900 dark:text-slate-200">
                {children}
            </select>
            <ChevronDown aria-hidden="true" size={14} className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
        </div>
    );
}

export default FocusSelect;
