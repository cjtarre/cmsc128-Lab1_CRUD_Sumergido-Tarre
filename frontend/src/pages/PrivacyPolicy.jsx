import { Link } from "react-router-dom";
import PublicNavbar from "../shared/components/navigation/PublicNavBar";

function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-[#f5faf7] text-slate-700 dark:bg-slate-950 dark:text-slate-300">
            <PublicNavbar />

            <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
                <div className="mb-10 text-center sm:text-left">
                    <p className="mb-2 text-sm font-semibold text-green-600 dark:text-green-400">
                        Takda
                    </p>

                    <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white sm:text-4xl">
                        Privacy Policy
                    </h1>

                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-500">
                        Last updated: September 2026
                    </p>

                    <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                        This policy explains how Takda collects, uses, stores,
                        and protects information when you use the application.
                    </p>
                </div>

                <div className="space-y-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/30 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20 sm:p-10">
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
                        className="text-sm font-medium text-green-600 transition hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                    >
                        Back to Takda
                    </Link>
                </div>
            </main>
        </div>
    );
}

export default PrivacyPolicy;