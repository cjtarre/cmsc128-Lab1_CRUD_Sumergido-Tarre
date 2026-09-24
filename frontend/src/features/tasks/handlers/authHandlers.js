import { toast } from "sonner";
import { authService } from "../services/authService";

export function createAuthHandlers({ setUser, setIsAuthenticated, navigate }) {
    const storeSession = (session) => {
        localStorage.setItem("accessToken", session.access_token);
        localStorage.setItem("refreshToken", session.refresh_token);
    };

    const clearSession = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
    };

    return {
        handleLogin: async (email, password) => {
            try {
                const { user, session } = await authService.login(email, password);
                storeSession(session);
                setUser(user);
                setIsAuthenticated(true);
                navigate("/dashboard");
            } catch (error) {
                toast.error(error.response?.data?.error || "Login failed.");
            }
        },

        handleSignup: async (email, password) => {
            try {
                const { user, session } = await authService.signup(email, password);

                if (!session) {
                    toast.success("Account created — check your email to confirm.");
                    navigate("/");
                    return;
                }

                storeSession(session);
                setUser(user);
                setIsAuthenticated(true);
                navigate("/dashboard");
            } catch (error) {
                toast.error(error.response?.data?.error || "Signup failed.");
            }
        },

        handleLogout: async () => {
            try {
                await authService.logout();
            } catch {
                // proceed with local cleanup even if the server call fails
            }
            clearSession();
            setUser(null);
            setIsAuthenticated(false);
            navigate("/");
        },
    };
}