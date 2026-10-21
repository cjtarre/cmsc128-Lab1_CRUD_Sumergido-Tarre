import { ChevronDown, RotateCcw, Trash2 } from "lucide-react";

import { formatDeletedProjectDate } from "../../utils/projectUtils";

// Display recoverable deleted projects.
function DeletedProjects({ projects, open, onToggle, onRestore }) {
    if (!projects.length) return null;

    return (
        <section className="mt-8 border-t border-slate-200/60 pt-5 dark:border-white/[0.06]">
            <button type="button" onClick={onToggle}
                className="flex w-full items-center justify-between gap-3 rounded-xl px-1 py-1 text-left">
                <div className="flex min-w-0 items-center gap-2">
                    <Trash2 size={13} className="shrink-0 text-slate-400 dark:text-slate-500" />
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Deleted Projects</span>
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-100 px-1.5 text-[10px] font-semibold text-slate-400 dark:bg-white/[0.05] dark:text-slate-500">
                        {projects.length}
                    </span>
                </div>

                <ChevronDown size={14}
                    className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div className="mt-3 overflow-hidden rounded-2xl border border-white/60 bg-white/25 shadow-[0_8px_30px_rgba(15,23,42,0.025)] backdrop-blur-xl dark:border-white/[0.07] dark:bg-white/[0.02]">
                    <div className="border-b border-slate-100/70 px-4 py-3 dark:border-white/[0.05]">
                        <p className="text-[10px] leading-4 text-slate-400 dark:text-slate-500">
                            Deleted projects are hidden from members and remain available for recovery.
                        </p>
                    </div>

                    <div className="max-h-[280px] divide-y divide-slate-100/70 overflow-y-auto overscroll-contain dark:divide-white/[0.05]">
                        {projects.map((project) => (
                            <div key={project.id}
                                className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100/80 text-slate-400 dark:bg-white/[0.05] dark:text-slate-500">
                                        <Trash2 size={14} />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate text-xs font-semibold text-slate-600 dark:text-slate-300">
                                            {project.project_name}
                                        </p>
                                        <p className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">
                                            {formatDeletedProjectDate(project.deleted_at)}
                                        </p>
                                    </div>
                                </div>

                                <button type="button" onClick={() => onRestore(project)}
                                    className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-green-100 bg-green-50/70 px-3 font-semibold text-green-600 transition hover:border-green-200 hover:bg-green-100/70 dark:border-green-900/40 dark:bg-green-950/20 dark:text-green-400 dark:hover:bg-green-950/35"
                                    style={{ fontSize: "11px", lineHeight: "1" }}>
                                    <RotateCcw size={12} />
                                    Restore
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}

export default DeletedProjects;
