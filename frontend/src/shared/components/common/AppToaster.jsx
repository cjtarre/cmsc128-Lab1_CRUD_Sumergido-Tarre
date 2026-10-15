import { Toaster } from "sonner";

function AppToaster() {
    return (
        <Toaster
            position="top-right"
            offset="24px"
            closeButton
            toastOptions={{
                className: "!w-[360px] !rounded-2xl !border !border-white/70 !bg-white/85 !px-5 !py-4 !shadow-[0_12px_35px_rgba(15,23,42,0.12)] !backdrop-blur-xl dark:!border-white/10 dark:!bg-slate-900/85 dark:!shadow-black/30",
                classNames: {
                    title: "!text-sm !font-semibold !text-green-700 dark:!text-green-400",
                    description: "!mt-1 !text-xs !text-slate-500 dark:!text-slate-400",
                    closeButton: "!border-white/70 !bg-white/80 !text-slate-400 !shadow-sm hover:!bg-green-50 hover:!text-green-600 dark:!border-white/10 dark:!bg-slate-800/80 dark:!text-slate-500 dark:hover:!bg-green-950/60 dark:hover:!text-green-400",
                    icon: "!text-green-500 dark:!text-green-400",
                },
            }}
        />
    );
}

export default AppToaster;