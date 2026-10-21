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
                    <nav
                        aria-label="Breadcrumb"
                        className="mb-5 flex items-center justify-center gap-2 text-sm sm:justify-start"
                    >
                        <Link
                            to="/"
                            className="font-medium text-green-600 transition hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                        >
                            Home
                        </Link>

                        <span className="text-slate-300 dark:text-slate-600">/</span>

                        <span
                            aria-current="page"
                            className="text-slate-500 dark:text-slate-400"
                        >
                            Privacy Policy
                        </span>
                    </nav>

                    <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white sm:text-4xl">
                        Privacy Policy
                    </h1>

                    <p className="mt-3 text-sm text-slate-500">
                        Last updated: October 2026
                    </p>

                    <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                        This policy explains how Takda collects, uses, stores,
                        shares, and protects information when you use the
                        application.
                    </p>
                </div>

                <div className="space-y-8 rounded-2xl border border-white/70 bg-white/90 p-6 shadow-[0_15px_45px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90 dark:shadow-black/20 sm:p-10">
                    <section>
                        <h2 className="mb-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
                            1. Information we collect
                        </h2>
                        <p className="leading-7 text-slate-600 dark:text-slate-300">
                            Takda collects information you provide when creating
                            and using an account, such as your email address,
                            username, and display name. The application also
                            stores information you create or provide while using
                            its features, including tasks, projects, tags,
                            project memberships, invitations, and related
                            activity.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
                            2. How we use your information
                        </h2>
                        <p className="leading-7 text-slate-600 dark:text-slate-300">
                            Your information is used to provide account
                            authentication, profile management, task and project
                            management, collaboration, notifications, calendar
                            features, and other Takda functionality. Account and
                            application data may also be used to determine which
                            projects, tasks, and actions you are authorized to
                            access.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
                            3. Project collaboration
                        </h2>
                        <p className="leading-7 text-slate-600 dark:text-slate-300">
                            When you participate in a collaborative project,
                            certain information may be visible to other
                            authorized members of that project. This may include
                            your display name, username, project role, assigned
                            tasks, and project-related activity. Access to
                            project information and actions is limited according
                            to the permissions associated with each member's
                            role.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
                            4. Security and authentication
                        </h2>
                        <p className="leading-7 text-slate-600 dark:text-slate-300">
                            Takda uses authentication and access controls to help
                            protect account and application information.
                            Passwords are handled through the application's
                            authentication service and are not stored in plain
                            text by Takda's application code. Role-based access
                            controls are also used to restrict project actions
                            and information to authorized users.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
                            5. Data storage and sharing
                        </h2>
                        <p className="leading-7 text-slate-600 dark:text-slate-300">
                            Takda does not sell your personal information.
                            Account and application data is stored using the
                            services that support Takda's authentication and
                            database functionality. Information is shared within
                            the application only when necessary to provide its
                            features, such as displaying information to
                            authorized members of a collaborative project.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
                            6. Your choices and rights
                        </h2>
                        <p className="leading-7 text-slate-600 dark:text-slate-300">
                            You may review and manage information associated
                            with your account through the features available in
                            Takda. Depending on the feature, this may include
                            updating profile information, managing tasks and
                            projects, responding to project invitations, leaving
                            collaborative projects, and deleting or restoring
                            supported application data.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
                            7. Changes and contact
                        </h2>
                        <p className="leading-7 text-slate-600 dark:text-slate-300">
                            This policy may be updated as Takda's features,
                            services, or data practices change. The latest
                            version will be reflected by the date shown above.
                            For questions or concerns regarding this policy or
                            the handling of information in Takda, please contact
                            the Takda project team.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}

export default PrivacyPolicy;