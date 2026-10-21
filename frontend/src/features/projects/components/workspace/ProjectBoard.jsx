import { Search } from "lucide-react";

import BoardTaskCard from "../../../tasks/components/board/BoardTaskCard";
import { BOARD_COLUMNS, STATUS } from "../../../tasks/constants/taskOptions";
import { useTaskBoard } from "../../../tasks/hooks/useTaskBoard";
import taskStyles from "../../../tasks/styles/taskStyles";

function ProjectBoard({ projectId, tasks, setTasks, canEdit }) {
    const {
        searchTerm, setSearchTerm, filteredTasks, draggedTaskId, dragOverStatus, updatingTaskId,
        handleStatusChange, handleDragStart, handleDragEnd, handleDragOver, handleDragLeave, handleDrop,
    } = useTaskBoard(tasks, setTasks, projectId, canEdit);

    return (
        <section className="rounded-3xl border border-white/55 bg-white/20 p-4 shadow-[0_10px_35px_rgba(15,23,42,0.025)] backdrop-blur-xl dark:border-white/[0.07] dark:bg-slate-900/20 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200">Board</h2>
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{canEdit ? "Drag tasks between columns to update their status." : "Track project work across each stage."}</p>
                </div>

                <div className="relative w-full sm:w-64">
                    <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search tasks..."
                        className="h-10 w-full rounded-xl border border-white/70 bg-white/50 py-2 pl-9 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-green-200 focus:bg-white/70 focus:ring-2 focus:ring-green-100/50 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-200 dark:focus:border-green-800 dark:focus:ring-green-900/30" />
                </div>
            </div>

            {/* Mobile/tablet scrolls between columns; desktop keeps the 3-column board. */}
            <div className="mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0">
                {BOARD_COLUMNS.map((column) => {
                    const columnTasks = filteredTasks.filter((task) => task.status === column.id);
                    const isDragOver = canEdit && draggedTaskId !== null && dragOverStatus === column.id;

                    return (
                        <section key={column.id} onDragOver={(event) => handleDragOver(event, column.id)} onDragLeave={(event) => handleDragLeave(event, column.id)} onDrop={(event) => handleDrop(event, column.id)}
                            className={`flex min-h-[320px] w-[88%] shrink-0 snap-start flex-col rounded-2xl border p-3 backdrop-blur-xl transition sm:w-[72%] md:w-[55%] lg:min-h-[390px] lg:w-auto lg:shrink ${isDragOver ? "border-green-300 bg-green-50/55 ring-2 ring-green-200/60 dark:border-green-700 dark:bg-green-950/20 dark:ring-green-900/40" : "border-white/65 bg-white/30 dark:border-white/[0.08] dark:bg-white/[0.015]"}`}>
                            <header className="mb-3 flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                    <span className={`h-2 w-2 rounded-full ${taskStyles.statusDot[column.id] || taskStyles.statusDot[STATUS.NOT_STARTED]}`} />
                                    <h3 className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{column.label}</h3>
                                    <span className="text-[9px] text-slate-400">{columnTasks.length}</span>
                                </div>
                            </header>

                            <div className="space-y-2.5">
                                {columnTasks.map((task) => (
                                    <BoardTaskCard key={task.id} task={task} canEdit={canEdit}
                                        isDragging={String(draggedTaskId) === String(task.id)} isUpdating={updatingTaskId === task.id}
                                        onDragStart={handleDragStart} onDragEnd={handleDragEnd} onStatusChange={handleStatusChange} />
                                ))}
                            </div>

                            {!columnTasks.length && (
                                <div className={`flex flex-1 items-center justify-center rounded-xl py-10 transition ${isDragOver ? "border border-dashed border-green-300 bg-green-50/30 dark:border-green-800 dark:bg-green-950/10" : ""}`}>
                                    <p className={`text-[9px] ${isDragOver ? "font-medium text-green-500 dark:text-green-400" : "text-slate-400 dark:text-slate-600"}`}>{isDragOver ? `Move to ${column.label}` : "No tasks"}</p>
                                </div>
                            )}
                        </section>
                    );
                })}
            </div>
        </section>
    );
}

export default ProjectBoard;

