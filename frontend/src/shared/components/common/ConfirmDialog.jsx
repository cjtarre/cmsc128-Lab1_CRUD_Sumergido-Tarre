import { AlertTriangle, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useRef } from "react";

function ConfirmDialog({
    isOpen,
    title = "Are you sure?",
    message = "This action cannot be undone.",
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
}) {
    const dialogRef = useRef(null);

    useEffect(() => {
        if (isOpen) dialogRef.current?.focus();
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/30 px-4 backdrop-blur-md dark:bg-black/50"
            onClick={onCancel}
        >
            <div
                ref={dialogRef}
                tabIndex="-1"
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                aria-describedby="confirm-dialog-message"
                className="relative w-full max-w-md rounded-2xl border border-white/60 bg-white/95 p-6 shadow-xl outline-none dark:border-slate-700 dark:bg-slate-900"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-950/50 dark:text-red-400">
                            <AlertTriangle size={22} strokeWidth={2.2} />
                        </div>

                        <h2
                            id="confirm-dialog-title"
                            className="text-lg font-semibold text-slate-800 dark:text-slate-100"
                        >
                            {title}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onCancel}
                        aria-label="Close dialog"
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300 dark:focus:ring-slate-700"
                    >
                        <X size={18} />
                    </button>
                </div>

                <p
                    id="confirm-dialog-message"
                    className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400"
                >
                    {message}
                </p>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-200 dark:bg-red-600 dark:hover:bg-red-500 dark:focus:ring-red-900"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default ConfirmDialog;