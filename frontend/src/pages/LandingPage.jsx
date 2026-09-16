import { ArrowRight, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import HoverText from "../shared/components/effects/HoverText";

function LandingPage() {
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
                        <Link to="/about" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-green-50 hover:text-green-600">
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
                <section className="relative overflow-hidden px-6 py-28 sm:py-36">
                    <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-green-100/60 blur-3xl" />

                    <div className="relative mx-auto max-w-4xl text-center">
                        <div className="mx-auto mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-500">
                            <GraduationCap size={50} strokeWidth={1.7} />
                        </div>

                        <div className="text-5xl font-black tracking-tight sm:text-6xl">
                            <HoverText text="Stay organized." />
                            <HoverText text="Stay on track." className="text-green-500" />
                        </div>

                        <p className="mx-auto mt-8 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
                            Keep your schoolwork, deadlines, and everyday tasks organized in one simple place.
                        </p>

                        <Link
                            to="/signup"
                            className="group mt-8 inline-flex items-center gap-2 rounded-lg bg-green-500 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-green-600"
                        >
                            Get Started
                            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="border-t border-slate-200 bg-white px-6 py-7">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
                    <div className="flex items-center gap-2">
                        <GraduationCap size={17} className="text-green-500" />
                        <span className="text-sm font-semibold">StudyBoard</span>
                    </div>

                    <p className="text-xs text-slate-400">
                        CMSC 128 · Software Engineering
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;