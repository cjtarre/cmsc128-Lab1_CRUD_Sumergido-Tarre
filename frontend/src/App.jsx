import AppRoutes from "./routes/AppRoutes";
import AppToaster from "./shared/components/common/AppToaster";
import { AuthProvider } from "./features/auth/context/AuthContext";
import { ThemeProvider } from "./shared/context/ThemeContext";

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <AppRoutes />
                <AppToaster />
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;