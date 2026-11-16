import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, Check, ChevronLeft, ChevronRight, Clock3 } from "lucide-react";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const TWO_DIGITS = (number) => String(number).padStart(2, "0");

function parseDate(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
    if (!match) return null;
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    const date = new Date(year, month, day);
    return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day ? date : null;
}

function dateValue(date) {
    return `${date.getFullYear()}-${TWO_DIGITS(date.getMonth() + 1)}-${TWO_DIGITS(date.getDate())}`;
}

function parseTime(value) {
    const match = /^(\d{2}):(\d{2})$/.exec(value || "");
    if (!match) return null;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours > 23 || minutes > 59) return null;
    return { hour: hours % 12 || 12, minute: minutes, period: hours >= 12 ? "PM" : "AM" };
}

function timeValue({ hour, minute, period }) {
    const hours = (Number(hour) % 12) + (period === "PM" ? 12 : 0);
    return `${TWO_DIGITS(hours)}:${TWO_DIGITS(minute)}`;
}

function displayValue(type, value) {
    if (type === "date") {
        const date = parseDate(value);
        return date ? `${TWO_DIGITS(date.getDate())}/${TWO_DIGITS(date.getMonth() + 1)}/${date.getFullYear()}` : "dd/mm/yyyy";
    }
    const time = parseTime(value);
    return time ? `${TWO_DIGITS(time.hour)}:${TWO_DIGITS(time.minute)} ${time.period}` : "--:-- --";
}

