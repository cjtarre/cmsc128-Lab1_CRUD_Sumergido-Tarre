import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { inviteService } from "../../projects/services/inviteService";

// Manage invitation responses and accepted-project navigation.
export function useInviteResponse(notification, onRead, onRefresh, onClose) {
    const navigate = useNavigate();
    const [responding, setResponding] = useState(false);

    const respond = async (accept) => {
        const inviteId = notification.data?.invite_id;
        if (!inviteId || responding) return;

        try {
            setResponding(true);

            if (accept) {
                await inviteService.acceptInvite(inviteId);
                toast.success(`Joined ${notification.data?.project_name || "the project"}.`);
            } else {
                await inviteService.declineInvite(inviteId);
                toast.success("Invitation declined.");
            }

            await onRead?.(notification.id);
            await onRefresh?.();
            window.dispatchEvent(new CustomEvent("takda:invites-changed"));
        } catch (error) {
            console.error("Error responding to invitation:", error);
            toast.error(error.response?.data?.error || "Unable to respond to invitation.");
        } finally {
            setResponding(false);
        }
    };

    const open = async () => {
        await onRead?.(notification.id);

        const projectId = notification.data?.project_id;
        if (notification.invite_status !== "accepted" || !projectId) return;

        onClose?.();
        navigate(`/projects/${projectId}`);
    };

    return { responding, respond, open };
}