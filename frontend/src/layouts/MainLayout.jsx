import { Outlet } from "react-router-dom";
import Header from "../shared/components/header/Header";
import Navbar from "../shared/components/navigation/NavBar";
import MobileNavbar from "../shared/components/navigation/MobileNavBar";
import TaskCompanion from "../features/companion/TaskCompanion";

function MainLayout() {
    return (
        <div className="relative flex h-dvh flex-col overflow-hidden bg-[#f3f9f5] dark:bg-slate-950">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-32 top-12 h-[32rem] w-[32rem] rounded-full bg-emerald-200/45 blur-[110px] dark:bg-emerald-500/10" />
                <div className="absolute left-[32%] top-[-12rem] h-[30rem] w-[38rem] rounded-full bg-green-100/55 blur-[120px] dark:bg-green-500/[0.06]" />
                <div className="absolute right-[-8rem] top-[12%] h-[38rem] w-[32rem] rounded-full bg-emerald-200/40 blur-[120px] dark:bg-emerald-600/[0.08]" />
                <div className="absolute bottom-[-16rem] left-[18%] h-[34rem] w-[42rem] rounded-full bg-green-200/35 blur-[130px] dark:bg-green-700/[0.07]" />
                <div className="absolute bottom-[-10rem] right-[-4rem] h-[28rem] w-[28rem] rounded-full bg-lime-100/45 blur-[100px] dark:bg-emerald-500/[0.05]" />
            </div>

            <div className="relative z-30">
                <Header />
            </div>

            <div className="relative z-10 flex min-h-0 flex-1">
                <div className="hidden xl:block">
                    <Navbar />
                </div>

                <main className="min-w-0 flex-1 overflow-y-auto p-5 lg:p-6">
                    <Outlet />
                </main>
            </div>

            <div className="relative z-30">
                <MobileNavbar />
            </div>

            <TaskCompanion />
        </div>
    );
}

export default MainLayout;