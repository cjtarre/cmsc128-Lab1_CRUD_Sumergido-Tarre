import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { inviteService } from "../services/inviteService";
import { projectService } from "../services/projectService";
import { getDisplayName } from "../../../shared/utils/userUtils";

// Manage project members, invitations, and related API actions.
export function useProjectMembers(project, isOwner) {
    const [members, setMembers] = useState([]);
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [removingMember, setRemovingMember] = useState(false);
    const [leavingProject, setLeavingProject] = useState(false);

    const loadMembers = useCallback(async () => {
        try {
            setLoading(true);

            const membersData = await projectService.getMembers(project.id);
            setMembers(Array.isArray(membersData) ? membersData : []);

            if (isOwner) {
                const invitesData = await inviteService.getProjectInvites(project.id);
                setInvites(Array.isArray(invitesData) ? invitesData : []);
            }
        } catch (error) {
            console.error("Error loading project members:", error);
            toast.error(error.response?.data?.error || "Unable to load project members.");
        } finally {
            setLoading(false);
        }
    }, [project.id, isOwner]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadMembers();
    }, [loadMembers]);

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
            setMembers((current) => current.map((member) => member.user_id === userId ? { ...member, role } : member));
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
            setMembers((current) => current.filter((item) => item.user_id !== member.user_id));
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