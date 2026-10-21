import { useState } from "react";
import { UserPlus, X } from "lucide-react";

import { PROJECT_INVITE_ROLES, PROJECT_ROLE } from "../../constants/projectOptions";
import { handleInviteMember } from "../../handlers/projectMemberHandlers";

function InviteMember({ isOpen, onClose, onSubmit }) {
    const [identifier, setIdentifier] = useState("");
    const [role, setRole] = useState(PROJECT_ROLE.VIEWER);
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-slate-900/20 px-4 pb-6 pt-24 backdrop-blur-sm dark:bg-black/55">
            <div className="w-full max-w-sm rounded-2xl border border-white/75 bg-white/90 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.14)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/90">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400"><UserPlus size={16} /></div>
                        <div>
                            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Invite Member</h2>
                            <p className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">Invite someone by username or email.</p>
                        </div>
                    </div>

                    <button type="button" onClick={onClose} aria-label="Close invite member"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100/70 hover:text-slate-600 dark:hover:bg-white/[0.05] dark:hover:text-slate-300">
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={(event) => handleInviteMember(event, { identifier, role, onSubmit, onClose, setIdentifier, setRole, setSubmitting, defaultRole: PROJECT_ROLE.VIEWER })} className="mt-5 space-y-4">
                    <div>
                        <label className="mb-1.5 block text-[10px] font-semibold text-slate-500 dark:text-slate-400">Username or Email</label>
                        <input value={identifier} onChange={(event) => setIdentifier(event.target.value)} autoFocus required placeholder="username or email"
                            className="h-10 w-full rounded-xl border border-slate-200/80 bg-white/60 px-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-green-300 focus:ring-2 focus:ring-green-100/60 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:focus:border-green-800 dark:focus:ring-green-950/50" />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-[10px] font-semibold text-slate-500 dark:text-slate-400">Access Role</label>
                        <select value={role} onChange={(event) => setRole(event.target.value)}
                            className="h-10 w-full rounded-xl border border-slate-200/80 bg-white/60 px-3 text-xs text-slate-700 outline-none transition focus:border-green-300 focus:ring-2 focus:ring-green-100/60 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-green-800 dark:focus:ring-green-950/50">
                            {PROJECT_INVITE_ROLES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose}
                            className="rounded-xl px-3.5 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100/60 dark:text-slate-400 dark:hover:bg-white/[0.04]">
                            Cancel
                        </button>

                        <button type="submit" disabled={submitting || !identifier.trim()}
                            className="rounded-xl bg-green-500 px-4 py-2 text-xs font-semibold text-white shadow-[0_5px_15px_rgba(34,197,94,0.15)] transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50">
                            {submitting ? "Sending..." : "Send Invite"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default InviteMember;
