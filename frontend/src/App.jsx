import AppRoutes from "./routes/AppRoutes";
import AppToaster from "./shared/components/common/AppToaster";
import { TaskProvider } from "./features/tasks/context/TaskContext";

function App() {
    return (
        <TaskProvider>
            <AppRoutes />
            <AppToaster />
        </TaskProvider>
    );
}

export default App;