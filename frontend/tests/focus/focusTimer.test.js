import { expect, it } from "vitest";

import { getFocusTimerLabels } from "../../src/features/focus/utils/focusTimer";

it.each([
    ["focus", "ready", "Start focus session", "30 min focus · 10 min break"],
    ["break", "ready", "Start break", "10 min break"],
    ["focus", "running", "Pause", "Focus session in progress."],
    ["break", "running", "Pause", "Break in progress."],
    ["focus", "paused", "Resume", "Timer paused."],
    ["break", "paused", "Resume", "Timer paused."],
    ["focus", "finished", "Start break", "Focus session complete. Take a break when you’re ready."],
    ["break", "finished", "Start focus session", "Break complete. Start another focus session when you’re ready."],
])("returns the labels for a %s timer that is %s", (phase, status, primaryLabel, statusMessage) => {
    expect(getFocusTimerLabels({ phase, status }, { focus: 30, break: 10 }))
        .toEqual({ primaryLabel, statusMessage });
});
