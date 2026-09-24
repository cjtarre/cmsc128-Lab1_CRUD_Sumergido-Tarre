import api from "../../../shared/services/api";

const API_URL = '/api/tags';

export const tagService = {
    getTags: async () => {
        const response = await api.get(API_URL);
        return response.data;
    }
};