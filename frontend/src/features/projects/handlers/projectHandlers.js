// Validate and submit a new project.
export async function handleCreateProject(event, { projectName, onSubmit, onClose, setProjectName, setError, setSubmitting }) {
    event.preventDefault();

    const name = projectName.trim();
    if (!name) return setError("Project name is required.");

    try {
        setSubmitting(true);
        setError("");

        if (await onSubmit(name)) {
            setProjectName("");
            onClose();
        }
    } finally {
        setSubmitting(false);
    }
}

// Update the selected project.
export async function handleUpdateProject(projectData, { project, updateProject }) {
    if (!project) return false;
    return updateProject(project.id, projectData);
}

// Delete the selected project and clear it on success.
export async function handleDeleteProject({ project, deleteProject, onSuccess }) {
    if (!project) return;
    if (await deleteProject(project)) onSuccess();
}

// Restore the selected project and clear it on success.
export async function handleRestoreProject({ project, restoreProject, onSuccess }) {
    if (!project) return;
    if (await restoreProject(project)) onSuccess();
}