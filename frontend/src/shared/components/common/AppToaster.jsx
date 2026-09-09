import { Toaster } from "sonner";

function AppToaster() {
    return (
        <Toaster
            position="top-right"
            offset="24px"
            closeButton
            toastOptions={{
                className:
                    "!w-[360px] !rounded-xl !border !border-slate-200 !bg-white !px-5 !py-4 !shadow-lg",

                classNames: {
                    title: "!text-sm !font-semibold !text-green-800",
                    description: "!mt-1 !text-xs !text-slate-500",

                    closeButton: "!border-slate-200 !bg-white !text-slate-400 hover:!bg-green-50 hover:!text-green-600",
                    icon: "!text-green-500",
                },
            }}
        />
    );
}

export default AppToaster;