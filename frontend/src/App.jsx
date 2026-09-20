import AppRoutes from "./routes/AppRoutes";
import AppToaster from "./shared/components/common/AppToaster";
import { TaskProvider } from "./features/tasks/context/TaskContext";
import { AuthProvider } from "./features/auth/context/AuthContext";

function App() {
    return (
        <AuthProvider>
            <TaskProvider>
                <AppRoutes />
                <AppToaster />
            </TaskProvider>
        </AuthProvider>
    );
}

export default App;