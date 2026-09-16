import api from "./api";

export const authService = {
    signup: async (email, password) => {
        const response = await api.post("/api/auth/signup", { email, password });
        return response.data;
    },

    login: async (email, password) => {
        const response = await api.post("/api/auth/login", { email, password });
        return response.data;
    },

    logout: async () => {
        const refreshToken = localStorage.getItem("refreshToken");
        const response = await api.post("/api/auth/logout");
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await api.get("/api/auth/me");
        return response.data;
    }
};
