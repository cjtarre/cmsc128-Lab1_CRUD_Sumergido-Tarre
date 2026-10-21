import { Check, Mail, X } from "lucide-react";

import { useInviteResponse } from "../hooks/useInviteResponse";
import { getInviteNotificationMeta } from "../utils/inviteNotificationUtils";

function InviteNotification({ notification, onRead, onRefresh, onClose }) {
    const { responding, respond, open } = useInviteResponse(notification, onRead, onRefresh, onClose);
    const { actor, projectId, projectName, role, status, pending, accepted, time } = getInviteNotificationMeta(notification);

    return (
        <div onClick={open}
            className={`flex items-start gap-3 px-4 py-3 transition dark:hover:bg-white/[0.03] sm:px-5 ${accepted ? "cursor-pointer hover:bg-green-50/40" : ""} ${notification.read_at ? "" : "bg-green-50/25 dark:bg-green-950/10"}`}>
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-500 dark:bg-green-950/50 dark:text-green-400">
                <Mail size={15} />
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                    <p className="min-w-0 flex-1 text-xs font-semibold text-slate-700 dark:text-slate-200">Project invitation</p>

                    <div className="flex shrink-0 items-center gap-2">
                        {time && <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">{time}</span>}
                        {!notification.read_at && <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />}
                    </div>
                </div>

                <p className="mt-0.5 break-words text-xs leading-5 text-slate-500 dark:text-slate-400">
                    <span className="font-medium">{actor}</span> invited you to{" "}
                    <span className="font-medium text-slate-600 dark:text-slate-300">{projectName}</span>
                    {role ? <>{" "}as <span className="font-medium capitalize text-green-600 dark:text-green-400">{role}</span>.</> : "."}
                </p>

                {pending ? (
                    <div className="mt-3 flex flex-col gap-2 min-[360px]:flex-row min-[360px]:justify-end">
                        <button type="button" disabled={responding}
                            onClick={(event) => { event.stopPropagation(); respond(false); }}
                            className="inline-flex h-8 items-center justify-center gap-1 rounded-xl px-3 font-medium text-slate-500 transition hover:bg-slate-100 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-white/[0.05]"
                            style={{ fontSize: "11px", lineHeight: "1" }}>
                            <X size={13} /> Decline
                        </button>

                        <button type="button" disabled={responding}
                            onClick={(event) => { event.stopPropagation(); respond(true); }}
                            className="inline-flex h-8 items-center justify-center gap-1 rounded-xl bg-green-500 px-3 font-semibold text-white transition hover:bg-green-600 disabled:opacity-50"
                            style={{ fontSize: "11px", lineHeight: "1" }}>
                            <Check size={13} />
                            {responding ? "Responding..." : "Accept"}
                        </button>
                    </div>
                ) : (
                    <>
                        <p className="mt-2 text-[10px] font-medium capitalize text-slate-400 dark:text-slate-500">
                            Invitation {status || "no longer available"}
                        </p>

                        {accepted && projectId && <p className="mt-1 text-[10px] text-green-600 dark:text-green-400">Open project</p>}
                    </>
                )}
            </div>
        </div>
    );
}

export default InviteNotification;