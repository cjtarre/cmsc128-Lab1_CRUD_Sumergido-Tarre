import { CheckCircle2, GraduationCap, ListTodo, Users } from "lucide-react";
import PublicNavbar from "../shared/components/navigation/PublicNavbar";

function About() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-[#f3f9f5] text-slate-800 dark:bg-slate-950 dark:text-slate-100">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-32 top-20 h-[30rem] w-[30rem] rounded-full bg-emerald-200/35 blur-[110px] dark:bg-emerald-500/[0.07]" />
                <div className="absolute right-[-10rem] top-[28rem] h-[32rem] w-[32rem] rounded-full bg-green-200/30 blur-[120px] dark:bg-green-600/[0.06]" />
                <div className="absolute bottom-0 left-[30%] h-[24rem] w-[32rem] rounded-full bg-lime-100/35 blur-[110px] dark:bg-green-500/[0.04]" />
            </div>

            <div className="relative z-20">
                <PublicNavbar />
            </div>

            <main className="relative z-10">
                <section className="px-6 py-20 sm:py-24">
                    <div className="mx-auto max-w-3xl text-center">
                        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/80 bg-white/65 text-green-500 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05] dark:text-green-400">
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

                <section className="border-y border-white/60 bg-white/40 px-6 py-14 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.025]">
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
                        <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/75 px-6 py-10 text-center shadow-[0_15px_45px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75 dark:shadow-black/20 sm:px-12">
                            <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-emerald-200/25 blur-3xl dark:bg-emerald-500/[0.06]" />
                            <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-green-200/20 blur-3xl dark:bg-green-600/[0.05]" />

                            <div className="relative">
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
                                    Takda was created as a CMSC 128 project to
                                    make everyday schoolwork easier to manage.
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
                    </div>
                </section>
            </main>

            <footer className="relative z-10 border-t border-white/60 bg-white/45 px-6 py-6 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/50">
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
        <div className="rounded-2xl border border-white/70 bg-white/70 p-6 text-center shadow-[0_8px_25px_rgba(15,23,42,0.04)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(15,23,42,0.07)] dark:border-white/10 dark:bg-slate-900/65 dark:shadow-black/15">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-white/80 bg-green-50 text-green-500 shadow-sm dark:border-white/10 dark:bg-green-950/50 dark:text-green-400">
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
        <div className="rounded-2xl border border-white/80 bg-white/65 px-5 py-4 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200">
            {name}
        </div>
    );
}

export default About;