import { Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";

function ProtectedRoute({ children }) {
    const { isAuthenticated, authLoading } = useAuth();

    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-green-500" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;