// The value and onChange contract stays identical to <input type="date/time">.
// The popup is portalled above task modals so it is not clipped by their scroll containers.
function TaskDateTimePicker({
    type, name, id, value, onChange, disabled = false, className = "", style,
    ariaLabel, "aria-invalid": invalid,
}) {
    const isDate = type === "date";
    const selectedDate = parseDate(value);
    const [open, setOpen] = useState(false);
    const [visibleMonth, setVisibleMonth] = useState(() => selectedDate || new Date());
    const [draftTime, setDraftTime] = useState(() => parseTime(value) || { hour: 9, minute: 0, period: "AM" });
    const [position, setPosition] = useState(null);
    const triggerRef = useRef(null);
    const popupRef = useRef(null);
    const listId = useId();

    const openPicker = () => {
        if (disabled) return;
        if (!open) {
            setVisibleMonth(parseDate(value) || new Date());
            const now = new Date();
            setDraftTime(parseTime(value) || {
                hour: now.getHours() % 12 || 12,
                minute: now.getMinutes(),
                period: now.getHours() >= 12 ? "PM" : "AM",
            });
        }
        setOpen((previous) => !previous);
    };

    const updatePosition = useCallback(() => {
        const rect = triggerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const width = Math.min(isDate ? 308 : 280, window.innerWidth - 16);
        const desiredHeight = isDate ? 326 : 288;
        const above = window.innerHeight - rect.bottom < desiredHeight + 12 && rect.top > desiredHeight + 12;
        const top = above ? Math.max(8, rect.top - desiredHeight - 6) : rect.bottom + 6;
        setPosition({
            top,
            left: Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)),
            width,
            maxHeight: Math.max(120, above ? rect.top - 14 : window.innerHeight - top - 8),
        });
    }, [isDate]);

    useLayoutEffect(() => {
        if (!open) return;
        updatePosition();
        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition, true);
        return () => {
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition, true);
        };
    }, [open, updatePosition]);

    useEffect(() => {
        if (!open) return;
        const closeOutside = (event) => {
            if (!triggerRef.current?.contains(event.target) && !popupRef.current?.contains(event.target)) {
                setOpen(false);
            }
        };
        const closeOnKey = (event) => {
            if (event.key === "Escape") {
                setOpen(false);
                triggerRef.current?.focus();
            }
        };
        document.addEventListener("pointerdown", closeOutside);
        document.addEventListener("keydown", closeOnKey);
        return () => {
            document.removeEventListener("pointerdown", closeOutside);
            document.removeEventListener("keydown", closeOnKey);
        };
    }, [open]);

    const emit = (nextValue) => {
        onChange?.({ target: { name, value: nextValue } });
        setOpen(false);
        triggerRef.current?.focus();
    };

    const monthDays = useMemo(() => {
        const year = visibleMonth.getFullYear();
        const month = visibleMonth.getMonth();
        const start = new Date(year, month, 1).getDay();
        const count = new Date(year, month + 1, 0).getDate();
        return [
            ...Array.from({ length: start }, () => null),
            ...Array.from({ length: count }, (_, index) => new Date(year, month, index + 1)),
        ];
    }, [visibleMonth]);

    const moveMonth = (delta) => {
        setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
    };

    const pickDate = (
        <>
            <div className="flex items-center justify-between gap-2 px-1 pb-3">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                    {visibleMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
                <div className="flex gap-1">
                    <button type="button" aria-label="Previous month" onClick={() => moveMonth(-1)} className="rounded-lg p-1.5 text-slate-500 hover:bg-green-50 hover:text-green-600 dark:text-slate-400 dark:hover:bg-white/[0.07]"><ChevronLeft size={13} /></button>
                    <button type="button" aria-label="Next month" onClick={() => moveMonth(1)} className="rounded-lg p-1.5 text-slate-500 hover:bg-green-50 hover:text-green-600 dark:text-slate-400 dark:hover:bg-white/[0.07]"><ChevronRight size={13} /></button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-0.5 text-center">
                {WEEKDAYS.map((day) => <span key={day} className="py-1 text-[9px] font-medium text-slate-400 dark:text-slate-500">{day}</span>)}
                {monthDays.map((date, index) => date ? (
                    <button key={dateValue(date)} type="button"
                        aria-label={date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        aria-pressed={value === dateValue(date)}
                        onClick={() => emit(dateValue(date))}
                        className={`flex h-8 items-center justify-center rounded-lg text-[10px] transition ${
                            value === dateValue(date)
                                ? "bg-green-500 font-semibold text-white"
                                : dateValue(date) === dateValue(new Date())
                                    ? "bg-green-50 font-semibold text-green-700 hover:bg-green-100 dark:bg-green-950/50 dark:text-green-300"
                                    : "text-slate-600 hover:bg-green-50 hover:text-green-700 dark:text-slate-300 dark:hover:bg-white/[0.06]"
                        }`}>{date.getDate()}</button>
                ) : <span key={`blank-${index}`} />)}
            </div>
            <div className="mt-3 flex justify-between border-t border-slate-100/70 pt-2 dark:border-white/10">
                <button type="button" onClick={() => emit("")} className="rounded-lg px-2.5 py-1.5 text-[10px] font-medium text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04]">Clear</button>
                <button type="button" onClick={() => emit(dateValue(new Date()))} className="rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950/30">Today</button>
            </div>
        </>
    );

    const timeColumns = [
        { label: "Hour", values: Array.from({ length: 12 }, (_, index) => index + 1), key: "hour" },
        { label: "Minute", values: Array.from({ length: 60 }, (_, index) => index), key: "minute" },
        { label: "AM / PM", values: ["AM", "PM"], key: "period" },
    ];

    const pickTime = (
        <>
            <div className="flex items-center justify-between border-b border-slate-100/70 pb-2 dark:border-white/10">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">Choose time</span>
                <span className="text-[11px] font-semibold text-green-600 dark:text-green-400">{TWO_DIGITS(draftTime.hour)}:{TWO_DIGITS(draftTime.minute)} {draftTime.period}</span>
            </div>
            <div className="mt-2 grid grid-cols-[1fr_1fr_0.85fr] gap-2">
                {timeColumns.map(({ label, values, key }) => (
                    <div key={key} className="min-w-0">
                        <div className="pb-1 text-center text-[9px] font-medium text-slate-400 dark:text-slate-500">{label}</div>
                        <div className="max-h-[154px] space-y-0.5 overflow-y-auto rounded-xl bg-slate-50/65 p-1 dark:bg-white/[0.035]">
                            {values.map((item) => (
                                <button key={item} type="button"
                                    aria-pressed={draftTime[key] === item}
                                    onClick={() => setDraftTime((current) => ({ ...current, [key]: item }))}
                                    className={`flex h-7 w-full items-center justify-center rounded-lg text-[10px] transition ${draftTime[key] === item
                                        ? "bg-green-100 font-semibold text-green-700 dark:bg-green-950/60 dark:text-green-300"
                                        : "text-slate-500 hover:bg-white hover:text-green-700 dark:text-slate-400 dark:hover:bg-white/[0.07]"}`}>{key === "period" ? item : TWO_DIGITS(item)}</button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100/70 pt-2 dark:border-white/10">
                <button type="button" onClick={() => emit("")} className="rounded-lg px-2.5 py-1.5 text-[10px] font-medium text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04]">Clear</button>
                <button type="button" onClick={() => emit(timeValue(draftTime))} className="inline-flex items-center gap-1 rounded-lg bg-green-500 px-3 py-1.5 text-[10px] font-semibold text-white transition hover:bg-green-600"><Check size={11} /> Set time</button>
            </div>
        </>
    );

    return (
        <>
            <button type="button" id={id} ref={triggerRef} name={name} value={value || ""}
                aria-label={ariaLabel || (isDate ? "Due Date" : "Due Time")}
                aria-invalid={invalid}
                aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? listId : undefined}
                disabled={disabled} onClick={openPicker}
                className={`${className} flex items-center justify-between gap-1.5 text-left disabled:cursor-not-allowed disabled:opacity-50`}
                style={{ ...style, appearance: "none", WebkitAppearance: "none", fontFamily: "inherit", fontSize: "11px", lineHeight: "1.2" }}>
                <span className={`truncate ${!value ? "text-slate-400 dark:text-slate-500" : ""}`}>{displayValue(type, value)}</span>
                {isDate ? <CalendarDays size={13} className="shrink-0 text-slate-400 dark:text-slate-500" /> : <Clock3 size={13} className="shrink-0 text-slate-400 dark:text-slate-500" />}
            </button>
            {open && createPortal(
                <div id={listId} ref={popupRef} role="dialog" aria-label={isDate ? "Choose due date" : "Choose due time"}
                    className="fixed z-[10020] overflow-y-auto rounded-2xl border border-white/80 bg-white/95 p-3 shadow-[0_18px_50px_rgba(15,23,42,0.18)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/95 dark:shadow-black/40"
                    style={position || { top: 0, left: 0, width: 280, maxHeight: 340, visibility: "hidden" }}>
                    {isDate ? pickDate : pickTime}
                </div>,
                document.body
            )}
        </>
    );
}

export default TaskDateTimePicker;
