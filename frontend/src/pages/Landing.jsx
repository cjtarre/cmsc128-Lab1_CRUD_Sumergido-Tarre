import { ArrowRight, ListTodo, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

function Landing() {
    return (
        <div className="min-h-screen bg-[#f5faf7]">
            <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
                <Link
                    to="/"
                    className="flex items-center gap-2 text-lg font-bold text-slate-800"
                >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-500">
                        <GraduationCap size={18} strokeWidth={1.8} />
                    </span>
                    StudyBoard
                </Link>

                <Link
                    to="/dashboard"
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-green-50 hover:text-green-600"
                >
                    Log in
                </Link>
            </header>

            <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6">
                <div className="w-full max-w-2xl text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-green-100 bg-white text-green-500 shadow-sm">
                        <ListTodo size={30} strokeWidth={1.7} />
                    </div>

                    <p className="mt-6 text-xs font-medium uppercase tracking-widest text-green-500">
                        Simple task management
                    </p>

                    <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-800 sm:text-5xl">
                        Stay organized.
                        <br />
                        <span className="text-green-500">
                            Stay on track.
                        </span>
                    </h1>

                    <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
                        Keep your schoolwork, deadlines, and daily tasks
                        organized in one simple place.
                    </p>

                    <Link
                        to="/dashboard"
                        className="mt-7 inline-flex items-center gap-2 rounded-lg bg-green-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-green-600 hover:shadow"
                    >
                        Get Started
                        <ArrowRight size={16} />
                    </Link>

                    <div className="mx-auto mt-16 grid max-w-md grid-cols-3 divide-x divide-slate-200 border-y border-slate-200 py-4">
                        <div>
                            <p className="text-sm font-semibold text-slate-700">
                                Tasks
                            </p>
                            <p className="mt-1 text-[10px] text-slate-400">
                                Stay organized
                            </p>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-slate-700">
                                Deadlines
                            </p>
                            <p className="mt-1 text-[10px] text-slate-400">
                                Stay on time
                            </p>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-slate-700">
                                Progress
                            </p>
                            <p className="mt-1 text-[10px] text-slate-400">
                                Keep moving
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Landing;