import { useEffect, useState } from "react";
import {
    BookOpen,
    Briefcase,
    CalendarDays,
    Code2,
    Database,
    Flag,
    Folder,
    GraduationCap,
    Heart,
    Home,
    Lightbulb,
    Palette,
    Plane,
    Rocket,
    Star,
    Target,
    Terminal,
    X,
} from "lucide-react";

const PROJECT_ICONS = [
    { id: "folder", icon: Folder, label: "Folder" },
    { id: "briefcase", icon: Briefcase, label: "Briefcase" },
    { id: "book-open", icon: BookOpen, label: "Book" },
    { id: "graduation-cap", icon: GraduationCap, label: "School" },
    { id: "code", icon: Code2, label: "Code" },
    { id: "terminal", icon: Terminal, label: "Terminal" },
    { id: "database", icon: Database, label: "Database" },
    { id: "calendar", icon: CalendarDays, label: "Calendar" },
    { id: "target", icon: Target, label: "Target" },
    { id: "flag", icon: Flag, label: "Flag" },
    { id: "lightbulb", icon: Lightbulb, label: "Idea" },
    { id: "palette", icon: Palette, label: "Creative" },
    { id: "plane", icon: Plane, label: "Plane" },
    { id: "rocket", icon: Rocket, label: "Rocket" },
    { id: "star", icon: Star, label: "Star" },
    { id: "heart", icon: Heart, label: "Heart" },
    { id: "home", icon: Home, label: "Home" },
];

const PROJECT_ACCENTS = [
    { id: "green", label: "Green", className: "bg-green-500" },
    { id: "blue", label: "Blue", className: "bg-blue-500" },
    { id: "purple", label: "Purple", className: "bg-purple-500" },
    { id: "orange", label: "Orange", className: "bg-orange-500" },
    { id: "pink", label: "Pink", className: "bg-pink-500" },
    { id: "red", label: "Red", className: "bg-red-500" },
    { id: "amber", label: "Amber", className: "bg-amber-400" },
    { id: "cyan", label: "Cyan", className: "bg-cyan-500" },
    { id: "slate", label: "Slate", className: "bg-slate-500" },
];

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

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !saving) onClose();
            }}
        >
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md rounded-3xl border border-white/70 bg-white/90 p-5 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/95"
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-800 dark:text-white">
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

                    <div className="mt-2 grid grid-cols-6 gap-1.5">
                        {PROJECT_ICONS.map(({ id, icon: Icon, label }) => {
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
                        {PROJECT_ACCENTS.map((color) => (
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
                                <span className={`h-5 w-5 rounded-full ${color.className}`} />
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
        </div>
    );
}

export default EditProject;