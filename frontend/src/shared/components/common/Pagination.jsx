import { ChevronLeft, ChevronRight } from "lucide-react";

function Pagination({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) {
    if (totalPages <= 1) return null;

    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex items-center justify-between gap-3 border-t border-slate-100/80 bg-white/45 px-4 py-3 dark:border-white/[0.07] dark:bg-white/[0.02]">
            <p className="min-w-0 truncate text-xs text-slate-400 dark:text-slate-500">
                <span className="sm:hidden">{start}–{end} of {totalItems}</span>
                <span className="hidden sm:inline">Showing {start}–{end} of {totalItems} tasks</span>
            </p>

            <div className="flex shrink-0 items-center gap-1">
                <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-green-50 hover:text-green-600 disabled:cursor-not-allowed disabled:opacity-30 dark:text-slate-400 dark:hover:bg-green-500/10 dark:hover:text-green-400"
                    aria-label="Previous page"
                >
                    <ChevronLeft size={15} />
                </button>

                <span className="px-2 text-xs font-medium text-slate-500 dark:text-slate-400 sm:hidden">
                    {currentPage} / {totalPages}
                </span>

                <div className="hidden items-center gap-1 sm:flex">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            type="button"
                            onClick={() => onPageChange(page)}
                            aria-label={`Go to page ${page}`}
                            aria-current={currentPage === page ? "page" : undefined}
                            className={`h-8 w-8 rounded-lg text-xs font-medium transition ${
                                currentPage === page
                                    ? "bg-green-500 text-white shadow-sm"
                                    : "text-slate-500 hover:bg-green-50 hover:text-green-600 dark:text-slate-400 dark:hover:bg-green-500/10 dark:hover:text-green-400"
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-green-50 hover:text-green-600 disabled:cursor-not-allowed disabled:opacity-30 dark:text-slate-400 dark:hover:bg-green-500/10 dark:hover:text-green-400"
                    aria-label="Next page"
                >
                    <ChevronRight size={15} />
                </button>
            </div>
        </div>
    );
}

export default Pagination;