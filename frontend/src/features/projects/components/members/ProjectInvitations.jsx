import { Check, Mail, X } from "lucide-react";

import { getDisplayName } from "../../../../shared/utils/userUtils";

// Display and respond to pending project invitations.
function ProjectInvitations({ invites, respondingInviteId, onRespond }) {
    if (!invites.length) return null;

    return (
        <section className="mt-6">
            <div className="mb-3 flex items-center gap-2 px-1">
                <Mail size={14} className="text-green-500" />
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Pending Invitations</h2>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-green-100 px-1.5 text-[10px] font-semibold text-green-600 dark:bg-green-950/50 dark:text-green-400">
                    {invites.length}
                </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(300px,380px))]">
                {invites.map((invite) => {
                    const inviter = getDisplayName(invite.inviter, "A Takda user");
                    const responding = respondingInviteId === invite.id;

                    return (
                        <div key={invite.id}
                            className="rounded-2xl border border-green-100/80 bg-white/50 p-4 shadow-[0_8px_30px_rgba(15,23,42,0.035)] backdrop-blur-xl dark:border-green-900/30 dark:bg-white/[0.025]">
                            <div className="flex items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-500 dark:bg-green-950/40 dark:text-green-400">
                                    <Mail size={16} />
                                </div>

                                <div className="min-w-0">
                                    <h3 className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                                        {invite.project?.project_name || "Project invitation"}
                                    </h3>
                                    <p className="mt-1 text-[10px] leading-4 text-slate-400 dark:text-slate-500">
                                        Invited by{" "}
                                        <span className="font-medium text-slate-500 dark:text-slate-400">{inviter}</span>{" "}
                                        as{" "}
                                        <span className="font-medium capitalize text-green-600 dark:text-green-400">{invite.role}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-col justify-end gap-2 min-[360px]:flex-row">
                                <button type="button" disabled={responding} onClick={() => onRespond(invite, false)}
                                    className="inline-flex h-8 items-center justify-center gap-1 rounded-xl px-3 font-medium text-slate-500 transition hover:bg-slate-100/70 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:bg-white/[0.05]"
                                    style={{ fontSize: "11px", lineHeight: "1" }}>
                                    <X size={13} />
                                    Decline
                                </button>

                                <button type="button" disabled={responding} onClick={() => onRespond(invite, true)}
                                    className="inline-flex h-8 items-center justify-center gap-1 rounded-xl bg-green-500 px-3 font-semibold text-white shadow-[0_4px_12px_rgba(34,197,94,0.15)] transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                                    style={{ fontSize: "11px", lineHeight: "1" }}>
                                    <Check size={13} />
                                    {responding ? "Responding..." : "Accept"}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default ProjectInvitations;
