import { useEffect, useRef, useState } from "react";
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
    MoreVertical,
    Palette,
    Pencil,
    Plane,
    Rocket,
    Star,
    Target,
    Terminal,
    Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const PROJECT_ICONS = {
    folder: Folder,
    briefcase: Briefcase,
    "book-open": BookOpen,
    "graduation-cap": GraduationCap,
    code: Code2,
    terminal: Terminal,
    database: Database,
    calendar: CalendarDays,
    target: Target,
    flag: Flag,
    lightbulb: Lightbulb,
    palette: Palette,
    plane: Plane,
    rocket: Rocket,
    star: Star,
    heart: Heart,
    home: Home,
};

const PROJECT_ACCENTS = {
    green: "bg-green-50 text-green-500 group-hover:bg-green-100/80 dark:bg-green-950/40 dark:text-green-400",
    blue: "bg-blue-50 text-blue-500 group-hover:bg-blue-100/80 dark:bg-blue-950/40 dark:text-blue-400",
    purple: "bg-purple-50 text-purple-500 group-hover:bg-purple-100/80 dark:bg-purple-950/40 dark:text-purple-400",
    orange: "bg-orange-50 text-orange-500 group-hover:bg-orange-100/80 dark:bg-orange-950/40 dark:text-orange-400",
    pink: "bg-pink-50 text-pink-500 group-hover:bg-pink-100/80 dark:bg-pink-950/40 dark:text-pink-400",
    red: "bg-red-50 text-red-500 group-hover:bg-red-100/80 dark:bg-red-950/40 dark:text-red-400",
    amber: "bg-amber-50 text-amber-500 group-hover:bg-amber-100/80 dark:bg-amber-950/40 dark:text-amber-400",
    cyan: "bg-cyan-50 text-cyan-500 group-hover:bg-cyan-100/80 dark:bg-cyan-950/40 dark:text-cyan-400",
    slate: "bg-slate-100 text-slate-500 group-hover:bg-slate-200/80 dark:bg-slate-800 dark:text-slate-400",
};

function ProjectCard({ project, onEdit, onDelete }) {
    const navigate = useNavigate();
    const menuRef = useRef(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const members = project.members || [];
    const visibleMembers = members.slice(0, 3);
    const remainingMembers = Math.max((project.member_count || 0) - visibleMembers.length, 0);
    const ProjectIcon = PROJECT_ICONS[project.icon] || Folder;
    const accentClasses = PROJECT_ACCENTS[project.accent] || PROJECT_ACCENTS.green;

    useEffect(() => {
        if (!isMenuOpen) return;

        const handleOutsideClick = (event) => {
            if (!menuRef.current?.contains(event.target)) setIsMenuOpen(false);
        };

        const handleEscape = (event) => {
            if (event.key === "Escape") setIsMenuOpen(false);
        };

        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isMenuOpen]);

    const getInitials = (member) => {
        const name = member.display_name?.trim() || member.username?.trim() || "?";
        const parts = name.split(/\s+/);
        return parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase() : name.slice(0, 2).toUpperCase();
    };

    const handleMenu = (event) => {
        event.stopPropagation();
        setIsMenuOpen((current) => !current);
    };

    const handleEdit = (event) => {
        event.stopPropagation();
        setIsMenuOpen(false);
        onEdit?.(project);
    };

    const handleDelete = (event) => {
        event.stopPropagation();
        setIsMenuOpen(false);
        onDelete?.(project);
    };

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/projects/${project.id}`)}
            onKeyDown={(event) => {
                if (event.key === "Enter") navigate(`/projects/${project.id}`);
            }}
            className="group relative flex min-h-[155px] w-full cursor-pointer flex-col rounded-2xl border border-white/70 bg-white/55 p-4 text-left shadow-[0_8px_28px_rgba(15,23,42,0.04)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-green-200/80 hover:bg-white/75 hover:shadow-[0_12px_32px_rgba(15,23,42,0.07)] dark:border-white/[0.08] dark:bg-white/[0.035] dark:hover:border-green-900/60 dark:hover:bg-white/[0.055]"
        >
            <div className="flex w-full items-start gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${accentClasses}`}>
                    <ProjectIcon size={17} strokeWidth={1.9} />
                </div>

                <div className="min-w-0 flex-1">
                    <h2 className="truncate text-sm font-semibold text-slate-700 dark:text-slate-100">
                        {project.project_name}
                    </h2>

                    <p className="mt-0.5 truncate text-[10px] leading-4 text-slate-400 dark:text-slate-500">
                        Collaborative project workspace
                    </p>
                </div>

                {project.role === "owner" && (
                    <div ref={menuRef} className="relative shrink-0">
                        <button
                            type="button"
                            onClick={handleMenu}
                            aria-label="Project options"
                            aria-expanded={isMenuOpen}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100/70 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-white/[0.05] dark:hover:text-slate-300"
                        >
                            <MoreVertical size={15} />
                        </button>

                        {isMenuOpen && (
                            <div
                                className="absolute right-0 top-8 z-30 w-36 rounded-xl border border-white/80 bg-white/95 p-1.5 shadow-[0_12px_35px_rgba(15,23,42,0.14)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95"
                                onClick={(event) => event.stopPropagation()}
                            >
                                <button
                                    type="button"
                                    onClick={handleEdit}
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left font-medium text-slate-600 transition hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-white/[0.05]"
                                    style={{ fontSize: "11px", lineHeight: "1" }}
                                >
                                    <Pencil size={13} />
                                    Edit project
                                </button>

                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left font-medium text-red-500 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                                    style={{ fontSize: "11px", lineHeight: "1" }}
                                >
                                    <Trash2 size={13} />
                                    Delete project
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-auto pt-3">
                <div className="flex items-center">
                    {visibleMembers.map((member, index) => (
                        <div
                            key={member.user_id}
                            title={member.display_name || member.username}
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-white bg-green-50 text-[9px] font-semibold text-green-600 shadow-sm dark:border-slate-900 dark:bg-green-950/50 dark:text-green-400 ${index > 0 ? "-ml-1.5" : ""}`}
                        >
                            {getInitials(member)}
                        </div>
                    ))}

                    {remainingMembers > 0 && (
                        <div className="-ml-1.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[9px] font-semibold text-slate-500 shadow-sm dark:border-slate-900 dark:bg-slate-800 dark:text-slate-400">
                            +{remainingMembers}
                        </div>
                    )}
                </div>

                <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                    <span>{project.task_count || 0} {project.task_count === 1 ? "task" : "tasks"}</span>
                    <span>·</span>
                    <span>{project.member_count || 0} {project.member_count === 1 ? "member" : "members"}</span>
                </div>
            </div>
        </div>
    );
}

export default ProjectCard;