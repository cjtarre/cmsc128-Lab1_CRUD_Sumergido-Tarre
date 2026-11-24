import { Home } from "lucide-react";
import { Link } from "react-router-dom";
import notFoundIllustration from "../assets/illustrations/not-found-illustration.png";

function NotFound() {
    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6">
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/70 bg-white/75 px-6 py-8 text-center shadow-[0_10px_35px_rgba(15,23,42,0.055)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75 dark:shadow-black/20 sm:px-10 sm:py-10">
                <div aria-hidden="true" className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-green-200/25 blur-3xl dark:bg-green-500/[0.06]" />
                <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -right-16 h-40 w-40 rounded-full bg-emerald-200/25 blur-3xl dark:bg-emerald-500/[0.06]" />

                <div className="relative">
                    <img
                        src={notFoundIllustration}
                        alt=""
                        className="mx-auto w-full max-w-[230px] object-contain"
                    />

                    <h1 className="mt-2 text-6xl font-bold tracking-tight text-green-500 sm:text-7xl">
                        404
                    </h1>

                    <h2 className="mt-2 text-xl font-semibold text-slate-800 dark:text-white sm:text-2xl">
                        Page not found
                    </h2>

                    <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500 dark:text-slate-400">
                        Sorry, the page you're looking for doesn't exist.
                    </p>

                    <Link
                        to="/my-tasks"
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_5px_15px_rgba(34,197,94,0.18)] transition hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300/50"
                    >
                        <Home size={17} />
                        Back to Tasks
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default NotFound;