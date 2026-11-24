import { Plus, SearchX } from "lucide-react";
import emptyTasksIllustration from "../../../assets/illustrations/empty-task-illustration.png";

function EmptyState({
    title = "No tasks yet",
    description = "You don't have any tasks here yet.",
    actionLabel = "Add Task",
    onAction,
    compact = false,
}) {
    if (compact) {
        return (
            <div role="status" className="relative flex min-h-[164px] w-full flex-col items-center justify-center overflow-hidden border-y border-dashed border-slate-200/70 bg-white/20 px-5 py-6 text-center backdrop-blur-md dark:border-white/10 dark:bg-white/[0.015] sm:min-h-[184px]">
                <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/60 text-slate-400 dark:bg-white/[0.05] dark:text-slate-400">
                    <SearchX size={18} strokeWidth={1.8} />
                </span>
                <h2 className="mt-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 sm:text-sm">
                    {title}
                </h2>
                <p className="mt-1 max-w-md text-[11px] leading-5 text-slate-500 dark:text-slate-400 sm:text-xs">
                    {description}
                </p>
                {onAction && (
                    <button
                        type="button"
                        onClick={onAction}
                        className="mt-3 inline-flex min-h-8 items-center justify-center rounded-lg px-3 text-xs font-semibold text-green-600 transition hover:bg-green-50/60 hover:text-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300 dark:text-green-400 dark:hover:bg-green-950/30"
                    >
                        {actionLabel}
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="relative flex min-h-[300px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/80 bg-white/85 px-4 py-6 text-center shadow-[0_10px_35px_rgba(15,23,42,0.04)] backdrop-blur-md dark:border-white/10 dark:bg-slate-900/85 dark:shadow-black/20 sm:min-h-[430px] sm:px-6">
            <div aria-hidden="true" className="absolute -right-20 top-4 h-48 w-48 rounded-full bg-emerald-100/40 blur-3xl dark:bg-emerald-500/[0.06]" />
            <div aria-hidden="true" className="absolute -bottom-24 -left-16 h-52 w-52 rounded-full bg-green-100/35 blur-3xl dark:bg-green-600/[0.05]" />

            <div className="relative flex flex-col items-center">
                <img src={emptyTasksIllustration} alt="" className="w-full max-w-[150px] object-contain sm:max-w-[220px]" />

                <h2 className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100 sm:mt-2 sm:text-lg">
                    {title}
                </h2>

                <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-sm sm:leading-6">
                    {description}
                </p>

                {onAction && (
                    <button
                        type="button"
                        onClick={onAction}
                        className="mt-5 hidden items-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(34,197,94,0.2)] transition-all hover:-translate-y-0.5 hover:bg-green-600 hover:shadow-[0_10px_26px_rgba(34,197,94,0.26)] focus:outline-none focus:ring-2 focus:ring-green-300/60 dark:hover:bg-green-400 lg:inline-flex"
                    >
                        <Plus size={17} />
                        {actionLabel}
                    </button>
                )}
            </div>
        </div>
    );
}

export default EmptyState;