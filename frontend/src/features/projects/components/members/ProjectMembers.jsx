import { useState } from "react";
import { LogOut, MoreHorizontal, Plus, Sprout, UserPlus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

import ConfirmDialog from "../../../../shared/components/common/ConfirmDialog";
import { getDisplayName, getInitials } from "../../../../shared/utils/userUtils";
import { PROJECT_ACCESS_ROLES, PROJECT_ROLE } from "../../constants/projectOptions";
import { useProjectMembers } from "../../hooks/useProjectMembers";
import InviteMember from "../forms/InviteMember";
import RoleDropdown from "./RoleDropdown";
import { handleRemoveMember } from "../../handlers/projectMemberHandlers";

function ProjectMembers({ project }) {
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState(null);
    const [isLeaveOpen, setIsLeaveOpen] = useState(false);
    const navigate = useNavigate();
    const isOwner = project.role === PROJECT_ROLE.OWNER;
    const {
        members, invites, loading, removingMember, leavingProject,
        inviteMember, changeRole, removeMember, leaveProject, cancelInvite,
    } = useProjectMembers(project, isOwner);

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
                {/* Members heading */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200">Members</h2>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                {members.length} {members.length === 1 ? "member" : "members"}{isOwner && ` · ${invites.length} pending`}
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Manage who can access and collaborate in this project.</p>
                    </div>

                    <div className="flex flex-col gap-2 min-[360px]:flex-row">
                        <button type="button" onClick={() => setIsLeaveOpen(true)}
                            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50/60 px-3.5 font-semibold text-red-500 transition hover:border-red-300 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40"
                            style={{ fontSize: "12px", lineHeight: "1" }}>
                            <LogOut size={13} />
                            Leave Project
                        </button>

                        {isOwner && (
                            <button type="button" onClick={() => setIsInviteOpen(true)}
                                className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-green-500 px-3.5 font-semibold text-white shadow-[0_5px_15px_rgba(34,197,94,0.16)] transition hover:bg-green-600"
                                style={{ fontSize: "12px", lineHeight: "1" }}>
                                <Plus size={14} />
                                Invite Member
                            </button>
                        )}
                    </div>
                </div>

                <div className="mt-4 grid items-start gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(260px,0.8fr)]">
                    {/* Project members */}
                    <section className="rounded-2xl border border-white/80 bg-white/60 shadow-[0_6px_22px_rgba(15,23,42,0.035)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/45">
                        <div className="flex items-center justify-between border-b border-white/60 px-4 py-3 dark:border-white/[0.07]">
                            <div className="flex items-center gap-2">
                                <Users size={14} className="text-green-500" />
                                <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-300">Project Members</h3>
                            </div>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">{members.length} {members.length === 1 ? "member" : "members"}</span>
                        </div>

                        {members.length ? (
                            <div className="divide-y divide-slate-100/70 dark:divide-white/[0.06]">
                                {members.map((member) => {
                                    const displayName = getDisplayName(member);

                                    return (
                                        <div key={member.user_id} className="flex min-h-[58px] items-center gap-2.5 px-4 py-3 transition hover:bg-white/30 dark:hover:bg-white/[0.015] sm:gap-3">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-50 text-[10px] font-semibold text-green-600 dark:bg-green-950/40 dark:text-green-400">
                                                {getInitials(displayName)}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200">{displayName}</p>
                                                {member.display_name && member.username && <p className="mt-0.5 truncate text-[10px] text-slate-400 dark:text-slate-500">@{member.username}</p>}
                                            </div>

                                            {isOwner && member.role !== PROJECT_ROLE.OWNER ? (
                                                <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
                                                    <RoleDropdown member={member} onChange={changeRole} />
                                                    <button type="button" onClick={() => setMemberToRemove(member)} aria-label={`Remove ${displayName}`} title="Remove member"
                                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20">
                                                        <MoreHorizontal size={15} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="shrink-0 rounded-full bg-slate-100/70 px-2.5 py-1 font-medium capitalize text-slate-500 dark:bg-white/[0.05] dark:text-slate-400" style={{ fontSize: "10px" }}>
                                                    {member.role}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="px-4 py-8 text-center text-xs text-slate-400">No members found.</div>
                        )}
                    </section>

                    {/* Owner-only invitations and access-role reference */}
                    {isOwner ? (
                        <aside className="overflow-hidden rounded-2xl border border-white/80 bg-white/40 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/30">
                            <section>
                                <div className="flex items-center gap-2 border-b border-white/60 px-4 py-3 dark:border-white/[0.07]">
                                    <UserPlus size={14} className="text-green-500" />
                                    <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-300">Pending Invitations</h3>
                                </div>

                                {invites.length ? (
                                    <div className="max-h-[220px] divide-y divide-slate-100/60 overflow-y-auto overscroll-contain dark:divide-white/[0.05]">
                                        {invites.map((invite) => (
                                            <div key={invite.id} className="flex min-h-[58px] items-center justify-between gap-3 px-4 py-3">
                                                <div className="min-w-0">
                                                    <p className="truncate text-xs font-medium text-slate-600 dark:text-slate-300">{getDisplayName(invite.invitee, invite.invitee_username || "Pending member")}</p>
                                                    <p className="mt-0.5 text-[10px] capitalize text-slate-400 dark:text-slate-500">{invite.role}</p>
                                                </div>

                                                <button type="button" onClick={() => cancelInvite(invite.id)}
                                                    className="inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-red-100/80 bg-red-50/50 px-2.5 font-medium text-red-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 dark:border-red-900/30 dark:bg-red-950/15 dark:text-red-400 dark:hover:bg-red-950/30"
                                                    style={{ fontSize: "11px", lineHeight: "1" }}>
                                                    Cancel
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex min-h-[82px] flex-col items-center justify-center px-4 py-3 text-center">
                                        <UserPlus size={14} className="text-green-500" />
                                        <p className="mt-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">No pending invitations</p>
                                        <p className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">Invited members will appear here.</p>
                                    </div>
                                )}
                            </section>

                            <section className="border-t border-white/60 px-4 py-3 dark:border-white/[0.07]">
                                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Access Roles</p>
                                <div className="space-y-0.5">
                                    {PROJECT_ACCESS_ROLES.map(({ role, label, description, icon: Icon }) => (
                                        <div key={role} className="flex items-center gap-2.5 py-1.5">
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/65 text-green-500 dark:bg-white/[0.04] dark:text-green-400"><Icon size={12} /></div>
                                            <div className="min-w-0">
                                                <p className="text-[11px] font-semibold leading-tight text-slate-600 dark:text-slate-300">{label}</p>
                                                <p className="mt-0.5 text-[10px] leading-tight text-slate-400 dark:text-slate-500">{description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </aside>
                    ) : (
                        /* Non-owner encouragement card */
                        <aside className="relative overflow-hidden rounded-2xl border border-green-100/70 bg-gradient-to-br from-green-50/70 via-white/45 to-emerald-50/60 p-5 shadow-[0_6px_22px_rgba(15,23,42,0.025)] backdrop-blur-xl dark:border-green-900/30 dark:from-green-950/25 dark:via-slate-900/35 dark:to-emerald-950/20">
                            <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-green-200/30 blur-3xl dark:bg-green-500/[0.06]" />
                            <div className="relative flex h-full min-h-[150px] flex-col justify-center">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 text-green-500 shadow-sm dark:bg-white/[0.05] dark:text-green-400"><Sprout size={16} /></div>
                                <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">Better together</p>
                                <p className="mt-1.5 max-w-[230px] text-[11px] leading-5 text-slate-400 dark:text-slate-500">Small progress adds up when everyone works together.</p>

                                <div className="mt-4 flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                                    <span className="text-[10px] font-medium capitalize text-green-600 dark:text-green-400">{project.role} access</span>
                                </div>
                            </div>
                        </aside>
                    )}
                </div>
            </section>

            {/* Modals */}
            <InviteMember isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} onSubmit={inviteMember} />

            <ConfirmDialog
                isOpen={Boolean(memberToRemove)}
                title="Remove member?"
                message={memberToRemove ? `Remove ${getDisplayName(memberToRemove, "this member")} from ${project.project_name}? They will lose access to this project.` : ""}
                confirmText="Remove Member"
                loading={removingMember}
                loadingText="Removing..."
                onConfirm={() => handleRemoveMember(memberToRemove, removeMember, () => setMemberToRemove(null))}
                onCancel={() => { if (!removingMember) setMemberToRemove(null); }}
            />

            <ConfirmDialog
                isOpen={isLeaveOpen}
                title="Leave project?"
                message={`Leave "${project.project_name}"? You will lose access to this project and its tasks.`}
                confirmText="Leave Project"
                loading={leavingProject}
                loadingText="Leaving..."
                onConfirm={async () => {
                    if (await leaveProject()) {
                        setIsLeaveOpen(false);
                        navigate("/projects", { replace: true });
                    }
                }}
                onCancel={() => { if (!leavingProject) setIsLeaveOpen(false); }}
            />
        </>
    );
}

export default ProjectMembers;
