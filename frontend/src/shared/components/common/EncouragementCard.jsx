import { Sprout } from "lucide-react";

function EncouragementCard() {
    return (
        <div className="rounded-xl border border-green-100 bg-green-50/50 p-4 dark:border-green-900/50 dark:bg-green-950/20">
            <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-green-500 shadow-sm dark:bg-slate-800 dark:text-green-400">
                    <Sprout size={17} strokeWidth={1.8} />
                </div>

                <div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        Keep going.
                    </p>
                    <p className="mt-1 text-[11px] leading-4 text-slate-500 dark:text-slate-400">
                        Small progress is still progress.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default EncouragementCard;