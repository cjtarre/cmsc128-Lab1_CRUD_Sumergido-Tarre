import { ChevronLeft, ChevronRight } from "lucide-react";

function Pagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
}) {
    if (totalPages <= 1) return null;

    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="mt-4 flex items-center justify-between gap-3">
            <p className="min-w-0 truncate text-xs text-slate-400 dark:text-slate-500">
                <span className="sm:hidden">
                    {start}–{end} of {totalItems}
                </span>
                <span className="hidden sm:inline">
                    Showing {start}–{end} of {totalItems} tasks
                </span>
            </p>

            <div className="flex shrink-0 items-center gap-1">
                <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800"
                    aria-label="Previous page"
                >
                    <ChevronLeft size={16} />
                </button>

                <span className="px-2 text-xs font-medium text-slate-500 dark:text-slate-400 sm:hidden">
                    {currentPage} / {totalPages}
                </span>

                <div className="hidden items-center gap-1 sm:flex">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                            <button
                                key={page}
                                type="button"
                                onClick={() => onPageChange(page)}
                                className={`h-8 w-8 rounded-lg text-xs font-medium transition ${
                                    currentPage === page
                                        ? "bg-green-500 text-white"
                                        : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                }`}
                            >
                                {page}
                            </button>
                        )
                    )}
                </div>

                <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800"
                    aria-label="Next page"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}

export default Pagination;