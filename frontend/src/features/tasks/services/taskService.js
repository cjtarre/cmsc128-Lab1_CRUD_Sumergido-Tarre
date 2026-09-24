import api from "../../../shared/services/api";

const API_URL = '/api/tasks';

export const taskService = {
    getTasks: async () => {
        const response = await api.get(API_URL);
        return response.data;
    },
    createTask: async (taskData) => {
        const response = await api.post(API_URL, taskData);
        return response.data;
    },
    updateTask: async (taskId, taskData) => {
        const response = await api.put(`${API_URL}/${taskId}`, taskData);
        return response.data;
    },
    deleteTask: async (taskId) => {
        const response = await api.delete(`${API_URL}/${taskId}`);
        return response.data;
    },
    restoreTask: async (taskId) => {
        const response = await api.patch(`${API_URL}/${taskId}/restore`);
        return response.data;
    },
};
