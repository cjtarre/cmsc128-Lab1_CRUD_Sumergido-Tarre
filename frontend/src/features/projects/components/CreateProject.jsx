import { useEffect, useState } from "react";
import { FolderPlus, X } from "lucide-react";

function CreateProject({ isOpen, onClose, onSubmit }) {
    const [projectName, setProjectName] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProjectName("");
        setError("");

        const overflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = overflow;
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (event) => {
        event.preventDefault();

        const name = projectName.trim();

        if (!name) {
            setError("Project name is required.");
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            const success = await onSubmit(name);

            if (success) {
                setProjectName("");
                onClose();
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-slate-900/20 px-4 pt-24 backdrop-blur-sm dark:bg-black/55">
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.16)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/85">
                <div className="flex items-start justify-between border-b border-white/60 px-5 py-4 dark:border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-green-100 p-2 text-green-600 dark:bg-green-950/60 dark:text-green-400">
                            <FolderPlus size={19} />
                        </div>

                        <div>
                            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">New Project</h2>
                            <p className="text-xs text-slate-400 dark:text-slate-500">Create a collaborative workspace.</p>
                        </div>
                    </div>

                    <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-white/[0.06]">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="px-5 py-5">
                        <label htmlFor="project-name" className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                            Project Name <span className="text-red-400">*</span>
                        </label>

                        <input
                            id="project-name"
                            value={projectName}
                            onChange={(event) => {
                                setProjectName(event.target.value);
                                if (error) setError("");
                            }}
                            autoFocus
                            placeholder="e.g. CMSC 128 Project"
                            className={`w-full rounded-xl border bg-white/70 px-3 py-2.5 text-sm text-slate-700 outline-none transition dark:bg-white/[0.05] dark:text-slate-200 ${
                                error
                                    ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:border-red-700"
                                    : "border-slate-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:border-white/10 dark:focus:border-green-600 dark:focus:ring-green-950/50"
                            }`}
                        />

                        {error && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{error}</p>}
                    </div>

                    <div className="flex justify-end gap-2 border-t border-white/60 bg-white/30 px-5 py-3 dark:border-white/10 dark:bg-white/[0.025]">
                        <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-white dark:text-slate-400 dark:hover:bg-white/[0.06]">
                            Cancel
                        </button>

                        <button type="submit" disabled={submitting} className="rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-green-400">
                            {submitting ? "Creating..." : "Create Project"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateProject;