import { Moon, PawPrint, Sun } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../features/auth/hooks/useAuth";
import { useTheme } from "../shared/context/ThemeContext";

const getCompanionEnabledKey = (userId) => `takda-companion-enabled:${userId}`;

function Settings() {
    const { theme, setTheme } = useTheme();
    const { user } = useAuth();

    const [companionEnabled, setCompanionEnabled] = useState(
        () => localStorage.getItem(getCompanionEnabledKey(user.id)) !== "false"
    );

    const handleCompanionToggle = () => {
        const nextValue = !companionEnabled;

        setCompanionEnabled(nextValue);
        localStorage.setItem(getCompanionEnabledKey(user.id), String(nextValue));

        window.dispatchEvent(
            new CustomEvent("takda-companion-setting-change", {
                detail: {
                    userId: user.id,
                    enabled: nextValue,
                },
            })
        );
    };

    return (
        <div className="mx-auto w-full max-w-3xl space-y-6">
            <div>
                <h1 className="text-xl font-semibold text-slate-800 dark:text-white sm:text-2xl">
                    Settings
                </h1>

                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 sm:text-sm">
                    Manage your application preferences.
                </p>
            </div>

            <section className="overflow-hidden rounded-xl border border-white/70 bg-white/75 shadow-[0_10px_35px_rgba(15,23,42,0.055)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75 dark:shadow-black/20 sm:rounded-2xl">
                <div className="border-b border-slate-100/70 bg-white/25 px-4 py-4 dark:border-white/[0.07] dark:bg-white/[0.02] sm:px-5">
                    <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Appearance
                    </h2>
                </div>

                <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/80 bg-green-50/70 text-green-500 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-green-950/30 dark:text-green-400">
                            {theme === "dark" ? <Moon size={17} /> : <Sun size={17} />}
                        </div>

                        <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                Theme
                            </p>

                            <p className="text-xs text-slate-400 dark:text-slate-500">
                                Choose how Takda looks.
                            </p>
                        </div>
                    </div>

                    <select
                        value={theme}
                        onChange={(event) => setTheme(event.target.value)}
                        className="shrink-0 rounded-lg border border-white/80 bg-white/60 px-2.5 py-2 text-xs text-slate-600 shadow-sm backdrop-blur-md outline-none transition hover:border-green-200 focus:border-green-400 focus:ring-2 focus:ring-green-100/60 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200 dark:hover:border-green-900/60 dark:focus:border-green-600 dark:focus:ring-green-950/50 sm:px-3 sm:text-sm"
                    >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                    </select>
                </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-white/70 bg-white/75 shadow-[0_10px_35px_rgba(15,23,42,0.055)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75 dark:shadow-black/20 sm:rounded-2xl">
                <div className="border-b border-slate-100/70 bg-white/25 px-4 py-4 dark:border-white/[0.07] dark:bg-white/[0.02] sm:px-5">
                    <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Task Companion
                    </h2>
                </div>

                <div className="flex items-center justify-between gap-3 px-4 py-4 sm:gap-4 sm:px-5">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/80 bg-green-50/70 text-green-500 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-green-950/30 dark:text-green-400">
                            <PawPrint size={17} />
                        </div>

                        <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                Show Task Companion
                            </p>

                            <p className="mt-0.5 text-xs leading-4 text-slate-400 dark:text-slate-500">
                                Show your companion while using Takda.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        role="switch"
                        aria-checked={companionEnabled}
                        aria-label="Show Task Companion"
                        onClick={handleCompanionToggle}
                        className="flex h-11 w-12 shrink-0 items-center justify-center rounded-xl outline-none transition focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 sm:w-14"
                    >
                        <span
                            className={`relative block h-6 w-11 rounded-full shadow-inner transition-colors duration-200 ${
                                companionEnabled
                                    ? "bg-green-500"
                                    : "bg-slate-300 dark:bg-slate-700"
                            }`}
                        >
                            <span
                                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                    companionEnabled
                                        ? "translate-x-5"
                                        : "translate-x-0"
                                }`}
                            />
                        </span>
                    </button>
                </div>
            </section>
        </div>
    );
}

export default Settings;