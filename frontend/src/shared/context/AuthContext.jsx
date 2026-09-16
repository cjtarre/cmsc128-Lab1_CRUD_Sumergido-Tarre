import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const restoreSession = async () => {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                setAuthLoading(false);
                return;
            }

            try {
                const { user } = await authService.getCurrentUser();
                setUser(user);
                setIsAuthenticated(true);
            } catch {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
            } finally {
                setAuthLoading(false);
            }
        };

        restoreSession();
    }, []);

    return (
        <AuthContext.Provider
            value={{ user, setUser, isAuthenticated, setIsAuthenticated, authLoading }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return context;
}