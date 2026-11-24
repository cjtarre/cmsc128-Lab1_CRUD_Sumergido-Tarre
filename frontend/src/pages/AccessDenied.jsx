import { ArrowLeft, ShieldX } from "lucide-react";
import { Link } from "react-router-dom";
import accessDeniedIllustration from "../assets/illustrations/access-denied-illustration.png";

function AccessDenied({
    title = "Access denied",
    message = "You don't have permission to access this page.",
    backTo = "/projects",
    backLabel = "Back to Projects",
}) {
    return (
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8">
            <div className="w-full max-w-md text-center">
                <img
                    src={accessDeniedIllustration}
                    alt=""
                    className="mx-auto w-full max-w-[260px]"
                />

                <div className="mt-5 flex items-center justify-center gap-2">
                    <ShieldX size={18} className="text-green-500" />

                    <h1 className="text-xl font-semibold text-slate-700 dark:text-slate-200">
                        {title}
                    </h1>
                </div>

                <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-400 dark:text-slate-500">
                    {message}
                </p>

                <Link
                    to={backTo}
                    className="mt-5 inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-green-500 px-4 font-semibold text-white shadow-[0_5px_15px_rgba(34,197,94,0.16)] transition hover:bg-green-600"
                    style={{ fontSize: "12px", lineHeight: "1" }}
                >
                    <ArrowLeft size={14} />
                    {backLabel}
                </Link>
            </div>
        </div>
    );
}

export default AccessDenied;