import { Toaster } from "sonner";

function AppToaster() {
    return (
        <Toaster
            position="top-right"
            offset="24px"
            closeButton
            toastOptions={{
                className:
                    "!w-[360px] !rounded-xl !border !border-slate-200 !bg-white !px-5 !py-4 !shadow-lg dark:!border-slate-700 dark:!bg-slate-900",

                classNames: {
                    title: "!text-sm !font-semibold !text-green-800 dark:!text-green-400",
                    description: "!mt-1 !text-xs !text-slate-500 dark:!text-slate-400",
                    closeButton:
                        "!border-slate-200 !bg-white !text-slate-400 hover:!bg-green-50 hover:!text-green-600 dark:!border-slate-700 dark:!bg-slate-900 dark:!text-slate-500 dark:hover:!bg-green-950 dark:hover:!text-green-400",
                    icon: "!text-green-500 dark:!text-green-400",
                },
            }}
        />
    );
}

export default AppToaster;