import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import PublicNavbar from "../shared/components/navigation/PublicNavbar";

function PrivacyPolicy() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-[#f3f9f5] text-slate-700 dark:bg-slate-950 dark:text-slate-300">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-32 top-20 h-[30rem] w-[30rem] rounded-full bg-emerald-200/30 blur-[110px] dark:bg-emerald-500/[0.06]" />
                <div className="absolute right-[-10rem] top-[30rem] h-[32rem] w-[32rem] rounded-full bg-green-200/25 blur-[120px] dark:bg-green-600/[0.05]" />
            </div>

            <div className="relative z-20">
                <PublicNavbar />
            </div>

            <main className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
                <div className="mb-10 text-center sm:text-left">
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/80 bg-white/65 text-green-500 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05] dark:text-green-400">
                        <ShieldCheck size={21} strokeWidth={1.8} />
                    </div>

                    <p className="mb-2 text-sm font-semibold text-green-600 dark:text-green-400">
                        Takda
                    </p>

                    <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white sm:text-4xl">
                        Privacy Policy
                    </h1>

                    <p className="mt-3 text-sm text-slate-500">
                        Last updated: September 2026
                    </p>

                    <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                        This policy explains how Takda collects, uses, stores,
                        and protects information when you use the application.
                    </p>
                </div>

                <div className="space-y-8 rounded-2xl border border-white/70 bg-white/90 p-6 shadow-[0_15px_45px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90 dark:shadow-black/20 sm:p-10">
                    <section>
                        <h2 className="mb-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
                            1. Information we collect
                        </h2>
                        <p className="leading-7 text-slate-600 dark:text-slate-300">
                            Takda collects information provided when creating
                            and using an account, such as your email address,
                            display name, and password. It may also store data
                            you add to the application, such as tasks.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
                            2. How we use your information
                        </h2>
                        <p className="leading-7 text-slate-600 dark:text-slate-300">
                            Your information is used to provide account
                            authentication, profile management, task
                            management, and other Takda features. Your data is
                            associated with your account to provide your
                            personalized application experience.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
                            3. Security
                        </h2>
                        <p className="leading-7 text-slate-600 dark:text-slate-300">
                            Passwords are not stored in plain text. Takda uses
                            password hashing and authentication controls to
                            help protect account information and restrict
                            unauthorized access.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
                            4. Sharing and storage
                        </h2>
                        <p className="leading-7 text-slate-600 dark:text-slate-300">
                            Takda does not sell your personal information. Your
                            account and application data is stored in the
                            application's database and is intended to be
                            accessible only through authorized access.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
                            5. Your rights
                        </h2>
                        <p className="leading-7 text-slate-600 dark:text-slate-300">
                            You may review and manage information associated
                            with your account through the features available in
                            Takda. Available options may include updating
                            account information and managing stored data.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
                            6. Changes and contact
                        </h2>
                        <p className="leading-7 text-slate-600 dark:text-slate-300">
                            This policy may be updated as Takda's features or
                            data practices change. For questions or concerns
                            about this policy, please contact the Takda project
                            team.
                        </p>
                    </section>
                </div>

                <div className="mt-8 text-center">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-green-600 transition hover:bg-white/60 hover:text-green-700 dark:text-green-400 dark:hover:bg-white/[0.05] dark:hover:text-green-300"
                    >
                        <ArrowLeft size={15} />
                        Back to Takda
                    </Link>
                </div>
            </main>
        </div>
    );
}

export default PrivacyPolicy;