import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

import { useDropdown } from "../../../../shared/hooks/useDropdown";
import { getDisplayName, getInitials } from "../../../../shared/utils/userUtils";
import { PROJECT_ACCENTS, PROJECT_ICONS } from "../../constants/projectOptions";

function ProjectCard({ project, onEdit, onDelete }) {
    const navigate = useNavigate();
    const { open: isMenuOpen, ref: menuRef, toggle: toggleMenu, close: closeMenu } = useDropdown();

    const members = project.members || [];
    const visibleMembers = members.slice(0, 3);
    const remainingMembers = Math.max((project.member_count || 0) - visibleMembers.length, 0);
    const ProjectIcon = PROJECT_ICONS[project.icon] || PROJECT_ICONS.folder;
    const accentClasses = PROJECT_ACCENTS[project.accent] || PROJECT_ACCENTS.green;

    // Stop card navigation while handling project options.
    const handleOption = (event, callback) => {
        event.stopPropagation();
        closeMenu();
        callback?.(project);
    };

    return (
        <motion.div
            layout
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/projects/${project.id}`)}
            onKeyDown={(event) => event.key === "Enter" && navigate(`/projects/${project.id}`)}
            whileTap={{ scale: 0.985 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="group relative flex min-h-[112px] w-full cursor-pointer flex-col rounded-2xl border border-white/70 bg-white/55 p-3 text-left shadow-[0_8px_28px_rgba(15,23,42,0.04)] backdrop-blur-xl transition-colors hover:border-green-200/80 hover:bg-white/75 dark:border-white/[0.08] dark:bg-white/[0.035] dark:hover:border-green-900/60 dark:hover:bg-white/[0.055] sm:min-h-[155px] sm:p-4"
        >
            {/* Project identity. */}
            <div className="flex w-full items-start gap-2.5 sm:gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition sm:h-9 sm:w-9 ${accentClasses}`}>
                    <ProjectIcon size={16} strokeWidth={1.9} className="sm:h-[17px] sm:w-[17px]" />
                </div>

                <div className="min-w-0 flex-1">
                    <h2 className="truncate text-[13px] font-semibold text-slate-700 dark:text-slate-100 sm:text-sm">
                        {project.project_name}
                    </h2>
                    <p className="mt-0.5 truncate text-[9px] leading-3.5 text-slate-400 dark:text-slate-500 sm:text-[10px] sm:leading-4">
                        Collaborative project workspace
                    </p>
                </div>

                {/* Owner actions. */}
                {project.role === "owner" && (
                    <div ref={menuRef} className="relative shrink-0">
                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                toggleMenu();
                            }}
                            aria-label="Project options"
                            aria-expanded={isMenuOpen}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100/70 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-white/[0.05] dark:hover:text-slate-300"
                        >
                            <MoreVertical size={14} />
                        </button>

                        {isMenuOpen && (
                            <div
                                onClick={(event) => event.stopPropagation()}
                                className="absolute right-0 top-8 z-30 w-36 max-w-[calc(100vw-2rem)] rounded-xl border border-white/80 bg-white/95 p-1.5 shadow-[0_12px_35px_rgba(15,23,42,0.14)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95"
                            >
                                <button
                                    type="button"
                                    onClick={(event) => handleOption(event, onEdit)}
                                    className="flex min-h-9 w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left font-medium text-slate-600 transition hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-white/[0.05] sm:min-h-0"
                                    style={{ fontSize: "11px", lineHeight: "1" }}
                                >
                                    <Pencil size={13} />
                                    Edit project
                                </button>

                                <button
                                    type="button"
                                    onClick={(event) => handleOption(event, onDelete)}
                                    className="flex min-h-9 w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left font-medium text-red-500 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 sm:min-h-0"
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

            {/* Members and project counts. */}
            <div className="mt-auto pt-2 sm:pt-3">
                <div className="flex items-center">
                    {visibleMembers.map((member, index) => (
                        <div
                            key={member.user_id}
                            title={getDisplayName(member)}
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-green-50 text-[8px] font-semibold text-green-600 shadow-sm dark:border-slate-900 dark:bg-green-950/50 dark:text-green-400 sm:h-7 sm:w-7 sm:text-[9px] ${index > 0 ? "-ml-1.5" : ""}`}
                        >
                            {getInitials(getDisplayName(member))}
                        </div>
                    ))}

                    {remainingMembers > 0 && (
                        <div className="-ml-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[8px] font-semibold text-slate-500 shadow-sm dark:border-slate-900 dark:bg-slate-800 dark:text-slate-400 sm:h-7 sm:w-7 sm:text-[9px]">
                            +{remainingMembers}
                        </div>
                    )}
                </div>

                <div
                    className="mt-1 flex items-center gap-1.5 font-medium text-slate-400 dark:text-slate-500 sm:mt-1.5"
                    style={{ fontSize: "9px" }}
                >
                    <span>{project.task_count || 0} {project.task_count === 1 ? "task" : "tasks"}</span>
                    <span>·</span>
                    <span>{project.member_count || 0} {project.member_count === 1 ? "member" : "members"}</span>
                </div>
            </div>
        </motion.div>
    );
}

export default ProjectCard;
