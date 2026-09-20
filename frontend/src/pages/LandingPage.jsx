import { useState } from "react";
import { ArrowRight, GraduationCap } from "lucide-react";
import HoverText from "../shared/components/effects/HoverText";
import PublicNavbar from "../shared/components/navigation/PublicNavBar";
import AuthPanel from "../features/auth/components/AuthPanel";

function LandingPage() {
    const [showAuth, setShowAuth] = useState(false);

    const handleGetStarted = () => {
        setShowAuth(true);
    };

    const handleCloseAuth = () => {
        setShowAuth(false);
    };

    return (
        <div className="flex min-h-screen overflow-hidden bg-[#f5faf7] text-slate-800 dark:bg-slate-950 dark:text-slate-100">
            {/* Landing page */}
            <div
                className={`min-w-0 transition-[width,opacity] duration-700
                    ease-[cubic-bezier(0.22,1,0.36,1)]
                    ${showAuth ? "hidden sm:block sm:w-[48%]" : "w-full"}`}
            >
                <div className="flex min-h-screen flex-col">
                    <PublicNavbar showAuth={showAuth} />

                    <main className="flex-1">
                        <section className="relative overflow-hidden px-6 py-24 sm:py-32 lg:py-36">
                            <div
                                className="pointer-events-none absolute left-1/2 top-0 h-72 w-72
                                    -translate-x-1/2 rounded-full bg-green-100/60 blur-3xl
                                    dark:bg-green-950/30"
                            />

                            <div className="relative mx-auto max-w-4xl text-center">
                                <div
                                    className="mx-auto mb-7 flex h-14 w-14 items-center
                                        justify-center rounded-2xl bg-green-50 text-green-500
                                        dark:bg-green-950/50 dark:text-green-400"
                                >
                                    <GraduationCap
                                        size={50}
                                        strokeWidth={1.7}
                                    />
                                </div>

                                <div className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                                    <HoverText text="Stay organized." />

                                    <HoverText
                                        text="Stay on track."
                                        className="text-green-500 dark:text-green-400"
                                    />
                                </div>

                                <p
                                    className="mx-auto mt-6 max-w-xl text-sm leading-7
                                        text-slate-500 sm:mt-8 sm:text-base
                                        dark:text-slate-400"
                                >
                                    Keep your schoolwork, deadlines, and
                                    everyday tasks organized in one simple
                                    place.
                                </p>

                                <button
                                    type="button"
                                    onClick={handleGetStarted}
                                    className="group mt-7 inline-flex items-center gap-2
                                        rounded-lg bg-green-500 px-6 py-3 text-sm
                                        font-medium text-white shadow-sm transition
                                        hover:bg-green-600 sm:mt-8"
                                >
                                    Get Started

                                    <ArrowRight
                                        size={16}
                                        className="transition-transform group-hover:translate-x-0.5"
                                    />
                                </button>
                            </div>
                        </section>
                    </main>

                    <footer className="border-t border-slate-200 bg-white px-6 py-7 dark:border-slate-700 dark:bg-slate-900">
                        <div
                            className="mx-auto flex max-w-6xl flex-col items-center
                                justify-between gap-3 sm:flex-row"
                        >
                            <div className="flex items-center gap-2">
                                <GraduationCap
                                    size={17}
                                    className="text-green-500 dark:text-green-400"
                                />

                                <span className="text-sm font-semibold">
                                    Takda
                                </span>
                            </div>

                            <p className="text-xs text-slate-400 dark:text-slate-500">
                                CMSC 128 · Software Engineering
                            </p>
                        </div>
                    </footer>
                </div>
            </div>

            {/* Auth page */}
            <AuthPanel
                isOpen={showAuth}
                onClose={handleCloseAuth}
            />
        </div>
    );
}

export default LandingPage;