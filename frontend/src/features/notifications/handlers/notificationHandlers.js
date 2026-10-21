// Mark a notification as read and open its available destination.
export async function handleOpenNotification({ notification, canOpen, projectId, onRead, onClose, navigate }) {
    await onRead?.(notification.id);
    if (!canOpen) return;

    onClose?.();
    navigate(projectId ? `/projects/${projectId}` : "/my-tasks");
}