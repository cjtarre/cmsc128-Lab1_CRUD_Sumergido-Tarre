import { Palette } from "lucide-react";

// Project appearance settings section.
function ProjectSettingsAppearance({ onEdit }) {
    return (
        <section className="rounded-3xl border border-white/55 bg-white/20 p-4 shadow-[0_10px_35px_rgba(15,23,42,0.025)] backdrop-blur-xl dark:border-white/[0.07] dark:bg-slate-900/20 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-2.5">
                    <Palette size={15} className="mt-0.5 shrink-0 text-green-500 dark:text-green-400" />

                    <div className="min-w-0">
                        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            Project appearance
                        </h2>
                        <p className="mt-1 text-xs leading-5 text-slate-400 dark:text-slate-500">
                            Change the project name, icon, and accent color.
                        </p>
                    </div>
                </div>

                <button type="button" onClick={onEdit}
                    className="inline-flex h-9 w-full shrink-0 items-center justify-center rounded-xl bg-green-500 px-4 font-semibold text-white shadow-[0_5px_15px_rgba(34,197,94,0.16)] transition hover:bg-green-600 min-[360px]:w-auto"
                    style={{ fontSize: "12px", lineHeight: "1" }}>
                    Edit Project
                </button>
            </div>
        </section>
    );
}

export default ProjectSettingsAppearance;
