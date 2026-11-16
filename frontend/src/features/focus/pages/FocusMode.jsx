import { useLayoutEffect, useRef, useState } from "react";
import { Lock, Target } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import { useAuth } from "../../auth/hooks/useAuth";
import { STATUS } from "../../tasks/constants/taskOptions";
import { useTaskData } from "../../tasks/context/TaskContext";
import FocusActivity from "../components/FocusActivity";
import FocusSelect from "../components/FocusSelect";
import FocusPlaylist from "../components/FocusPlaylist";
import FocusTimerSettings from "../components/FocusTimerSettings";
import { useFocusDashboard } from "../hooks/useFocusDashboard";
import { focusControlStyle } from "../utils/focusControlStyle";

const phaseButton = (phase) => phase === "focus" ? "Start focus session" : "Start break";
const glassCard = "rounded-3xl border border-white/70 bg-white/35 p-5 shadow-[0_8px_28px_rgba(15,23,42,0.05)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.035] sm:p-6";

function FocusDashboard({ userId, initialPlaylistId }) {
    const { tasks, loading, error } = useTaskData();
    const [selectedTaskId, setSelectedTaskId] = useState("");
    const dialogRef = useRef(null);
    const { timer, durations, dispatch, focusWeek, lockEnabled, setLockEnabled, locked } = useFocusDashboard(userId);
    const { phase, status, remainingMs, durationMinutes } = timer;
    const availableTasks = tasks.filter((task) => task.status !== STATUS.COMPLETED);
    const selectedTask = availableTasks.find((task) => String(task.id) === selectedTaskId);

    useLayoutEffect(() => {
        const dialog = dialogRef.current;
        if (dialog.open) dialog.close();
        if (locked) dialog.showModal();
        else dialog.show();
    }, [locked]);

    const nextPhase = phase === "focus" ? "break" : "focus";
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    const minutes = String(Math.floor(remainingSeconds / 60)).padStart(2, "0");
    const seconds = String(remainingSeconds % 60).padStart(2, "0");
    const progress = Math.min(1, Math.max(0, 1 - remainingMs / (durationMinutes * 60_000)));
    const sessionActive = status === "running" || status === "paused";
    const countdownSize = locked && !selectedTask
        ? "text-[clamp(3.75rem,25cqi,10rem)]"
        : "text-[clamp(3rem,20cqi,8rem)]";

    const primaryLabel = {
        ready: phaseButton(phase),
        running: "Pause",
        paused: "Resume",
        finished: phaseButton(nextPhase),
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

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby="focus-title"
            onCancel={(event) => event.preventDefault()}
            className={locked
                ? "fixed inset-0 m-auto max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-6xl overflow-auto rounded-3xl border border-white/70 bg-emerald-50/90 p-4 text-slate-900 shadow-2xl backdrop-blur-2xl backdrop:bg-slate-950/75 dark:border-white/10 dark:bg-slate-950/90 dark:text-white sm:p-7"
                : "static mx-auto w-full max-w-6xl bg-transparent pb-10 text-slate-900 dark:text-white"}
        >
            <header className={locked ? "sr-only" : "mb-5"}>
                <h1 id="focus-title" className="text-2xl font-semibold tracking-tight">Focus Mode</h1>
            </header>

            <div className="grid min-w-0 items-start gap-4 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:items-stretch xl:gap-5">
                <section aria-labelledby="focus-phase"
                    className={`${glassCard} @container flex min-w-0 flex-col gap-4 md:col-start-2 md:row-start-1`}>
                    <div className="relative z-10 flex min-h-9 items-center justify-between gap-2">
                        <h2 id="focus-phase" className="flex items-center gap-2 text-sm font-semibold">
                            <Target size={16} aria-hidden="true" /> {phase === "focus" ? "Focus timer" : "Break timer"}
                        </h2>
                        {!locked && !sessionActive && (
                            <FocusTimerSettings durations={durations}
                                onSave={(nextDurations) => dispatch({ type: "setDurations", durations: nextDurations })} />
                        )}
                    </div>
                    <div className={`flex flex-1 flex-col justify-center px-2 text-center ${locked && !selectedTask ? "py-6 sm:py-10" : "py-3 sm:py-4"}`}>
                        <p role="timer" aria-label="Time remaining"
                            className={`${countdownSize} leading-none font-semibold tracking-tight text-green-800 tabular-nums dark:text-green-300`}>
                            {minutes}:{seconds}
                        </p>
                        <p role="status" className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            {locked && <Lock size={14} aria-hidden="true" className="mr-1.5 inline align-text-bottom" />}
                            {locked ? "Session locked until the timer ends." : statusMessage}
                        </p>
                        <div aria-hidden="true" className="mx-auto mt-5 h-1.5 max-w-sm overflow-hidden rounded-full bg-emerald-900/10 dark:bg-white/10">
                            <div className="h-full origin-left rounded-full bg-emerald-600 transition-transform dark:bg-emerald-300"
                                style={{ transform: `scaleX(${progress})` }} />
                        </div>
                    </div>

                    {!locked && <div>
                        <label htmlFor="focus-task" className="block text-sm font-medium">
                            Task <span className="font-normal text-slate-500 dark:text-slate-400">(optional)</span>
                        </label>
                        <FocusSelect
                            className="mt-2"
                            id="focus-task"
                            value={selectedTask ? selectedTaskId : ""}
                            onChange={(event) => setSelectedTaskId(event.target.value)}
                            disabled={loading || Boolean(error) || availableTasks.length === 0}
                            aria-describedby="focus-task-hint"
                        >
                            <option value="">No task selected</option>
                            {availableTasks.map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}
                        </FocusSelect>
                        <p id="focus-task-hint" className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                            {loading && "Loading tasks…"}
                            {!loading && error && "Tasks could not be loaded. You can still use the timer."}
                            {!loading && !error && availableTasks.length === 0 && (
                                <>Add a task in <Link to="/my-tasks" className="underline underline-offset-2">My Tasks</Link> to select it here.</>
                            )}
                        </p>
                    </div>}

                    {locked && selectedTask && (
                        <p className="rounded-xl bg-white/45 px-4 py-3 text-sm break-words dark:bg-white/[0.06]">
                            <span className="font-medium">Working on</span> · {selectedTask.title}
                        </p>
                    )}

                    {!locked && (
                        <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                                <button type="button" onClick={() => dispatch({ type: "primary", now: Date.now() })}
                                    style={focusControlStyle}
                                    className="flex-1 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800 dark:bg-green-400 dark:text-slate-950 dark:hover:bg-green-300">
                                    {primaryLabel}
                                </button>
                                <button type="button" onClick={() => dispatch({ type: "reset" })} disabled={status === "ready"}
                                    style={focusControlStyle}
                                    className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium hover:bg-slate-100 disabled:opacity-50 dark:border-white/15 dark:hover:bg-white/10">
                                    Reset
                                </button>
                            </div>
                            <label className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                <input type="checkbox" className="mt-1 accent-green-700"
                                    checked={lockEnabled}
                                    disabled={phase === "focus" && (status === "running" || status === "paused")}
                                    onChange={(event) => setLockEnabled(event.target.checked)}
                                />
                                <span>Lock Takda controls until focus ends</span>
                            </label>
                        </div>
                    )}
                </section>

                <div className="flex min-w-0 flex-col gap-4 md:col-start-1 md:row-start-1 xl:gap-5">
                    {!locked && (
                        <FocusActivity className={glassCard} week={focusWeek} />
                    )}
                    <FocusPlaylist key="focus-playlist" className={`${glassCard} flex flex-1 flex-col`}
                        storageKey={`takda-focus-playlist:${userId}`} initialPlaylistId={initialPlaylistId} locked={locked} />
                </div>
            </div>
        </dialog>
    );
}

function FocusMode() {
    const { user } = useAuth();
    const [params] = useSearchParams();
    return <FocusDashboard key={user.id} userId={user.id} initialPlaylistId={params.get("playlist")} />;
}

export default FocusMode;
