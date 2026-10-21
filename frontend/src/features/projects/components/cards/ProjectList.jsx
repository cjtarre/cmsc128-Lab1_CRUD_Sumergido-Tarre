import { useState } from "react";
import { Plus, Search, SlidersHorizontal, X } from "lucide-react";

import EmptyState from "../../../../shared/components/common/EmptyState";
import AddTask from "../../../tasks/components/forms/AddTask";
import DeleteTask from "../../../tasks/components/forms/DeleteTask";
import EditTask from "../../../tasks/components/forms/EditTask";
import TaskDetails from "../../../tasks/components/table/TaskDetails";
import TaskFilterControls from "../../../tasks/components/filters/TaskFilterControls";
import TaskTable from "../../../tasks/components/table/TaskTable";
import { createTaskHandlers } from "../../../tasks/handlers/taskHandlers";
import { useMobileTaskFilters } from "../../../tasks/hooks/useMobileTaskFilters";
import { useTaskFilters } from "../../../tasks/hooks/useTaskFilters";
import useTasks from "../../../tasks/hooks/useTasks";
import { useProjectMembersList } from "../../hooks/useProjectMembersList";

function ProjectList({ projectId, tasks, setTasks, canEdit }) {
    const [selectedTask, setSelectedTask] = useState(null);
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

    const members = useProjectMembersList(projectId);
    const taskActions = useTasks(tasks, setTasks, projectId);
    const handlers = createTaskHandlers({ ...taskActions, setSelectedTask, setTaskToEdit, setTaskToDelete, setIsAddTaskOpen });
    const { searchTerm, setSearchTerm, filters, setters, activeSort, tags, displayedTasks, activeFilterCount, hasFilters, clearFilters, handleSortTask, handleSortDueDate } = useTaskFilters(tasks);
    const { isOpen: isMobileFiltersOpen, setIsOpen: setIsMobileFiltersOpen, ref: mobileFiltersRef } = useMobileTaskFilters();

    const getFilterHandlers = (close = false) => Object.fromEntries(Object.entries(setters).map(([key, setter]) => [
        key,
        (event) => { setter(event.target.value); if (close) setIsMobileFiltersOpen(false); },
    ]));

    return (
        <>
            <section className="rounded-3xl border border-white/55 bg-white/20 p-4 shadow-[0_10px_35px_rgba(15,23,42,0.025)] backdrop-blur-xl dark:border-white/[0.07] dark:bg-slate-900/20 sm:p-5">
                <div>
                    <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200">List</h2>
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Manage and review all tasks shared in this project.</p>
                </div>

                {/* Mobile search + filters */}
                <div ref={mobileFiltersRef} className="relative z-30 mt-4 flex items-center gap-2 lg:hidden">
                    <div className="relative min-w-0 flex-1">
                        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search tasks..."
                            className="h-9 w-full rounded-xl border border-white/80 bg-white/55 py-0 pl-9 pr-8 text-slate-700 outline-none transition placeholder:text-slate-400 hover:bg-white/75 focus:border-green-200 focus:ring-2 focus:ring-green-100/50 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-200 dark:hover:bg-white/[0.06] dark:focus:border-green-800 dark:focus:ring-green-900/30"
                            style={{ fontSize: "12px", lineHeight: "1" }} />
                        {searchTerm && <button type="button" onClick={() => setSearchTerm("")} aria-label="Clear search" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 transition hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400"><X size={12} /></button>}
                    </div>

                    <button type="button" onClick={() => setIsMobileFiltersOpen((current) => !current)} aria-label="Task filters" aria-expanded={isMobileFiltersOpen}
                        className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${isMobileFiltersOpen || activeFilterCount ? "border-green-200 bg-green-50/70 text-green-600 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-400" : "border-white/80 bg-white/55 text-slate-400 hover:bg-white/75 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-500 dark:hover:bg-white/[0.06]"}`}>
                        <SlidersHorizontal size={14} />
                        {activeFilterCount > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-green-500 px-1 text-[8px] font-bold text-white">{activeFilterCount}</span>}
                    </button>

                    {isMobileFiltersOpen && (
                        <div className="absolute right-0 top-full z-50 mt-2 w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-white/80 bg-white/95 p-3 shadow-[0_12px_35px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95">
                            <div className="grid grid-cols-2 gap-2"><TaskFilterControls members={members} tags={tags} filters={filters} onChange={getFilterHandlers(true)} /></div>
                            {activeFilterCount > 0 && <button type="button" onClick={clearFilters} className="mt-2 h-8 w-full rounded-lg text-[11px] font-medium text-slate-400 transition hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-white/[0.04] dark:hover:text-slate-300">Clear filters</button>}
                        </div>
                    )}
                </div>

                {/* Desktop toolbar */}
                <div className="mt-4 hidden gap-2.5 lg:flex lg:items-center lg:justify-between">
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                        <div className="relative min-w-[200px] flex-1 lg:max-w-[350px]">
                            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search tasks..."
                                className="h-9 w-full rounded-xl border border-white/80 bg-white/55 py-0 pl-9 pr-8 text-slate-700 outline-none transition placeholder:text-slate-400 hover:bg-white/75 focus:border-green-200 focus:ring-2 focus:ring-green-100/50 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-200 dark:hover:bg-white/[0.06] dark:focus:border-green-800 dark:focus:ring-green-900/30"
                                style={{ fontSize: "12px", lineHeight: "1" }} />
                            {searchTerm && <button type="button" onClick={() => setSearchTerm("")} aria-label="Clear search" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 transition hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400"><X size={12} /></button>}
                        </div>

                        <TaskFilterControls members={members} tags={tags} filters={filters} onChange={getFilterHandlers()} />

                        {hasFilters && <button type="button" onClick={clearFilters} className="h-9 rounded-xl px-2.5 font-medium text-slate-400 transition hover:bg-white/50 hover:text-slate-600 dark:hover:bg-white/[0.04] dark:hover:text-slate-300" style={{ fontSize: "11px", lineHeight: "1" }}>Clear</button>}
                    </div>

                    {canEdit && <button type="button" onClick={handlers.handleOpenAddTask} className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-green-500 px-3.5 font-semibold text-white shadow-[0_5px_15px_rgba(34,197,94,0.16)] transition hover:bg-green-600" style={{ fontSize: "12px", lineHeight: "1" }}><Plus size={14} /> Add Task</button>}
                </div>

                {/* Mobile Add Task */}
                {canEdit && <button type="button" onClick={handlers.handleOpenAddTask} className="mt-2.5 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-green-500 px-3.5 font-semibold text-white shadow-[0_5px_15px_rgba(34,197,94,0.16)] transition hover:bg-green-600 lg:hidden" style={{ fontSize: "12px", lineHeight: "1" }}><Plus size={14} /> Add Task</button>}

                {/* Tasks / empty state */}
                <div className="mt-3">
                    {displayedTasks.length ? (
                        <div className="overflow-hidden rounded-2xl border border-white/80 bg-white/75 shadow-[0_6px_22px_rgba(15,23,42,0.035)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
                            <TaskTable tasks={displayedTasks} scrollable collaborative activeSort={activeSort}
                                onSortTask={handleSortTask} onSortDueDate={handleSortDueDate}
                                onToggleComplete={canEdit ? handlers.handleToggleComplete : undefined}
                                onStatusChange={canEdit ? handlers.handleStatusChange : undefined}
                                onEdit={canEdit ? handlers.handleEditTask : undefined}
                                onDelete={canEdit ? handlers.handleDeleteTask : undefined}
                                onView={handlers.handleViewTask} />
                        </div>
                    ) : hasFilters ? (
                        <div className="rounded-2xl border border-dashed border-white/70 bg-white/30 px-6 py-12 text-center dark:border-white/10 dark:bg-white/[0.02]">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">No matching tasks</p>
                            <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">Try changing or clearing your filters.</p>
                            <button type="button" onClick={clearFilters} className="mt-2 text-[11px] font-semibold text-green-600 dark:text-green-400">Clear filters</button>
                        </div>
                    ) : (
                        <EmptyState title="No tasks in this project yet" description="Project tasks will appear here." actionLabel="Add the first task" onAction={canEdit ? handlers.handleOpenAddTask : undefined} />
                    )}
                </div>

                <div className="mt-2.5 flex justify-end">
                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{displayedTasks.length} {displayedTasks.length === 1 ? "task" : "tasks"}</span>
                </div>
            </section>

            {selectedTask && <TaskDetails task={selectedTask} onClose={handlers.handleCloseTaskDetails} onEdit={canEdit ? () => handlers.handleEditTask(selectedTask.id) : undefined} onDelete={canEdit ? () => handlers.handleDeleteTask(selectedTask.id) : undefined} collaborative />}

            {canEdit && (
                <>
                    <AddTask isOpen={isAddTaskOpen} onClose={handlers.handleCloseAddTask} onSubmit={handlers.handleAddTaskSubmit} collaborative members={members} />
                    <EditTask task={taskToEdit} isOpen={Boolean(taskToEdit)} onClose={handlers.handleCloseEditTask} onSave={handlers.handleUpdateTask} collaborative members={members} />
                    <DeleteTask task={taskToDelete} onConfirm={() => handlers.handleConfirmDelete(taskToDelete)} onCancel={handlers.handleCancelDelete} />
                </>
            )}
        </>
    );
}

export default ProjectList;

