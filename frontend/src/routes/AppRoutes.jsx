import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "../features/auth/hooks/useAuth";
import ForgotPassword from "../features/auth/pages/ForgotPassword";
import Login from "../features/auth/pages/Login";
import ResetPassword from "../features/auth/pages/ResetPassword";
import Signup from "../features/auth/pages/Signup";
import Calendar from "../features/calendar/pages/Calendar";
import FocusMode from "../features/focus/pages/FocusMode";
import { NotificationProvider } from "../features/notifications/context/NotificationContext";
import Notifications from "../features/notifications/pages/Notifications";
import Profile from "../features/profile/pages/Profile";
import Projects from "../features/projects/pages/Projects";
import ProjectSettings from "../features/projects/pages/ProjectSettings";
import ProjectWorkspace from "../features/projects/pages/ProjectWorkspace";
import { TaskProvider } from "../features/tasks/context/TaskContext";
import MyTasks from "../features/tasks/pages/MyTasks";

import MainLayout from "../layouts/MainLayout";
import About from "../pages/About";
import LandingPage from "../pages/LandingPage";
import NotFound from "../pages/NotFound";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import Settings from "../pages/Settings";
import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
    const { isAuthenticated, authLoading } = useAuth();

    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-green-500" />
            </div>
        );
    }

    return (
        <Routes>
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
                                    <NotificationProvider>
                                        <MainLayout />
                                    </NotificationProvider>
                                </TaskProvider>
                            </ProtectedRoute>
                        }
                    >
                        <Route path="/my-tasks" element={<MyTasks />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/projects/:projectId" element={<ProjectWorkspace />} />
                        <Route path="/projects/:projectId/settings" element={<ProjectSettings />} />
                        <Route path="/calendar" element={<Calendar />} />
                        <Route path="/focus" element={<FocusMode />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/notifications" element={<Notifications />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default AppRoutes;