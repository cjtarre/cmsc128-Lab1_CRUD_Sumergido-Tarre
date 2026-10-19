import { useEffect, useMemo, useState } from "react";
import { Users } from "lucide-react";

import CalendarView from "../../calendar/components/CalendarView";
import { createTaskHandlers } from "../../tasks/handlers/taskHandlers";
import useTasks from "../../tasks/hooks/useTasks";
import { projectService } from "../services/projectService";

const getMemberName = (member) => member?.display_name || member?.username || "Member";
const getInitials = (member) => getMemberName(member).split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

function ProjectCalendar({ projectId, tasks, setTasks, canEdit }) {
    const [members, setMembers] = useState([]);
    const [selectedMemberId, setSelectedMemberId] = useState("all");

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
                    <div className="relative">
                        <Users size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-green-500" />

                        <select
                            value={selectedMemberId}
                            onChange={(event) => setSelectedMemberId(event.target.value)}
                            aria-label="Filter calendar by assignee"
                            className="h-10 min-w-44 rounded-xl border border-white/70 bg-white/50 py-2 pl-8 pr-3 text-xs font-medium text-slate-600 outline-none transition focus:border-green-200 focus:ring-2 focus:ring-green-100/50 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-300 dark:focus:border-green-800 dark:focus:ring-green-900/30"
                        >
                            <option value="all">All assignees</option>
                            <option value="unassigned">Unassigned</option>
                            {members.map((member) => <option key={member.user_id} value={member.user_id}>{getMemberName(member)}</option>)}
                        </select>
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
                />
            </div>
        </section>
    );
}

export default ProjectCalendar;