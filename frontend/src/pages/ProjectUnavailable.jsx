import { ArrowLeft, FolderKanban } from "lucide-react";
import { Link } from "react-router-dom";
import notFoundIllustration from "../assets/illustrations/not-found-illustration.png";

function ProjectUnavailable() {
    return (
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8">
            <div className="w-full max-w-md text-center">
                <img
                    src={notFoundIllustration}
                    alt=""
                    className="mx-auto w-full max-w-[260px]"
                />

                <div className="mt-5 flex items-center justify-center gap-2">
                    <FolderKanban size={18} className="text-green-500" />

                    <h1 className="text-xl font-semibold text-slate-700 dark:text-slate-200">
                        Project unavailable
                    </h1>
                </div>

                <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-400 dark:text-slate-500">
                    This project could not be found or you may no longer have access to it.
                </p>

                <Link
                    to="/projects"
                    className="mt-5 inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-green-500 px-4 font-semibold text-white shadow-[0_5px_15px_rgba(34,197,94,0.16)] transition hover:bg-green-600"
                    style={{ fontSize: "12px", lineHeight: "1" }}
                >
                    <ArrowLeft size={14} />
                    Back to Projects
                </Link>
            </div>
        </div>
    );
}

export default ProjectUnavailable;