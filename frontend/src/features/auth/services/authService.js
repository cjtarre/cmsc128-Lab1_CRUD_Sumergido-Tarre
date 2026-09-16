import api from "../../../shared/services/api";

export const authService = {
    signup: async (email, password) => {
        const response = await api.post("/api/auth/signup", {
            email,
            password,
        });

        return response.data;
    },

    login: async (email, password) => {
        const response = await api.post("/api/auth/login", {
            email,
            password,
        });

        return response.data;
    },

    getCurrentUser: async () => {
        const response = await api.get("/api/auth/me");

        return response.data;
    },

    logout: async (refreshToken) => {
        const response = await api.post("/api/auth/logout", {
            refresh_token: refreshToken,
        });

        return response.data;
    },
};