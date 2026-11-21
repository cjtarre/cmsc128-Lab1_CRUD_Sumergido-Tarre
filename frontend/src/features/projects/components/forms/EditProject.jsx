import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { PROJECT_ICON_OPTIONS, PROJECT_ACCENT_OPTIONS } from "../../constants/projectOptions";

function EditProject({ isOpen, project, onClose, onSubmit }) {
    const [projectName, setProjectName] = useState("");
    const [icon, setIcon] = useState("folder");
    const [accent, setAccent] = useState("green");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isOpen || !project) return;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProjectName(project.project_name || "");
        setIcon(project.icon || "folder");
        setAccent(project.accent || "green");
    }, [isOpen, project]);

    if (!isOpen || !project) return null;

    const handleSubmit = async (event) => {
        event.preventDefault();

        const trimmedName = projectName.trim();
        if (!trimmedName || saving) return;

        setSaving(true);

        try {
            const success = await onSubmit({
                project_name: trimmedName,
                icon,
                accent,
            });

            if (success) onClose();
        } finally {
            setSaving(false);
        }
    };

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-slate-950/30 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-project-heading"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !saving) onClose();
            }}
        >
            {/* Internal scrolling keeps the centered dialog usable on short screens. */}
            <form
                onSubmit={handleSubmit}
                className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl border border-white/70 bg-white/90 p-5 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/95"
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 id="edit-project-heading" className="text-base font-semibold text-slate-800 dark:text-white">
                            Edit Project
                        </h2>
                        <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                            Customize how this project appears in Takda.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Close"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-white/[0.06] dark:hover:text-slate-300"
                    >
                        <X size={15} />
                    </button>
                </div>

                <div className="mt-5">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        Project name
                    </label>

                    <input
                        type="text"
                        value={projectName}
                        onChange={(event) => setProjectName(event.target.value)}
                        maxLength={100}
                        autoFocus
                        className="mt-1.5 h-10 w-full rounded-xl border border-slate-200/80 bg-white/70 px-3 font-medium text-slate-700 outline-none transition focus:border-green-300 focus:ring-2 focus:ring-green-100/60 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:focus:border-green-800 dark:focus:ring-green-900/30"
                        style={{ fontSize: "12px" }}
                    />
                </div>

                <div className="mt-4">
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        Icon
                    </span>

                    <div className="mt-2 grid grid-cols-5 gap-1.5 min-[360px]:grid-cols-6">
                        {PROJECT_ICON_OPTIONS.map(({ id, icon: Icon, label }) => {
                            const selected = icon === id;

                            return (
                                <button
                                    key={id}
                                    type="button"
                                    title={label}
                                    aria-label={label}
                                    aria-pressed={selected}
                                    onClick={() => setIcon(id)}
                                    className={`flex aspect-square items-center justify-center rounded-xl border transition ${
                                        selected
                                            ? "border-green-300 bg-green-50 text-green-600 ring-2 ring-green-100 dark:border-green-800 dark:bg-green-950/50 dark:text-green-400 dark:ring-green-950"
                                            : "border-slate-100 bg-white/50 text-slate-400 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-600 dark:border-white/[0.06] dark:bg-white/[0.025] dark:text-slate-500 dark:hover:bg-white/[0.05] dark:hover:text-slate-300"
                                    }`}
                                >
                                    <Icon size={16} strokeWidth={1.9} />
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-4">
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        Accent
                    </span>

                    <div className="mt-2 flex flex-wrap gap-2">
                        {PROJECT_ACCENT_OPTIONS.map((color) => (
                            <button
                                key={color.id}
                                type="button"
                                title={color.label}
                                aria-label={color.label}
                                aria-pressed={accent === color.id}
                                onClick={() => setAccent(color.id)}
                                className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
                                    accent === color.id
                                        ? "ring-2 ring-slate-400 ring-offset-2 ring-offset-white dark:ring-slate-400 dark:ring-offset-slate-900"
                                        : "hover:scale-110"
                                }`}
                            >
                                <span
                                    className={`h-5 w-5 rounded-full ${color.className}`}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="h-9 rounded-xl px-3 font-semibold text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:bg-white/[0.05]"
                        style={{ fontSize: "11px", lineHeight: "1" }}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={!projectName.trim() || saving}
                        className="inline-flex h-9 items-center justify-center rounded-xl bg-green-500 px-4 font-semibold text-white shadow-[0_5px_15px_rgba(34,197,94,0.16)] transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                        style={{ fontSize: "12px", lineHeight: "1" }}
                    >
                        {saving ? "Saving..." : "Save changes"}
                    </button>
                </div>
            </form>
        </div>,
        document.body
    );
}

export default EditProject;
