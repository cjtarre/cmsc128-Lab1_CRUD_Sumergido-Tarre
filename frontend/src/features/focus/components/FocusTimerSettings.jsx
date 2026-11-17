import { useId, useRef } from "react";
import { MoreVertical } from "lucide-react";

import { useDropdown } from "../../../shared/hooks/useDropdown";
import { focusControlStyle } from "../styles/focusControlStyle";
import { MAX_DURATIONS } from "../constants/focusDurations";

const durationInput = "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm tabular-nums dark:border-white/15 dark:bg-slate-900";

function FocusTimerSettings({ durations, onSave }) {
    const { open, ref, toggle, close } = useDropdown();
    const panelId = useId();
    const trigger = useRef(null);

    function dismiss() {
        close();
        trigger.current?.focus();
    }

    function submit(event) {
        event.preventDefault();
        const fields = new FormData(event.currentTarget);
        onSave({ focus: Number(fields.get("focus")), break: Number(fields.get("break")) });
        dismiss();
    }

    return (
        <div ref={ref} className="relative" onKeyDown={(event) => {
            if (open && event.key === "Escape") dismiss();
        }}>
            <button type="button" ref={trigger} aria-label="Timer settings" title="Timer settings"
                aria-expanded={open} aria-controls={open ? panelId : undefined} onClick={toggle} style={focusControlStyle}
                className="flex size-9 items-center justify-center rounded-lg border border-white/75 bg-white/50 text-slate-700 hover:bg-white/80 focus-visible:outline-2 focus-visible:outline-green-700 dark:border-white/15 dark:bg-white/[0.06] dark:text-slate-200 dark:hover:bg-white/10">
                <MoreVertical size={18} aria-hidden="true" />
            </button>
            {open && (
                <form id={panelId} onSubmit={submit}
                    className="absolute top-full right-0 z-20 mt-2 w-60 max-w-[calc(100vw_-_3.5rem)] rounded-2xl border border-white/90 bg-white/95 p-4 shadow-xl backdrop-blur-xl dark:border-white/15 dark:bg-slate-900/95">
                    <p className="text-sm font-semibold">Timer settings</p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        <label className="min-w-0 text-xs font-medium text-slate-700 dark:text-slate-300">
                            Focus (min)
                            <input type="number" name="focus" inputMode="numeric" min="1" max={MAX_DURATIONS.focus}
                                required defaultValue={durations.focus} className={durationInput} style={focusControlStyle} />
                        </label>
                        <label className="min-w-0 text-xs font-medium text-slate-700 dark:text-slate-300">
                            Break (min)
                            <input type="number" name="break" inputMode="numeric" min="1" max={MAX_DURATIONS.break}
                                required defaultValue={durations.break} className={durationInput} style={focusControlStyle} />
                        </label>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                        <button type="button" onClick={dismiss} style={focusControlStyle} className="rounded-lg px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-white/10">Cancel</button>
                        <button type="submit" style={focusControlStyle} className="rounded-lg bg-green-700 px-2.5 py-1.5 font-semibold text-white hover:bg-green-800 dark:bg-green-400 dark:text-slate-950">Save durations</button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default FocusTimerSettings;
