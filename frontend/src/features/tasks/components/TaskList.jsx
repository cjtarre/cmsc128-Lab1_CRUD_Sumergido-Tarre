import TaskTable from "./TaskTable";

function TaskList({
    tasks,
    onToggleComplete,
    onEdit,
    onDelete,
    onView,
}) {
    return (
        <TaskTable
            tasks={tasks}
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
        />
    );
}

export default TaskList;