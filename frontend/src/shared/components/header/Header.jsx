import { Link } from "react-router-dom";
import ProfileMenu from "./ProfileMenu";

function Header() {
    return (
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
            <Link
                to="/dashboard"
                className="text-xl font-bold text-slate-800"
            >
                StudyBoard
            </Link>

            <div className="flex items-center gap-5">
                <ProfileMenu />
            </div>
        </header>
    );
}

export default Header;