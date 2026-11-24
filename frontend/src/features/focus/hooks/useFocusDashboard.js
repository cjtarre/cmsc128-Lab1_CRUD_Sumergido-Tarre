import { useEffect, useReducer, useState } from "react";

import {
    keepRecentFocusSessions, readFocusHistory, readFocusValue, summarizeFocusWeek, writeFocusValue,
} from "../utils/focusSessionStorage";
import { createFocusTimer, focusTimerReducer, getDurationMinutes } from "../utils/focusTimer";

function completeSession(sessions, timer, now) {
    if (timer.phase !== "focus" || timer.status !== "finished") return sessions;
    if (sessions.some((session) => session.completedAt === timer.completedAt)) return sessions;
    return keepRecentFocusSessions(
        [...sessions, { completedAt: timer.completedAt, minutes: timer.durationMinutes }], now
    );
}

function restoreDashboard({ sessionKey, dayKey, durationsKey }) {
    const savedDurations = readFocusValue("localStorage", durationsKey, null);
    const durations = {
        focus: getDurationMinutes("focus", savedDurations?.focus),
        break: getDurationMinutes("break", savedDurations?.break),
    };
    const savedSession = readFocusValue("sessionStorage", sessionKey, null);
    const endsAt = Number.isFinite(savedSession) ? savedSession : savedSession?.endsAt;
    const now = Date.now();
    const timer = Number.isFinite(endsAt)
        ? focusTimerReducer(
            { ...createFocusTimer("focus", savedSession?.durationMinutes), status: "running", endsAt },
            { type: "tick", now, endsAt }
        )
        : createFocusTimer("focus", durations.focus);
    return { timer, durations, sessions: completeSession(readFocusHistory(dayKey, now), timer, now) };
}

function dashboardReducer(dashboard, action) {
    if (action.type === "setDurations") {
        const { phase, status } = dashboard.timer;
        if (status === "running" || status === "paused") return dashboard;
        const durations = {
            focus: getDurationMinutes("focus", action.durations.focus),
            break: getDurationMinutes("break", action.durations.break),
        };

        return {
            ...dashboard,
            durations,
            timer: status === "ready" ? createFocusTimer(phase, durations[phase]) : dashboard.timer,
        };
    }

    const timer = focusTimerReducer(dashboard.timer, action, dashboard.durations);
    if (timer === dashboard.timer) return dashboard;
    return { ...dashboard, timer, sessions: completeSession(dashboard.sessions, timer, action.now) };
}

export function useFocusDashboard(userId) {
    const sessionKey = `takda-focus-lock:${userId}`;
    const dayKey = `takda-focus-day:${userId}`;
    const durationsKey = `takda-focus-durations:${userId}`;
    const [{ timer, durations, sessions }, dispatch] = useReducer(
        dashboardReducer, { sessionKey, dayKey, durationsKey }, restoreDashboard
    );
    const [lockEnabled, setLockEnabled] = useState(true);
    const { endsAt, phase, status, durationMinutes } = timer;
    const locked = lockEnabled && phase === "focus" && status === "running";

    useEffect(() => {
        if (endsAt === null) return;

        // Use the actual deadline so the timer catches up in a throttled tab.
        const tick = () => dispatch({ type: "tick", now: Date.now(), endsAt });
        const interval = window.setInterval(tick, 250);
        return () => window.clearInterval(interval);
    }, [endsAt]);

    useEffect(() => {
        if (sessions.length === 0) return;
        const now = Date.now();
        const merged = new Map(readFocusHistory(dayKey, now).map((session) => [session.completedAt, session]));
        for (const session of sessions) merged.set(session.completedAt, session);
        writeFocusValue("localStorage", dayKey, { sessions: keepRecentFocusSessions([...merged.values()], now) });
    }, [sessions, dayKey]);

    useEffect(() => {
        writeFocusValue("sessionStorage", sessionKey, locked ? { endsAt, durationMinutes } : null);
    }, [durationMinutes, endsAt, locked, sessionKey]);

    useEffect(() => {
        writeFocusValue("localStorage", durationsKey, durations);
    }, [durations, durationsKey]);

    const focusWeek = summarizeFocusWeek(sessions);
    return { timer, durations, dispatch, focusWeek, lockEnabled, setLockEnabled, locked };
}
