import { Outlet } from "react-router-dom";
import Header from "../shared/components/header/Header";
import Navbar from "../shared/components/navigation/NavBar";
import MobileNavbar from "../shared/components/navigation/MobileNavBar";
import TaskCompanion from "../features/companion/TaskCompanion";

function MainLayout() {
    return (
        <div className="flex h-dvh flex-col overflow-hidden bg-[#f5faf7] dark:bg-slate-950">
            <Header />

            <div className="flex min-h-0 flex-1">
                <div id="desktop-navbar" className="hidden xl:block">
                    <Navbar />
                </div>

                <main className="min-w-0 flex-1 overflow-y-auto p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>

            <div id="mobile-navbar" className="xl:hidden">
                <MobileNavbar />
            </div>

            <TaskCompanion />
        </div>
    );
}

export default MainLayout;