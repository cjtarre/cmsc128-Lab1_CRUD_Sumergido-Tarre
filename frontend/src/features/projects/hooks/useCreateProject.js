import { useEffect, useState } from "react";

import { handleCreateProject } from "../handlers/projectHandlers";

// Manage create-project form state.
export function useCreateProject(isOpen, onSubmit, onClose) {
    const [projectName, setProjectName] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProjectName("");
        setError("");
    }, [isOpen]);

    const handleNameChange = (event) => {
        setProjectName(event.target.value);
        if (error) setError("");
    };

    const handleSubmit = (event) => handleCreateProject(event, { projectName, onSubmit, onClose, setProjectName, setError, setSubmitting });

    return { projectName, error, submitting, handleNameChange, handleSubmit };
}