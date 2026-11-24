import CalendarView from "../../../calendar/components/CalendarView";
import { createTaskHandlers } from "../../../tasks/handlers/taskHandlers";
import useTasks from "../../../tasks/hooks/useTasks";
import { useCalendarMemberFilter } from "../../hooks/useCalendarMemberFilter";
import { useProjectMembersList } from "../../hooks/useProjectMembersList";
import CalendarMemberFilter from "../members/CalendarMemberFilter";

function ProjectCalendar({ projectId, tasks, setTasks, canEdit }) {
    const members = useProjectMembersList(projectId);
    const taskActions = useTasks(tasks, setTasks, projectId);
    const handlers = createTaskHandlers({ ...taskActions, setSelectedTask: () => {}, setTaskToEdit: () => {}, setTaskToDelete: () => {}, setIsAddTaskOpen: () => {} });
    const { selectedMemberId, setSelectedMemberId, calendarTasks, filterOptions, getTaskMeta } = useCalendarMemberFilter(tasks, members);

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

                {members.length > 0 && <CalendarMemberFilter options={filterOptions} selectedId={selectedMemberId} onChange={setSelectedMemberId} />}
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
                    collaborative
                    projectId={projectId}
                    members={members}
                />
            </div>
        </section>
    );
}

export default ProjectCalendar;