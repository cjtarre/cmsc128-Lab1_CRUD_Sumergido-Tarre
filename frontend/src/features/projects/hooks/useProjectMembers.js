import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { inviteService } from "../services/inviteService";
import { projectService } from "../services/projectService";
import { getDisplayName } from "../../../shared/utils/userUtils";
import { queryKeys } from "../../../shared/utils/queryKeys";
import { INVITATION_SYNC_INTERVAL_MS } from "../../../shared/constants/notificationSync";
import { useSyncedQueryState } from "../../../shared/hooks/useSyncedQueryState";

// Manage project members, invitations, and related API actions.
export function useProjectMembers(project, isOwner) {
    const queryClient = useQueryClient();
    const membersQuery = useQuery({
        queryKey: queryKeys.members(project.id),
        queryFn: () => projectService.getMembers(project.id),
        enabled: Boolean(project?.id),
        // Keep the owner's member list current when invitees accept elsewhere.
        refetchInterval: INVITATION_SYNC_INTERVAL_MS,
        refetchOnWindowFocus: "always",
    });
    const invitesQuery = useQuery({
        queryKey: queryKeys.projectInvites(project.id),
        queryFn: () => inviteService.getProjectInvites(project.id),
        enabled: Boolean(project?.id && isOwner),
        refetchInterval: INVITATION_SYNC_INTERVAL_MS,
        refetchOnWindowFocus: "always",
    });
    const [members, setMembers] = useSyncedQueryState(membersQuery.data);
    const [invites, setInvites] = useSyncedQueryState(invitesQuery.data);
    const loading = membersQuery.isLoading || (isOwner && invitesQuery.isLoading);
    const [removingMember, setRemovingMember] = useState(false);
    const [leavingProject, setLeavingProject] = useState(false);

    const loadMembers = async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: queryKeys.members(project.id) }),
            isOwner
                ? queryClient.invalidateQueries({ queryKey: queryKeys.projectInvites(project.id) })
                : Promise.resolve(),
        ]);
    };

    const inviteMember = async (identifier, role) => {
        try {
            await inviteService.createInvite(project.id, identifier, role);
            toast.success("Invitation sent.");
            await loadMembers();
            return true;
        } catch (error) {
            console.error("Error inviting member:", error);
            toast.error(error.response?.data?.error || "Unable to send invitation.");
            return false;
        }
    };

    const changeRole = async (userId, role) => {
        try {
            await projectService.changeMemberRole(project.id, userId, role);
            setMembers((current) => current.map((member) =>
                member.user_id === userId ? { ...member, role } : member
            ));
            queryClient.setQueryData(queryKeys.members(project.id), (current = []) =>
                current.map((member) => member.user_id === userId ? { ...member, role } : member)
            );
            toast.success("Member role updated.");
        } catch (error) {
            console.error("Error changing member role:", error);
            toast.error(error.response?.data?.error || "Unable to change member role.");
        }
    };

    const removeMember = async (member) => {
        if (!member || removingMember) return false;

        try {
            setRemovingMember(true);
            await projectService.removeMember(project.id, member.user_id);
            queryClient.setQueryData(queryKeys.members(project.id), (current = []) =>
                current.filter((item) => item.user_id !== member.user_id)
            );
            toast.success(`${getDisplayName(member, "Member")} removed.`);
            return true;
        } catch (error) {
            console.error("Error removing member:", error);
            toast.error(error.response?.data?.error || "Unable to remove member.");
            return false;
        } finally {
            setRemovingMember(false);
        }
    };

    const leaveProject = async () => {
        if (leavingProject) return false;

        try {
            setLeavingProject(true);
            await projectService.leaveProject(project.id);
            toast.success("You left the project.");
            return true;
        } catch (error) {
            console.error("Error leaving project:", error);
            toast.error(error.response?.data?.error || "Unable to leave project.");
            return false;
        } finally {
            setLeavingProject(false);
        }
    };

    const cancelInvite = async (inviteId) => {
        try {
            await inviteService.cancelInvite(project.id, inviteId);
            setInvites((current) => current.filter((invite) => invite.id !== inviteId));
            queryClient.setQueryData(queryKeys.projectInvites(project.id), (current = []) =>
                current.filter((invite) => invite.id !== inviteId)
            );
            toast.success("Invitation cancelled.");
        } catch (error) {
            console.error("Error cancelling invitation:", error);
            toast.error(error.response?.data?.error || "Unable to cancel invitation.");
        }
    };

    return {
        members,
        invites,
        loading,
        removingMember,
        leavingProject,
        inviteMember,
        changeRole,
        removeMember,
        leaveProject,
        cancelInvite,
    };
}