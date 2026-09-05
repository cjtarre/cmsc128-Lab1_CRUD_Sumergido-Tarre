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
                className="w-44 rounded-full border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs text-slate-700 outline-none transition focus:border-green-300 focus:ring-2 focus:ring-green-50"
            />
        </div>
    );
}

export default SearchBar;