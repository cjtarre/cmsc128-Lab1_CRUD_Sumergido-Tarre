import { AlertTriangle, Trash2 } from "lucide-react";

// Destructive project actions.
function ProjectSettingsDangerZone({ onDelete }) {
    return (
        <>
            <div className="flex items-center gap-2 px-1 pt-4">
                <AlertTriangle size={14} className="text-red-400" />
                <p className="text-[11px] font-semibold uppercase tracking-wider text-red-400 dark:text-red-400">
                    Danger Zone
                </p>
            </div>

            <section className="rounded-3xl border border-red-100/80 bg-red-50/20 p-4 shadow-[0_10px_35px_rgba(15,23,42,0.02)] backdrop-blur-xl dark:border-red-900/30 dark:bg-red-950/10 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-400 dark:bg-red-950/30 dark:text-red-400">
                            <Trash2 size={15} />
                        </div>

                        <div className="min-w-0">
                            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Delete project</h2>
                            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-400 dark:text-slate-500">
                                Move this project to Deleted Projects. Project members will lose access until the project is restored.
                            </p>
                        </div>
                    </div>

                    <button type="button" onClick={onDelete}
                        className="inline-flex h-9 w-full shrink-0 items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 font-semibold text-red-500 transition hover:border-red-300 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/25 dark:text-red-400 dark:hover:bg-red-950/40 min-[360px]:w-auto"
                        style={{ fontSize: "12px", lineHeight: "1" }}>
                        <Trash2 size={13} />
                        Delete Project
                    </button>
                </div>
            </section>
        </>
    );
}

export default ProjectSettingsDangerZone;
