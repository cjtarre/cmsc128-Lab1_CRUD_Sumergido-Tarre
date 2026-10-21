import { Check, ChevronDown } from "lucide-react";

import { useDropdown } from "../../../../shared/hooks/useDropdown";
import { getDisplayName } from "../../../../shared/utils/userUtils";
import { EDITABLE_PROJECT_ROLES } from "../../constants/projectOptions";

function RoleDropdown({ member, onChange }) {
    const { open, ref, toggle, select } = useDropdown();

    return (
        <div ref={ref} className="relative shrink-0">
            {/* Mobile */}
            <div className="relative h-7 sm:hidden">
                <button type="button" onClick={toggle} aria-haspopup="listbox" aria-expanded={open}
                    className={`flex h-7 items-center rounded-full border font-medium capitalize transition ${open ? "invisible gap-1.5 px-2.5" : "gap-1.5 border-slate-100/80 bg-slate-50/70 px-2.5 text-slate-500 hover:border-green-200 hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400"}`}
                    style={{ fontSize: "11px", lineHeight: "1" }}>
                    {member.role}
                    <ChevronDown size={10} className="text-slate-400" />
                </button>

                {open && (
                    <div role="listbox" aria-label={`Role for ${getDisplayName(member)}`}
                        className="absolute right-0 top-0 z-20 flex h-7 items-center whitespace-nowrap rounded-full border border-green-100/80 bg-white/95 p-0.5 shadow-sm backdrop-blur-xl dark:border-green-900/40 dark:bg-slate-900/95">
                        {EDITABLE_PROJECT_ROLES.map((role) => {
                            const selected = member.role === role;

                            return (
                                <button key={role} type="button" role="option" aria-selected={selected}
                                    onClick={() => select(() => role !== member.role && onChange(member.user_id, role))}
                                    className={`flex h-6 items-center gap-1 rounded-full px-2 font-medium capitalize transition ${selected ? "bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400" : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"}`}
                                    style={{ fontSize: "10px", lineHeight: "1" }}>
                                    {role}
                                    {selected && <Check size={9} />}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Desktop */}
            <div className="hidden sm:block">
                <button type="button" onClick={toggle} aria-haspopup="listbox" aria-expanded={open}
                    className="flex h-8 min-w-[88px] items-center justify-between gap-2 rounded-lg border border-slate-100/80 bg-slate-50/60 px-2.5 font-medium capitalize text-slate-500 transition hover:border-green-200 hover:bg-white focus:outline-none focus:ring-2 focus:ring-green-100/60 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-400 dark:hover:border-green-900/50 dark:hover:bg-white/[0.055]"
                    style={{ fontSize: "11px", lineHeight: "1" }}>
                    <span>{member.role}</span>
                    <ChevronDown size={12} className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
                </button>

                {open && (
                    <div role="listbox" aria-label={`Role for ${getDisplayName(member)}`}
                        className="absolute right-0 top-full z-50 mt-1.5 w-32 overflow-hidden rounded-xl border border-white/80 bg-white/95 p-1.5 shadow-[0_12px_30px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95">
                        {EDITABLE_PROJECT_ROLES.map((role) => {
                            const selected = member.role === role;

                            return (
                                <button key={role} type="button" role="option" aria-selected={selected}
                                    onClick={() => select(() => role !== member.role && onChange(member.user_id, role))}
                                    className={`flex h-8 w-full items-center justify-between rounded-lg px-2.5 text-left font-medium capitalize transition ${selected ? "bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400" : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-white/[0.05]"}`}
                                    style={{ fontSize: "11px", lineHeight: "1" }}>
                                    {role}
                                    {selected && <Check size={12} />}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default RoleDropdown;
