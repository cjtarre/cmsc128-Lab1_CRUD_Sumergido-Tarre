import { CheckCircle2, GraduationCap, ListTodo, Users } from "lucide-react";
import { Link } from "react-router-dom";

function About() {
    return (
        <div className="min-h-screen bg-[#f5faf7] text-slate-800">
            <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
                    <Link to="/" className="flex items-center gap-2 text-lg font-bold">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-500">
                            <GraduationCap size={20} strokeWidth={1.8} />
                        </span>
                        StudyBoard
                    </Link>

                    <nav className="flex items-center gap-1">
                        <Link to="/about" className="rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-600">
                            About
                        </Link>
                        <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-green-50 hover:text-green-600">
                            Log in
                        </Link>
                        <Link to="/signup" className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600">
                            Sign up
                        </Link>
                    </nav>
                </div>
            </header>

            <main>
                <section className="px-6 py-24 sm:py-32">
                    <div className="mx-auto max-w-3xl text-center">
                        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-500">
                            <GraduationCap size={28} strokeWidth={1.7} />
                        </div>

                        <p className="text-xs font-semibold uppercase tracking-widest text-green-500">
                            About StudyBoard
                        </p>

                        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                            Built to make student life a little easier.
                        </h1>

                        <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                            StudyBoard is a simple task management app designed to help students
                            organize schoolwork, keep track of deadlines, and stay on top of
                            everyday tasks.
                        </p>
                    </div>
                </section>

                <section className="border-y border-slate-200 bg-white px-6 py-16">
                    <div className="mx-auto max-w-5xl">
                        <div className="mb-10 text-center">
                            <p className="text-xs font-semibold uppercase tracking-widest text-green-500">
                                What we focus on
                            </p>

                            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                                Simple tools for staying organized.
                            </h2>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <InfoCard
                                icon={ListTodo}
                                title="Organize"
                                text="Keep assignments, tasks, and responsibilities in one place."
                            />

                            <InfoCard
                                icon={CheckCircle2}
                                title="Plan"
                                text="Keep deadlines visible and know what needs your attention."
                            />

                            <InfoCard
                                icon={Users}
                                title="Stay on track"
                                text="Build better study habits by keeping your work manageable."
                            />
                        </div>
                    </div>
                </section>

                <section className="px-6 py-20">
                    <div className="mx-auto max-w-3xl">
                        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm sm:px-12">
                            <Users size={28} strokeWidth={1.7} className="mx-auto text-green-500" />

                            <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-green-500">
                                Meet the team
                            </p>

                            <h2 className="mt-2 text-3xl font-bold tracking-tight">
                                Built by students, for students.
                            </h2>

                            <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-slate-500">
                                StudyBoard was created as a student project with the goal of
                                making everyday schoolwork a little easier to manage.
                            </p>

                            <div className="mt-8 grid gap-3 sm:grid-cols-2">
                                <TeamCard name="Ma. Christie Jude Tarre" />
                                <TeamCard name="Gabrielle Sumergido" />
                            </div>

                            <p className="mt-8 text-xs text-slate-400">
                                CMSC 128 · Software Engineering
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t border-slate-200 bg-white px-6 py-7">
                <div className="mx-auto flex max-w-6xl items-center justify-between">
                    <div className="flex items-center gap-2">
                        <GraduationCap size={17} className="text-green-500" />
                        <span className="text-sm font-semibold">StudyBoard</span>
                    </div>

                    <p className="text-xs text-slate-400">
                        Simple task management for students.
                    </p>
                </div>
            </footer>
        </div>
    );
}

function InfoCard({ icon: Icon, title, text }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-[#f8fbf9] p-6 text-center transition hover:-translate-y-1 hover:shadow-md">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-green-500 shadow-sm">
                <Icon size={21} strokeWidth={1.8} />
            </div>

            <h3 className="mt-5 font-semibold text-slate-700">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
        </div>
    );
}

function TeamCard({ name }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-[#f8fbf9] px-5 py-4 text-sm font-medium text-slate-700">
            {name}
        </div>
    );
}

export default About;