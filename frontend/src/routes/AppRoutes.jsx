import { AnimatePresence } from "motion/react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { useAuth } from "../features/auth/hooks/useAuth";
import ForgotPassword from "../features/auth/pages/ForgotPassword";
import Login from "../features/auth/pages/Login";
import ResetPassword from "../features/auth/pages/ResetPassword";
import Signup from "../features/auth/pages/Signup";
import Calendar from "../features/calendar/pages/Calendar";
import FocusMode from "../features/focus/pages/FocusMode";
import Notifications from "../features/notifications/pages/Notifications";
import Profile from "../features/profile/pages/Profile";
import Projects from "../features/projects/pages/Projects";
import { TaskProvider } from "../features/tasks/context/TaskContext";
import MyTasks from "../features/tasks/pages/MyTasks";
import ProjectWorkspace from "../features/projects/pages/ProjectWorkspace";

import MainLayout from "../layouts/MainLayout";
import About from "../pages/About";
import LandingPage from "../pages/LandingPage";
import NotFound from "../pages/NotFound";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import Settings from "../pages/Settings";
import PageTransition from "../shared/components/effects/PageTransition";
import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
    const location = useLocation();
    const { isAuthenticated, authLoading } = useAuth();

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
                <Routes location={location}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />

                    <Route path="/login" element={isAuthenticated ? <Navigate to="/my-tasks" replace /> : <Login />} />
                    <Route path="/signup" element={isAuthenticated ? <Navigate to="/my-tasks" replace /> : <Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    <Route
                        element={
                            <ProtectedRoute>
                                <TaskProvider>
                                    <MainLayout />
                                </TaskProvider>
                            </ProtectedRoute>
                        }
                    >
                        <Route path="/my-tasks" element={<MyTasks />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/projects/:projectId" element={<ProjectWorkspace />} />
                        <Route path="/calendar" element={<Calendar />} />
                        <Route path="/focus" element={<FocusMode />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/notifications" element={<Notifications />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </PageTransition>
        </AnimatePresence>
    );
}

export default AppRoutes;