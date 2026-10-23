import { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { useLocation, useOutlet } from "react-router-dom";
import TaskCompanion from "../features/companion/TaskCompanion";
import { useAuth } from "../features/auth/hooks/useAuth";
import Header from "../shared/components/header/Header";
import MobileNavbar from "../shared/components/navigation/MobileNavBar";
import Navbar from "../shared/components/navigation/NavBar";
import PageTransition from "../shared/components/effects/PageTransition";

const getCompanionEnabledKey = (userId) => `takda-companion-enabled:${userId}`;

function MainLayout() {
    const { user } = useAuth();
    const location = useLocation();
    const outlet = useOutlet();

    const [companionEnabled, setCompanionEnabled] = useState(
        () => localStorage.getItem(getCompanionEnabledKey(user.id)) !== "false"
    );

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCompanionEnabled(
            localStorage.getItem(getCompanionEnabledKey(user.id)) !== "false"
        );

        const handleCompanionSettingChange = (event) => {
            if (String(event.detail.userId) === String(user.id)) {
                setCompanionEnabled(event.detail.enabled);
            }
        };

        window.addEventListener(
            "takda-companion-setting-change",
            handleCompanionSettingChange
        );

        return () =>
            window.removeEventListener(
                "takda-companion-setting-change",
                handleCompanionSettingChange
            );
    }, [user.id]);

    return (
        <div className="app-shell relative flex h-dvh flex-col overflow-hidden bg-[#f3f9f5] dark:bg-slate-950">

            <div className="relative z-30">
                <Header />
            </div>

            <div className="relative z-10 flex min-h-0 flex-1">
                <div id="desktop-navbar" className="hidden xl:block">
                    <Navbar />
                </div>

                <main className="min-w-0 flex-1 overflow-y-auto p-5 lg:p-6">
                    <AnimatePresence mode="wait" initial={false}>
                        <PageTransition key={location.pathname}>
                            {outlet}
                        </PageTransition>
                    </AnimatePresence>
                </main>
            </div>

            <div id="mobile-navbar" className="relative z-30 xl:hidden">
                <MobileNavbar />
            </div>

            {companionEnabled && <TaskCompanion userId={user.id} />}
        </div>
    );
}

export default MainLayout;