import { DEFAULT_DURATIONS, getDurationMinutes } from "./focusTimer";

const weekdayLabel = new Intl.DateTimeFormat(undefined, { weekday: "short" });

export function readFocusValue(storage, key, fallback) {
    try {
        return JSON.parse(window[storage].getItem(key)) ?? fallback;
    } catch {
        return fallback;
    }
}

export function writeFocusValue(storage, key, value) {
    try {
        if (value === null) window[storage].removeItem(key);
        else window[storage].setItem(key, JSON.stringify(value));
        return true;
    } catch {
        // The timer and playlist still work when browser storage is unavailable.
        return false;
    }
}

function recentFocusDates(now) {
    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(now);
        date.setDate(date.getDate() - (6 - index));
        return date;
    });
}

export function keepRecentFocusSessions(sessions, now) {
    const dates = new Set(recentFocusDates(now).map((date) => date.toDateString()));
    return sessions.filter(({ completedAt }) => dates.has(new Date(completedAt).toDateString()));
}

export function readFocusHistory(key, now) {
    const saved = readFocusValue("localStorage", key, null);
    const sessions = Array.isArray(saved?.sessions) ? saved.sessions : [];
    return keepRecentFocusSessions(
        sessions.map((entry) => Number.isFinite(entry)
            ? { completedAt: entry, minutes: DEFAULT_DURATIONS.focus }
            : { completedAt: entry?.completedAt, minutes: getDurationMinutes("focus", entry?.minutes) }
        ).filter((entry) => Number.isFinite(entry.completedAt)),
        now
    );
}

export function summarizeFocusWeek(sessions, now = new Date()) {
    const totals = new Map();
    for (const { completedAt, minutes } of sessions) {
        const day = new Date(completedAt).toDateString();
        totals.set(day, (totals.get(day) ?? 0) + minutes);
    }
    return recentFocusDates(now).map((date) => ({
        day: date.toDateString(),
        label: weekdayLabel.format(date),
        minutes: totals.get(date.toDateString()) ?? 0,
    }));
}
