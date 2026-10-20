import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Users } from "lucide-react";

import CalendarView from "../../calendar/components/CalendarView";
import { createTaskHandlers } from "../../tasks/handlers/taskHandlers";
import useTasks from "../../tasks/hooks/useTasks";
import { projectService } from "../services/projectService";

const getMemberName = (member) => member?.display_name || member?.username || "Member";
const getInitials = (member) => getMemberName(member).split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

function ProjectCalendar({ projectId, tasks, setTasks, canEdit }) {
    const [members, setMembers] = useState([]);
    const [selectedMemberId, setSelectedMemberId] = useState("all");
    const [isMemberFilterOpen, setIsMemberFilterOpen] = useState(false);
    const filterRef = useRef(null);

    const taskActions = useTasks(tasks, setTasks, projectId);
    const handlers = createTaskHandlers({ ...taskActions, setSelectedTask: () => {}, setTaskToEdit: () => {}, setTaskToDelete: () => {}, setIsAddTaskOpen: () => {} });

    useEffect(() => {
        let active = true;

        const loadMembers = async () => {
            try {
                const data = await projectService.getMembers(projectId);
                if (active) setMembers(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error loading calendar members:", error);
                if (active) setMembers([]);
            }
        };

        loadMembers();
        return () => { active = false; };
    }, [projectId]);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) setIsMemberFilterOpen(false);
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    const memberMap = useMemo(() => new Map(members.map((member) => [String(member.user_id), member])), [members]);

    const calendarTasks = useMemo(() => {
        if (selectedMemberId === "all") return tasks;
        if (selectedMemberId === "unassigned") return tasks.filter((task) => !task.assigneeId);
        return tasks.filter((task) => String(task.assigneeId) === String(selectedMemberId));
    }, [tasks, selectedMemberId]);

    const getTaskMeta = (task) => {
        if (!task.assigneeId) return { initials: "—", name: "Unassigned" };

        const member = task.assignee || memberMap.get(String(task.assigneeId));
        return member ? { initials: getInitials(member), name: getMemberName(member) } : { initials: "—", name: "Unassigned" };
    };

    const filterOptions = useMemo(() => [
        { id: "all", name: "All assignees", initials: null },
        { id: "unassigned", name: "Unassigned", initials: "—" },
        ...members.map((member) => ({
            id: String(member.user_id),
            name: getMemberName(member),
            initials: getInitials(member),
        })),
    ], [members]);

    const selectedFilter = filterOptions.find((option) => option.id === String(selectedMemberId)) || filterOptions[0];

    const selectFilter = (id) => {
        setSelectedMemberId(id);
        setIsMemberFilterOpen(false);
    };

    return (
        <section className="rounded-3xl border border-white/55 bg-white/20 p-4 shadow-[0_10px_35px_rgba(15,23,42,0.025)] backdrop-blur-xl dark:border-white/[0.07] dark:bg-slate-900/20 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200">Calendar</h2>
                        <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500">{calendarTasks.length} scheduled</span>
                    </div>

                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">See project deadlines and assigned work across the team.</p>
                </div>

                {members.length > 0 && (
                    <div ref={filterRef} className="relative z-30 w-full sm:w-48">
                        <button
                            type="button"
                            onClick={() => setIsMemberFilterOpen((current) => !current)}
                            aria-haspopup="listbox"
                            aria-expanded={isMemberFilterOpen}
                            className="flex h-10 w-full items-center gap-2 rounded-xl border border-white/70 bg-white/55 px-3 text-left shadow-sm backdrop-blur-xl transition hover:bg-white/75 focus:outline-none focus:ring-2 focus:ring-green-100/70 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.06] dark:focus:ring-green-900/30"
                        >
                            {selectedFilter.initials ? (
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-50 text-[7px] font-bold text-green-600 dark:bg-green-950/50 dark:text-green-400">
                                    {selectedFilter.initials}
                                </span>
                            ) : (
                                <Users size={13} className="shrink-0 text-green-500" />
                            )}

                            <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-600 dark:text-slate-300">
                                {selectedFilter.name}
                            </span>

                            <ChevronDown
                                size={13}
                                className={`shrink-0 text-slate-400 transition-transform duration-200 ${
                                    isMemberFilterOpen ? "rotate-180" : ""
                                }`}
                            />
                        </button>

                        {isMemberFilterOpen && (
                            <div
                                role="listbox"
                                aria-label="Filter calendar by assignee"
                                className="absolute right-0 top-full z-50 mt-1.5 max-h-60 w-full min-w-48 overflow-y-auto rounded-xl border border-white/80 bg-white/95 p-1.5 shadow-[0_12px_35px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95 dark:shadow-black/30"
                            >
                                {filterOptions.map((option) => {
                                    const selected = String(selectedMemberId) === option.id;

                                    return (
                                        <button
                                            key={option.id}
                                            type="button"
                                            role="option"
                                            aria-selected={selected}
                                            onClick={() => selectFilter(option.id)}
                                            className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition ${
                                                selected
                                                    ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300"
                                                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/[0.05]"
                                            }`}
                                        >
                                            {option.initials ? (
                                                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[8px] font-bold ${
                                                    selected
                                                        ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                                                        : "bg-slate-100 text-slate-500 dark:bg-white/[0.06] dark:text-slate-400"
                                                }`}>
                                                    {option.initials}
                                                </span>
                                            ) : (
                                                <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                                                    <Users size={13} className="text-green-500" />
                                                </span>
                                            )}

                                            <span className="min-w-0 flex-1 truncate text-xs font-medium">
                                                {option.name}
                                            </span>

                                            {selected && <Check size={13} className="shrink-0 text-green-500" />}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-white/65 bg-white/30 p-2 backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.015] sm:p-3">
                <CalendarView
                    tasks={calendarTasks}
                    handlers={handlers}
                    title=""
                    description=""
                    canEdit={canEdit}
                    allowAddTask={false}
                    getTaskMeta={getTaskMeta}
                    taskMetaLabel="Assigned to"
                />
            </div>
        </section>
    );
}

export default ProjectCalendar;