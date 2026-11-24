import { Toaster } from "sonner";

function AppToaster() {
    return (
        <Toaster
            position="top-right"
            offset="24px"
            mobileOffset="12px"
            closeButton
            toastOptions={{
                className: "!w-[calc(100vw-24px)] !max-w-[360px] !rounded-2xl !border !border-white/70 !bg-white/85 !px-4 !py-3.5 !shadow-[0_12px_35px_rgba(15,23,42,0.12)] !backdrop-blur-xl dark:!border-white/10 dark:!bg-slate-900/85 dark:!shadow-black/30 sm:!w-[360px] sm:!px-5 sm:!py-4",
                classNames: {
                    title: "!font-semibold !text-green-700 dark:!text-green-400",
                    description: "!mt-1 !text-slate-500 dark:!text-slate-400",
                    closeButton: "!border-white/70 !bg-white/80 !text-slate-400 !shadow-sm hover:!bg-green-50 hover:!text-green-600 dark:!border-white/10 dark:!bg-slate-800/80 dark:!text-slate-500 dark:hover:!bg-green-950/60 dark:hover:!text-green-400",
                    icon: "!text-green-500 dark:!text-green-400",
                },
                style: { fontSize: "12px" },
            }}
        />
    );
}

export default AppToaster;