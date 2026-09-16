import { Link } from "react-router-dom";
import PublicNavbar from "../shared/components/navigation/PublicNavBar";

function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-[#f5faf7] text-slate-700">
            <PublicNavbar />

            <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
                <div className="mb-10">
                    <p className="mb-2 text-sm font-semibold text-green-600">
                        StudyBoard
                    </p>

                    <h1 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
                        Privacy Policy
                    </h1>

                    <p className="mt-3 text-sm text-slate-500">
                        Last updated: September 2026
                    </p>
                </div>

                <div className="space-y-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/30 sm:p-10">
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-slate-800">
                            1. Information we collect
                        </h2>
                        <p className="leading-7 text-slate-600">
                            StudyBoard collects information that you provide when
                            creating and using your account. This may include your
                            email address, username, display name, and information
                            you choose to store in the application, such as tasks.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-slate-800">
                            2. How we use your information
                        </h2>
                        <p className="leading-7 text-slate-600">
                            Your information is used to provide StudyBoard's
                            features, including account authentication, profile
                            management, and task management. Information associated
                            with your account is used to provide you with your own
                            application data.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-slate-800">
                            3. Passwords and security
                        </h2>
                        <p className="leading-7 text-slate-600">
                            StudyBoard is designed so that passwords are not stored
                            as plain text. Authentication information is handled
                            through the application's authentication system, with
                            appropriate measures intended to protect account
                            information.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-slate-800">
                            4. Sharing of information
                        </h2>
                        <p className="leading-7 text-slate-600">
                            StudyBoard does not sell your personal information.
                            Account and application data is intended to be used for
                            providing the StudyBoard service and is not intentionally
                            made available to other users except where required by
                            an application's feature.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-slate-800">
                            5. Data retention
                        </h2>
                        <p className="leading-7 text-slate-600">
                            Account and application data may remain stored while
                            your account is active. The exact retention and deletion
                            process depends on the application's implemented
                            database and account-management features.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-slate-800">
                            6. Your information
                        </h2>
                        <p className="leading-7 text-slate-600">
                            StudyBoard aims to provide users with access to and
                            control over information associated with their account.
                            Available profile, account, and data-management options
                            depend on the features implemented in the application.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-slate-800">
                            7. Changes to this policy
                        </h2>
                        <p className="leading-7 text-slate-600">
                            This Privacy Policy may be updated as StudyBoard's
                            features, data handling practices, or security
                            mechanisms change. Updates will be reflected on this
                            page.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-slate-800">
                            8. Contact
                        </h2>
                        <p className="leading-7 text-slate-600">
                            For questions about this Privacy Policy or StudyBoard's
                            handling of information, please contact the StudyBoard
                            project team.
                        </p>
                    </section>
                </div>

                <div className="mt-8 text-center">
                    <Link
                        to="/"
                        className="text-sm font-medium text-green-600 hover:text-green-700"
                    >
                        Back to StudyBoard
                    </Link>
                </div>
            </main>
        </div>
    );
}

export default PrivacyPolicy;
