import { useNavigate } from "react-router-dom";

import { handleOpenNotification } from "../handlers/notificationHandlers";
import { getNotificationDetails } from "../utils/notificationUtils";

function NotificationMessage({ details }) {
    const subject = <span className="font-medium text-slate-600 dark:text-slate-300">{details.subject}</span>;
    const actor = <span className="font-medium">{details.actor}</span>;

    if (details.messageType === "assigned") return <>{actor} assigned you {subject}.</>;
    if (details.messageType === "deleted") return <>{subject} was deleted by {actor}. You no longer have access to this project.</>;
    if (details.messageType === "restored") return <>{subject} was restored by {actor}.</>;

    return <>There is a new update in one of your projects.</>;
}

function NotificationItem({ notification, onRead, onClose }) {
    const navigate = useNavigate();
    const details = getNotificationDetails(notification);
    const { icon: Icon, projectId, time } = details;

    return (
        <button type="button"
            onClick={() => handleOpenNotification({ notification, canOpen: details.canOpen, projectId, onRead, onClose, navigate })}
            className={`flex w-full min-w-0 items-start gap-2.5 px-3 py-3 text-left transition dark:hover:bg-white/[0.03] sm:gap-3 sm:px-5 ${details.canOpen ? "hover:bg-green-50/40" : "cursor-default"} ${notification.read_at ? "" : "bg-green-50/25 dark:bg-green-950/10"}`}>
            <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${details.iconClass}`}>
                <Icon size={15} />
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-start gap-2">
                    <p className="min-w-0 flex-1 break-words text-xs font-semibold text-slate-700 dark:text-slate-200">{details.title}</p>

                    <div className="flex shrink-0 items-center gap-2">
                        {time && <span className="whitespace-nowrap text-[10px] font-normal text-slate-400 dark:text-slate-500">{time}</span>}
                        {!notification.read_at && <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />}
                    </div>
                </div>

                <p className="mt-0.5 break-words text-xs leading-5 text-slate-500 dark:text-slate-400">
                    <NotificationMessage details={details} />
                </p>

                {details.action && <p className="mt-1 text-[10px] text-green-600 dark:text-green-400">{details.action}</p>}
            </div>
        </button>
    );
}

export default NotificationItem;