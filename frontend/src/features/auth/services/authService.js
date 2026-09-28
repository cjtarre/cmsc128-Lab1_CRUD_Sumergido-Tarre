import api from "../../../shared/services/api";

const AUTH_URL = "/api/auth";
const USERS_URL = "/api/users";

export const authService = {
    signup: async (email, password, username) => {
        const response = await api.post(`${AUTH_URL}/signup`, { email, password, username });
        return response.data;
    },

    login: async (email, password) => {
        const response = await api.post(`${AUTH_URL}/login`, { email, password });
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await api.get(`${AUTH_URL}/me`);
        return response.data;
    },

    updateProfile: async (username) => {
        const response = await api.patch(`${USERS_URL}/me`, { username });
        return response.data;
    },

    updateEmail: async (email) => {
        const refresh_token = localStorage.getItem("refreshToken");
        const response = await api.patch(`${USERS_URL}/me/email`, { email, refresh_token });
        return response.data;
    },

    updatePassword: async (password) => {
        const refresh_token = localStorage.getItem("refreshToken");
        const response = await api.patch(`${USERS_URL}/me/password`, { password, refresh_token });
        return response.data;
    },

    logout: async (refreshToken) => {
        const response = await api.post(`${AUTH_URL}/logout`, { refresh_token: refreshToken });
        return response.data;
    },
};