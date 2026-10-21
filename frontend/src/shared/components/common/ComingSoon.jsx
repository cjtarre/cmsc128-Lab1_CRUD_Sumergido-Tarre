import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import comingSoonIllustration from "../../../assets/illustrations/coming-soon-illustration.png";

function ComingSoon({ title = "Coming Soon", description = "This feature is currently being worked on." }) {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-[360px] items-center justify-center px-4 py-5 sm:min-h-[420px] sm:px-6 sm:py-0">
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/70 bg-white/75 px-5 py-6 text-center shadow-[0_15px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75 dark:shadow-black/25 sm:px-8 sm:py-8">
                <div aria-hidden="true" className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-200/30 blur-3xl dark:bg-emerald-500/10" />
                <div aria-hidden="true" className="absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-green-200/25 blur-3xl dark:bg-green-600/[0.07]" />

                <div className="relative">
                    <img src={comingSoonIllustration} alt="" className="mx-auto w-full max-w-[175px] object-contain sm:max-w-[230px]" />

                    <h1 className="mt-2 font-semibold text-slate-800 dark:text-white sm:text-xl" style={{ fontSize: "18px" }}>
                        {title}
                    </h1>

                    <p className="mx-auto mt-2 max-w-sm leading-5 text-slate-500 dark:text-slate-400 sm:leading-6" style={{ fontSize: "12px" }}>
                        {description}
                    </p>

                    <span className="mt-4 inline-flex rounded-full border border-white/70 bg-white/60 px-3 py-1 font-medium text-slate-500 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400" style={{ fontSize: "11px" }}>
                        Coming Soon
                    </span>

                    <div className="mt-4 sm:mt-5">
                        <button
                            type="button"
                            onClick={() => navigate("/my-tasks")}
                            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 font-medium text-green-600 transition hover:bg-green-50/70 hover:text-green-700 dark:text-green-400 dark:hover:bg-white/[0.05] dark:hover:text-green-300"
                            style={{ fontSize: "12px" }}
                        >
                            <ArrowLeft size={14} />
                            Back to Tasks
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ComingSoon;