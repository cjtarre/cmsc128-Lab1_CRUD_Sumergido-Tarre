import { Home } from "lucide-react";
import { Link } from "react-router-dom";

function NotFound() {
    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6">
            <div className="text-center">
                <h1 className="text-7xl font-bold text-green-500">
                    404
                </h1>

                <h2 className="mt-4 text-2xl font-semibold text-slate-800">
                    Page not found
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                    Sorry, the page you're looking for doesn't exist.
                </p>

                <Link
                    to="/"
                    className="mt-6 inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600"
                >
                    <Home size={17} />
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
}

export default NotFound;