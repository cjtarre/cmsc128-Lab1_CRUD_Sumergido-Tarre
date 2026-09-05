import { ArrowRight, ListTodo } from "lucide-react";
import { Link } from "react-router-dom";

function Landing() {
    return (
        <div className="min-h-screen bg-[#f5faf7]">
            <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
                <Link
                    to="/"
                    className="text-xl font-bold text-slate-800"
                >
                    StudyBoard
                </Link>

                <Link
                    to="/dashboard"
                    className="text-sm font-medium text-green-600 transition hover:text-green-700"
                >
                    Log in
                </Link>
            </header>

            <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6">
                <div className="w-full max-w-2xl text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-500">
                        <ListTodo size={28} strokeWidth={1.8} />
                    </div>

                    <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-800 sm:text-5xl">
                        Stay organized.
                        <br />
                        <span className="text-green-500">
                            Stay on track.
                        </span>
                    </h1>

                    <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-slate-500 sm:text-base">
                        Keep your tasks organized and stay on top of
                        your schoolwork and daily responsibilities.
                    </p>

                    <Link
                        to="/dashboard"
                        className="mt-7 inline-flex items-center gap-2 rounded-lg bg-green-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-green-600 hover:shadow"
                    >
                        Get Started
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </main>
        </div>
    );
}

export default Landing;