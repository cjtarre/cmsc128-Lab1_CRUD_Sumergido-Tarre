import { Moon, Sun } from "lucide-react";
import { useTheme } from "../shared/context/ThemeContext";

function Settings() {
    const { theme, setTheme } = useTheme();

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

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:rounded-2xl">
                <div className="border-b border-slate-100 px-4 py-4 dark:border-slate-700 sm:px-5">
                    <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Appearance
                    </h2>
                </div>

                <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-500 dark:bg-green-950 dark:text-green-400">
                            {theme === "dark" ? (
                                <Moon size={17} />
                            ) : (
                                <Sun size={17} />
                            )}
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
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                    >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                    </select>
                </div>
            </section>
        </div>
    );
}

export default Settings;