import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

import LandingPage from "../pages/LandingPage";
import Dashboard from "../features/tasks/pages/Dashboard";
import Calendar from "../features/calendar/pages/Calendar";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";
import Notifications from "../pages/Notifications";
import NotFound from "../pages/NotFound";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />

            <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route
                    path="/notifications"
                    element={<Notifications />}
                />
            </Route>

            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default AppRoutes;