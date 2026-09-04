import { Bell, UserCircle } from "lucide-react";
import SearchBar from "./SearchBar";

function Header() {
    return (
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
            <h1 className="text-xl font-bold text-slate-800">
                StudyBoard
            </h1>

            <div className="flex items-center gap-5">
                <SearchBar />

                <button
                    type="button"
                    aria-label="Notifications"
                    className="text-slate-500 hover:text-green-600"
                >
                    <Bell size={18} />
                </button>

                <button
                    type="button"
                    aria-label="Profile"
                    className="text-slate-500 hover:text-green-600"
                >
                    <UserCircle size={30} />
                </button>
            </div>
        </header>
    );
}

export default Header;