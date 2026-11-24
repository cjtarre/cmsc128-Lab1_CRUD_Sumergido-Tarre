import { Sprout } from "lucide-react";

function EncouragementCard() {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br from-white/75 via-green-50/70 to-emerald-100/65 p-5 shadow-[0_10px_30px_rgba(34,197,94,0.08)] backdrop-blur-xl dark:border-white/10 dark:from-slate-900/80 dark:via-emerald-950/35 dark:to-green-950/50">
            <div
                aria-hidden="true"
                className="absolute -bottom-12 -right-8 h-32 w-32 rounded-full bg-green-300/30 blur-2xl dark:bg-green-500/10"
            />

            <div
                aria-hidden="true"
                className="absolute -right-3 top-2 h-20 w-20 rounded-full bg-emerald-200/30 blur-xl dark:bg-emerald-400/[0.07]"
            />

            <div className="relative flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/80 bg-white/75 text-green-500 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-slate-800/70 dark:text-green-400">
                    <Sprout size={18} strokeWidth={1.8} />
                </div>

                <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        Keep going.
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        Small progress is still progress.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default EncouragementCard;