import api from "../../../shared/services/api";

const API_URL = '/api/auth';

export const authService = {
    signup: async (email, password) => {
        const response = await api.post(`${API_URL}/signup`, {
            email,
            password,
        });

        return response.data;
    },

    login: async (email, password) => {
        const response = await api.post(`${API_URL}/login`, {
            email,
            password,
        });

        return response.data;
    },

    getCurrentUser: async () => {
        const response = await api.get(`${API_URL}/me`);

        return response.data;
    },

    logout: async (refreshToken) => {
        const response = await api.post(`${API_URL}/logout`, {
            refresh_token: refreshToken,
        });

        return response.data;
    },
};