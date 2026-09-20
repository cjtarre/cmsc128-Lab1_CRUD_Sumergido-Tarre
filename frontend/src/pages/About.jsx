import { CheckCircle2, GraduationCap, ListTodo, Users } from "lucide-react";
import PublicNavbar from "../shared/components/navigation/PublicNavbar";

function About() {
    return (
        <div className="min-h-screen bg-[#f5faf7] text-slate-800 dark:bg-slate-950 dark:text-slate-100">
            <PublicNavbar />

            <main>
                <section className="px-6 py-20 sm:py-24">
                    <div className="mx-auto max-w-3xl text-center">
                        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-500 dark:bg-green-950/50 dark:text-green-400">
                            <GraduationCap size={28} strokeWidth={1.7} />
                        </div>

                        <p className="text-xs font-semibold uppercase tracking-widest text-green-500 dark:text-green-400">
                            About Takda
                        </p>

                        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                            Built to make student life easier.
                        </h1>

                        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400 sm:text-base">
                            Takda is a simple task management app that helps
                            students organize schoolwork, track deadlines, and
                            manage everyday tasks.
                        </p>
                    </div>
                </section>

                <section className="border-y border-slate-200 bg-white px-6 py-14 dark:border-slate-700 dark:bg-slate-900">
                    <div className="mx-auto max-w-5xl">
                        <div className="mb-8 text-center">
                            <p className="text-xs font-semibold uppercase tracking-widest text-green-500 dark:text-green-400">
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
                                text="Keep schoolwork and responsibilities in one place."
                            />

                            <InfoCard
                                icon={CheckCircle2}
                                title="Plan"
                                text="Keep deadlines visible and know what needs attention."
                            />

                            <InfoCard
                                icon={Users}
                                title="Stay on track"
                                text="Manage your workload and build better study habits."
                            />
                        </div>
                    </div>
                </section>

                <section className="px-6 py-16">
                    <div className="mx-auto max-w-3xl">
                        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:px-12">
                            <Users
                                size={28}
                                strokeWidth={1.7}
                                className="mx-auto text-green-500 dark:text-green-400"
                            />

                            <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-green-500 dark:text-green-400">
                                Meet the team
                            </p>

                            <h2 className="mt-2 text-3xl font-bold tracking-tight">
                                Built by students, for students.
                            </h2>

                            <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-slate-500 dark:text-slate-400">
                                Takda was created as a CMSC 128 project to make
                                everyday schoolwork easier to manage.
                            </p>

                            <div className="mt-7 grid gap-3 sm:grid-cols-2">
                                <TeamCard name="Ma. Christie Jude Tarre" />
                                <TeamCard name="Gabrielle Sumergido" />
                            </div>

                            <p className="mt-7 text-xs text-slate-400 dark:text-slate-500">
                                CMSC 128 · Software Engineering
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t border-slate-200 bg-white px-6 py-6 dark:border-slate-700 dark:bg-slate-900">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 sm:flex-row">
                    <div className="flex items-center gap-2">
                        <GraduationCap
                            size={17}
                            className="text-green-500 dark:text-green-400"
                        />
                        <span className="text-sm font-semibold">Takda</span>
                    </div>

                    <p className="text-xs text-slate-400 dark:text-slate-500">
                        Simple task management for students.
                    </p>
                </div>
            </footer>
        </div>
    );
}

function InfoCard({ icon: Icon, title, text }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-[#f8fbf9] p-6 text-center transition hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-green-500 shadow-sm dark:bg-slate-900 dark:text-green-400">
                <Icon size={21} strokeWidth={1.8} />
            </div>

            <h3 className="mt-5 font-semibold text-slate-700 dark:text-slate-200">
                {title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {text}
            </p>
        </div>
    );
}

function TeamCard({ name }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-[#f8fbf9] px-5 py-4 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {name}
        </div>
    );
}

export default About;