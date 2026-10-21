// Confirm member removal and clear the selected member on success.
export async function handleRemoveMember(member, removeMember, onSuccess) {
    if (!member) return;
    if (await removeMember(member)) onSuccess();
}

// Submit an invitation, then reset and close the form on success.
export async function handleInviteMember(event, { identifier, role, onSubmit, onClose, setIdentifier, setRole, setSubmitting, defaultRole }) {
    event.preventDefault();
    const value = identifier.trim();
    if (!value) return;

    try {
        setSubmitting(true);

        if (await onSubmit(value, role)) {
            setIdentifier("");
            setRole(defaultRole);
            onClose();
        }
    } finally {
        setSubmitting(false);
    }
}