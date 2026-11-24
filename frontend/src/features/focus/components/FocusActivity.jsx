import { Clock3 } from "lucide-react";

function FocusActivity({ className, week }) {
    const today = week.at(-1).minutes;
    const total = today < 60 ? `${today}m` : `${Math.floor(today / 60)}h ${today % 60}m`;
    const peak = Math.max(1, ...week.map(({ minutes }) => minutes));
    const description = week.map(({ day, minutes }) => `${day}, ${minutes} minutes`).join("; ");

    return (
        <section className={className}>
            <h2 className="flex min-h-9 items-center gap-2 text-sm font-semibold">
                <Clock3 size={16} aria-hidden="true" /> Today’s focus time
            </h2>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-x-5 gap-y-3">
                <p className="text-3xl font-semibold tracking-tight text-green-800 tabular-nums dark:text-green-300">
                    {total}
                </p>
                <div role="img" aria-label={`Focus time over the last seven days. ${description}`}
                    className="grid min-w-40 flex-1 grid-cols-7 gap-2">
                    {week.map(({ day, label, minutes }, index) => (
                        <div key={day} title={`${day} · ${minutes} min`} aria-hidden="true" className="flex min-w-0 flex-col items-center gap-1">
                            <div className="flex h-10 w-full items-end justify-center">
                                <div className={`w-full max-w-5 rounded-sm ${index === week.length - 1
                                    ? "bg-emerald-600 dark:bg-emerald-300"
                                    : "bg-emerald-500/35 dark:bg-emerald-300/35"}`}
                                    style={{ height: minutes ? `max(4px, ${minutes / peak * 100}%)` : "2px" }} />
                            </div>
                            <span className="text-[10px] text-slate-600 dark:text-slate-400">{label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default FocusActivity;
