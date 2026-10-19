import { useCallback, useEffect, useState } from "react";
import { Crown, Eye, MoreHorizontal, Pencil, Plus, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";

import InviteMember from "./InviteMember";
import { projectService } from "../services/projectService";
import { inviteService } from "../services/inviteService";

const getInitials = (member) => {
    const value = member.display_name || member.username || "?";
    return value.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
};

const accessRoles = [
    { role: "Owner", description: "Full project control", icon: Crown },
    { role: "Editor", description: "Manage project work", icon: Pencil },
    { role: "Viewer", description: "Read-only access", icon: Eye },
];

function ProjectMembers({ project }) {
    const [members, setMembers] = useState([]);
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isInviteOpen, setIsInviteOpen] = useState(false);

    const isOwner = project.role === "owner";

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

    const handleInvite = async (identifier, role) => {
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

    const handleRoleChange = async (userId, role) => {
        try {
            await projectService.changeMemberRole(project.id, userId, role);
            setMembers((current) =>
                current.map((member) =>
                    member.user_id === userId ? { ...member, role } : member
                )
            );
            toast.success("Member role updated.");
        } catch (error) {
            console.error("Error changing member role:", error);
            toast.error(error.response?.data?.error || "Unable to change member role.");
        }
    };

    const handleRemove = async (userId) => {
        if (!window.confirm("Remove this member from the project?")) return;

        try {
            await projectService.removeMember(project.id, userId);
            setMembers((current) => current.filter((member) => member.user_id !== userId));
            toast.success("Member removed.");
        } catch (error) {
            console.error("Error removing member:", error);
            toast.error(error.response?.data?.error || "Unable to remove member.");
        }
    };

    const handleCancelInvite = async (inviteId) => {
        try {
            await inviteService.cancelInvite(project.id, inviteId);
            setInvites((current) => current.filter((invite) => invite.id !== inviteId));
            toast.success("Invitation cancelled.");
        } catch (error) {
            console.error("Error cancelling invitation:", error);
            toast.error(error.response?.data?.error || "Unable to cancel invitation.");
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-48 items-center justify-center rounded-3xl border border-white/55 bg-white/20 backdrop-blur-xl dark:border-white/[0.07] dark:bg-slate-900/20">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-green-500 dark:border-slate-700 dark:border-t-green-400" />
            </div>
        );
    }

    return (
        <>
            <section className="rounded-3xl border border-white/55 bg-white/20 p-4 shadow-[0_10px_35px_rgba(15,23,42,0.025)] backdrop-blur-xl dark:border-white/[0.07] dark:bg-slate-900/20 sm:p-5">

                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200">
                                Members
                            </h2>

                            <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                {members.length} {members.length === 1 ? "member" : "members"}
                                {isOwner && ` · ${invites.length} pending`}
                            </span>
                        </div>

                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                            Manage who can access and collaborate in this project.
                        </p>
                    </div>

                    {isOwner && (
                        <button
                            type="button"
                            onClick={() => setIsInviteOpen(true)}
                            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-green-500 px-3.5 font-semibold text-white shadow-[0_5px_15px_rgba(34,197,94,0.16)] transition hover:bg-green-600"
                            style={{ fontSize: "12px", lineHeight: "1" }}
                        >
                            <Plus size={14} />
                            Invite Member
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className={`mt-4 grid items-start gap-3 ${isOwner ? "lg:grid-cols-[minmax(0,2fr)_minmax(260px,0.8fr)]" : ""}`}>

                    {/* Project Members */}
                    <section className="overflow-hidden rounded-2xl border border-white/80 bg-white/60 shadow-[0_6px_22px_rgba(15,23,42,0.035)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/45">
                        <div className="flex items-center justify-between border-b border-white/60 px-4 py-3 dark:border-white/[0.07]">
                            <div className="flex items-center gap-2">
                                <Users size={14} className="text-green-500" />

                                <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    Project Members
                                </h3>
                            </div>

                            <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                {members.length} {members.length === 1 ? "member" : "members"}
                            </span>
                        </div>

                        {members.length ? (
                            <div className="divide-y divide-slate-100/70 dark:divide-white/[0.06]">
                                {members.map((member) => (
                                    <div
                                        key={member.user_id}
                                        className="flex min-h-[58px] items-center gap-3 px-4 py-3 transition hover:bg-white/30 dark:hover:bg-white/[0.015]"
                                    >
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-50 text-[10px] font-semibold text-green-600 dark:bg-green-950/40 dark:text-green-400">
                                            {getInitials(member)}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                                                {member.display_name || member.username}
                                            </p>

                                            {member.display_name && member.username && (
                                                <p className="mt-0.5 truncate text-[10px] text-slate-400 dark:text-slate-500">
                                                    @{member.username}
                                                </p>
                                            )}
                                        </div>

                                        {isOwner && member.role !== "owner" ? (
                                            <div className="flex shrink-0 items-center gap-1">
                                                <select
                                                    value={member.role}
                                                    onChange={(event) => handleRoleChange(member.user_id, event.target.value)}
                                                    aria-label={`Role for ${member.display_name || member.username}`}
                                                    className="h-8 rounded-lg border border-slate-100/80 bg-slate-50/60 px-2 text-[11px] font-medium text-slate-500 outline-none transition focus:border-green-300 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-400"
                                                >
                                                    <option value="editor">Editor</option>
                                                    <option value="viewer">Viewer</option>
                                                </select>

                                                <button
                                                    type="button"
                                                    onClick={() => handleRemove(member.user_id)}
                                                    aria-label={`Remove ${member.display_name || member.username}`}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20"
                                                >
                                                    <MoreHorizontal size={15} />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="rounded-full bg-slate-100/70 px-2.5 py-1 text-[10px] font-medium capitalize text-slate-500 dark:bg-white/[0.05] dark:text-slate-400">
                                                {member.role}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="px-4 py-8 text-center text-xs text-slate-400">
                                No members found.
                            </div>
                        )}
                    </section>

                    {/* Owner Sidebar */}
                    {isOwner && (
                        <aside className="overflow-hidden rounded-2xl border border-white/80 bg-white/40 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/30">

                            {/* Pending Invitations */}
                            <section>
                                <div className="flex items-center gap-2 border-b border-white/60 px-4 py-3 dark:border-white/[0.07]">
                                    <UserPlus size={14} className="text-green-500" />

                                    <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                        Pending Invitations
                                    </h3>
                                </div>

                                {invites.length ? (
                                    <div className="divide-y divide-slate-100/60 dark:divide-white/[0.05]">
                                        {invites.map((invite) => (
                                            <div
                                                key={invite.id}
                                                className="flex min-h-[58px] items-center justify-between gap-3 px-4 py-3"
                                            >
                                                <div className="min-w-0">
                                                    <p className="truncate text-xs font-medium text-slate-600 dark:text-slate-300">
                                                        {invite.invitee?.display_name ||
                                                            invite.invitee?.username ||
                                                            invite.invitee_username ||
                                                            "Pending member"}
                                                    </p>

                                                    <p className="mt-0.5 text-[10px] capitalize text-slate-400 dark:text-slate-500">
                                                        {invite.role}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCancelInvite(invite.id)}
                                                    className="inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-red-100/80 bg-red-50/50 px-2.5 font-medium text-red-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 dark:border-red-900/30 dark:bg-red-950/15 dark:text-red-400 dark:hover:bg-red-950/30"
                                                    style={{ fontSize: "11px", lineHeight: "1" }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex min-h-[82px] flex-col items-center justify-center px-4 py-3 text-center">
                                        <UserPlus size={14} className="text-green-500" />

                                        <p className="mt-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                            No pending invitations
                                        </p>

                                        <p className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">
                                            Invited members will appear here.
                                        </p>
                                    </div>
                                )}
                            </section>

                            {/* Access Roles */}
                            <section className="border-t border-white/60 px-4 py-3 dark:border-white/[0.07]">
                                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                    Access Roles
                                </p>

                                <div className="space-y-0.5">
                                    {accessRoles.map(({ role, description, icon: Icon }) => (
                                        <div
                                            key={role}
                                            className="flex items-center gap-2.5 py-1.5"
                                        >
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/65 text-green-500 dark:bg-white/[0.04] dark:text-green-400">
                                                <Icon size={12} />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-[11px] font-semibold leading-tight text-slate-600 dark:text-slate-300">
                                                    {role}
                                                </p>

                                                <p className="mt-0.5 text-[10px] leading-tight text-slate-400 dark:text-slate-500">
                                                    {description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </aside>
                    )}
                </div>
            </section>

            <InviteMember
                isOpen={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
                onSubmit={handleInvite}
            />
        </>
    );
}

export default ProjectMembers;