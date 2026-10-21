import { Check, ChevronDown, Users } from "lucide-react";

import { useDropdown } from "../../../../shared/hooks/useDropdown";

function CalendarMemberFilter({ options, selectedId, onChange }) {
    const { open, ref, toggle, select } = useDropdown();
    const selectedOption = options.find((option) => option.id === String(selectedId)) || options[0];

    return (
        <div ref={ref} className="relative z-30 w-full sm:w-48">
            <button type="button" onClick={toggle} aria-haspopup="listbox" aria-expanded={open}
                className="flex h-10 w-full items-center gap-2 rounded-xl border border-white/70 bg-white/55 px-3 text-left shadow-sm backdrop-blur-xl transition hover:bg-white/75 focus:outline-none focus:ring-2 focus:ring-green-100/70 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.06] dark:focus:ring-green-900/30">
                {selectedOption.initials
                    ? <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-50 text-[7px] font-bold text-green-600 dark:bg-green-950/50 dark:text-green-400">{selectedOption.initials}</span>
                    : <Users size={13} className="shrink-0 text-green-500" />}

                <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-600 dark:text-slate-300">{selectedOption.name}</span>
                <ChevronDown size={13} className={`shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div role="listbox" aria-label="Filter calendar by assignee"
                    className="absolute right-0 top-full z-50 mt-1.5 max-h-60 w-full min-w-48 overflow-y-auto rounded-xl border border-white/80 bg-white/95 p-1.5 shadow-[0_12px_35px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95 dark:shadow-black/30">
                    {options.map((option) => {
                        const selected = String(selectedId) === option.id;

                        return (
                            <button key={option.id} type="button" role="option" aria-selected={selected}
                                onClick={() => select(() => onChange(option.id))}
                                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition ${selected ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300" : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/[0.05]"}`}>
                                {option.initials
                                    ? <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[8px] font-bold ${selected ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" : "bg-slate-100 text-slate-500 dark:bg-white/[0.06] dark:text-slate-400"}`}>{option.initials}</span>
                                    : <span className="flex h-6 w-6 shrink-0 items-center justify-center"><Users size={13} className="text-green-500" /></span>}

                                <span className="min-w-0 flex-1 truncate text-xs font-medium">{option.name}</span>
                                {selected && <Check size={13} className="shrink-0 text-green-500" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default CalendarMemberFilter;
