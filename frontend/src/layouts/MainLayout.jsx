import { Outlet } from "react-router-dom";
import Header from "../shared/components/header/Header";
import Navbar from "../shared/components/navigation/Navbar";
import MobileNavbar from "../shared/components/navigation/MobileNavBar";

function MainLayout() {
    return (
        <div className="flex min-h-dvh flex-col bg-[#f5faf7] dark:bg-slate-950">
            <Header />

            <div className="flex flex-1">
                <div className="hidden xl:block">
                    <Navbar />
                </div>

                <main className="min-w-0 flex-1 p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>

            <MobileNavbar />
        </div>
    );
}

export default MainLayout;