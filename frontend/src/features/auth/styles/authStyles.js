export const getAuthFormStyles = (embedded) => ({
    inputClass: embedded
        ? "w-full rounded-lg border border-white/15 bg-white/10 py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-white/45 outline-none focus:border-white/40 focus:ring-2 focus:ring-white/10 dark:border-slate-300 dark:bg-white/60 dark:text-slate-800 dark:placeholder:text-slate-400 dark:focus:border-green-500 dark:focus:ring-green-200"
        : "w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-green-400 dark:focus:ring-green-900/50",

    labelClass: embedded
        ? "text-white/80 dark:text-slate-700"
        : "text-slate-700 dark:text-slate-200",

    iconClass: embedded
        ? "text-white/45 dark:text-slate-500"
        : "text-slate-400 dark:text-slate-500",

    eyeClass: embedded
        ? "text-white/45 hover:text-white dark:text-slate-500 dark:hover:text-slate-700"
        : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300",

    fieldErrorClass: embedded
        ? "mt-1 text-xs text-red-200 dark:text-red-600"
        : "mt-1 text-xs text-red-500 dark:text-red-400",
});