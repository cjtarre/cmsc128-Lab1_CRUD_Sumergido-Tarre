import { Navigate, Routes, Route, useLocation } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import { TaskProvider } from "../features/tasks/context/TaskContext";
import { useAuth } from "../features/auth/hooks/useAuth";

import LandingPage from "../pages/LandingPage";
import Profile from "../features/profile/pages/Profile";
import Settings from "../pages/Settings";
import Notifications from "../features/notifications/pages/Notifications";
import NotFound from "../pages/NotFound";
import About from "../pages/About";
import PrivacyPolicy from "../pages/PrivacyPolicy";

import Dashboard from "../features/tasks/pages/Dashboard";
import Calendar from "../features/calendar/pages/Calendar";
import Login from "../features/auth/pages/Login";
import Signup from "../features/auth/pages/Signup";

import { AnimatePresence } from "motion/react";
import PageTransition from "../shared/components/effects/PageTransition";

function AppRoutes() {
    const location = useLocation();
    const { user, isAuthenticated, authLoading } = useAuth();
    
    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-green-500" />
            </div>
        );
    }

    return (
        <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
                <Routes location={location} >
                    <Route element={
                        user && isAuthenticated 
                        ? <Navigate to="/dashboard" replace /> 
                        : null}>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/privacy" element={<PrivacyPolicy />} />
                    </Route>

                    <Route element={
                        <ProtectedRoute>
                            <TaskProvider>
                                <MainLayout />
                            </TaskProvider>
                        </ProtectedRoute>
                    }> 
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/calendar" element={<Calendar />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/notifications" element={<Notifications />}/>
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </PageTransition>
        </AnimatePresence>
    );
}

export default AppRoutes;