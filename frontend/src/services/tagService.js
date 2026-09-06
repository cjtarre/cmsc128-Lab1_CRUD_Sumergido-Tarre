import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api/tags`;

export const tagService = {
    getTags: async () => {
        const response = await axios.get(API_URL);
        return response.data;
    }
};