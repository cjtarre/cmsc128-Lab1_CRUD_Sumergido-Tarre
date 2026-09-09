import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import ProfileMenu from "./ProfileMenu";

function Header() {
    const user = {
        name: "Student",
    };

    return (
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
            <Link
                to="/dashboard"
                className="flex items-center gap-2 text-xl font-bold text-slate-800"
            >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-500">
                    <GraduationCap size={18} strokeWidth={1.8} />
                </span>
                StudyBoard
            </Link>

            <div className="flex items-center gap-4">
                <p className="text-sm font-medium text-slate-600">
                    Welcome, {user.name}!
                </p>

                <ProfileMenu />
            </div>
        </header>
    );
}

export default Header;