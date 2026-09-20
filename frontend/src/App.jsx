import AppRoutes from "./routes/AppRoutes";
import AppToaster from "./shared/components/common/AppToaster";
import { TaskProvider } from "./features/tasks/context/TaskContext";
import { AuthProvider } from "./features/auth/context/AuthContext";
import { ThemeProvider } from "./shared/context/ThemeContext";

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <TaskProvider>
                    <AppRoutes />
                    <AppToaster />
                </TaskProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;