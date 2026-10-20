import { AlertTriangle, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useRef } from "react";

function ConfirmDialog({
    isOpen,
    title = "Are you sure?",
    message = "This action cannot be undone.",
    confirmText = "Confirm",
    cancelText = "Cancel",
    loading = false,
    loadingText = "Please wait...",
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
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/25 px-4 backdrop-blur-sm dark:bg-black/55"
            onClick={() => {
                if (!loading) onCancel?.();
            }}
        >
            <div
                ref={dialogRef}
                tabIndex="-1"
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                aria-describedby="confirm-dialog-message"
                className="relative w-full max-w-md rounded-2xl border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl outline-none dark:border-white/10 dark:bg-slate-900/90 dark:shadow-black/40"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-100/80 bg-red-50/80 text-red-500 shadow-sm dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-400">
                            <AlertTriangle size={21} strokeWidth={2.1} />
                        </div>

                        <h2 id="confirm-dialog-title" className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                            {title}
                        </h2>
                    </div>

                    <button
                        type="button"
                        disabled={loading}
                        onClick={onCancel}
                        aria-label="Close dialog"
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/70 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-200/70 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-500 dark:hover:bg-white/[0.06] dark:hover:text-slate-300 dark:focus:ring-slate-700"
                    >
                        <X size={18} />
                    </button>
                </div>

                <p id="confirm-dialog-message" className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {message}
                </p>

                <div className="mt-6 flex flex-col-reverse gap-2.5 min-[360px]:flex-row min-[360px]:justify-end">
                    <button
                        type="button"
                        disabled={loading}
                        onClick={onCancel}
                        className="rounded-xl border border-slate-200/80 bg-white/50 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200/70 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.07] dark:hover:text-slate-100 dark:focus:ring-slate-700"
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        disabled={loading}
                        onClick={onConfirm}
                        className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(239,68,68,0.18)] transition hover:bg-red-600 hover:shadow-[0_8px_22px_rgba(239,68,68,0.24)] focus:outline-none focus:ring-2 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-red-600 dark:hover:bg-red-500 dark:focus:ring-red-900"
                    >
                        {loading ? loadingText : confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default ConfirmDialog;