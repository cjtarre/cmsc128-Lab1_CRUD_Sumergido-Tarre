import { Search } from "lucide-react";

function SearchBar() {
    return (
        <div className="relative">
            <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
                type="search"
                placeholder="Search tasks..."
                aria-label="Search tasks"
                className="w-44 rounded-full border border-slate-200 py-2 pl-9 pr-4 text-xs outline-none focus:border-green-400"
            />
        </div>
    );
}

export default SearchBar;