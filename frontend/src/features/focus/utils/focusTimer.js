import { DEFAULT_DURATIONS, MAX_DURATIONS } from "../constants/focusDurations";

const getNextPhase = (phase) => phase === "focus" ? "break" : "focus";
const phaseButton = (phase) => phase === "focus" ? "Start focus session" : "Start break";

export function getFocusTimerLabels({ phase, status }, durations) {
    const primaryLabel = {
        ready: phaseButton(phase),
        running: "Pause",
        paused: "Resume",
        finished: phaseButton(getNextPhase(phase)),
    }[status];

    const statusMessage = {
        ready: phase === "focus"
            ? `${durations.focus} min focus · ${durations.break} min break`
            : `${durations.break} min break`,
        running: phase === "focus" ? "Focus session in progress." : "Break in progress.",
        paused: "Timer paused.",
        finished: phase === "focus"
            ? "Focus session complete. Take a break when you’re ready."
            : "Break complete. Start another focus session when you’re ready.",
    }[status];
    return { primaryLabel, statusMessage };
}

export function getDurationMinutes(phase, value) {
    return Number.isInteger(value) && value >= 1 && value <= MAX_DURATIONS[phase]
        ? value
        : DEFAULT_DURATIONS[phase];
}

export function createFocusTimer(phase, minutes) {
    const durationMinutes = getDurationMinutes(phase, minutes);
    return { phase, status: "ready", durationMinutes, remainingMs: durationMinutes * 60_000, endsAt: null };
}

function updateRemainingTime(timer, now) {
    const remainingMs = Math.max(0, timer.endsAt - now);
    if (remainingMs === 0) {
        return { ...timer, status: "finished", remainingMs, completedAt: timer.endsAt, endsAt: null };
    }
    return { ...timer, remainingMs };
}

export function focusTimerReducer(timer, action, durations = DEFAULT_DURATIONS) {
    switch (action.type) {
        case "reset":
            return createFocusTimer(timer.phase, durations[timer.phase]);
        case "tick":
            return timer.status === "running" && timer.endsAt === action.endsAt
                ? updateRemainingTime(timer, action.now)
                : timer;
        case "primary": {
            if (timer.status === "running") {
                const updated = updateRemainingTime(timer, action.now);
                return updated.status === "finished"
                    ? updated
                    : { ...updated, status: "paused", endsAt: null };
            }

            const nextPhase = getNextPhase(timer.phase);
            const next = timer.status === "finished" ? createFocusTimer(nextPhase, durations[nextPhase]) : timer;
            return { ...next, status: "running", endsAt: action.now + next.remainingMs };
        }
        default:
            return timer;
    }
}
