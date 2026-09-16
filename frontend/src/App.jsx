import AppRoutes from "./routes/AppRoutes";
import AppToaster from "./shared/components/common/AppToaster";
import { AuthProvider } from "./shared/context/AuthContext";

function App() {
    return (
        <AuthProvider>
            <AppRoutes />
            <AppToaster />
        </AuthProvider>
    );
}

export default App;