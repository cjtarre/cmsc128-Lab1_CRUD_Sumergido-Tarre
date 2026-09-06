import { ArrowLeft, Clock3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ComingSoon({
    title = "Coming Soon",
    description = "This feature is currently being worked on.",
}) {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-[420px] items-center justify-center px-6">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-500">
                    <Clock3 size={26} strokeWidth={1.8} />
                </div>

                <h1 className="mt-5 text-xl font-semibold text-slate-800">
                    {title}
                </h1>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    {description}
                </p>

                <span className="mt-5 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                    Coming Soon
                </span>

                <div className="mt-6">
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard")}
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-green-600 transition hover:bg-green-50 hover:text-green-700"
                    >
                        <ArrowLeft size={14} />
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ComingSoon;