import { Outlet } from "react-router-dom";
import Header from "../components/header/Header";
import Navbar from "../components/navigation/Navbar";

function MainLayout() {
    return (
        <div className="min-h-screen bg-[#f5faf7]">
            <Header />

            <div className="flex">
                <Navbar />

                <main className="min-w-0 flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default MainLayout;