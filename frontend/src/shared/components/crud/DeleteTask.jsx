import ConfirmDialog from "../common/ConfirmDialog";

function DeleteTask({ task, onConfirm, onCancel }) {
    return (
        <ConfirmDialog
            isOpen={Boolean(task)}
            title="Delete task?"
            message={
                task
                    ? `Are you sure you want to delete "${task.title}"? This action cannot be undone.`
                    : ""
            }
            confirmText="Delete"
            onConfirm={onConfirm}
            onCancel={onCancel}
        />
    );
}

export default DeleteTask;