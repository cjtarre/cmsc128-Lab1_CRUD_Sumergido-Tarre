import AppRoutes from "./routes/AppRoutes";
import AppToaster from "./shared/components/common/AppToaster";
import { AuthProvider } from "./features/auth/context/AuthContext";
import { ThemeProvider } from "./shared/context/ThemeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30 * 1000,
            gcTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <AuthProvider>
                    <AppRoutes />
                    <AppToaster />
                </AuthProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}

export default App;