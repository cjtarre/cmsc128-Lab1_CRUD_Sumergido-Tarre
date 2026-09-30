import { createContext, useEffect, useState } from "react";
import { authService } from "../services/authService";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const restoreSession = async () => {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) { setAuthLoading(false); return; }

            try {
                const { user } = await authService.getCurrentUser();
                setUser(user);
            } catch {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                setUser(null);
            } finally {
                setAuthLoading(false);
            }
        };

        restoreSession();
    }, []);

    const login = async (identifier, password) => {
        const data = await authService.login(identifier, password);
        localStorage.setItem("accessToken", data.session.access_token);
        localStorage.setItem("refreshToken", data.session.refresh_token);
        setUser(data.user);
        return data;
    };
    
    const signup = async (email, password, username, displayName) =>
        authService.signup(email, password, username, displayName);
    
    const updateProfile = async (profile) => {
        const data = await authService.updateProfile(profile);
        setUser(data.user);
        return data;
    };

    const updateEmail = async (email) => {
        const data = await authService.updateEmail(email);
        if (data.user) setUser(data.user);
        return data;
    };

    const updatePassword = async (password) => authService.updatePassword(password);

    const logout = async () => {
        const refreshToken = localStorage.getItem("refreshToken");

        try {
            await authService.logout(refreshToken);
        } finally {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, authLoading, isAuthenticated: !!user, login, signup, logout, updateProfile, updateEmail, updatePassword }}>
            {children}
        </AuthContext.Provider>
    );
}