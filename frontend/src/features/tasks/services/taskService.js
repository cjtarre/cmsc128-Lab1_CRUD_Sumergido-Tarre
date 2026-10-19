import api from "../../../shared/services/api";

const API_URL = "/api/tasks";

export const taskService = {
    getTasks: async (projectId = null) => {
        const response = await api.get(API_URL, { params: projectId ? { project_id: projectId } : {} });
        return response.data;
    },

    createTask: async (task) => {
        const response = await api.post(API_URL, task);
        return response.data;
    },

    updateTask: async (id, task) => {
        const response = await api.put(`${API_URL}/${id}`, task);
        return response.data;
    },

    deleteTask: async (id) => {
        const response = await api.delete(`${API_URL}/${id}`);
        return response.data;
    },

    restoreTask: async (id) => {
        const response = await api.patch(`${API_URL}/${id}/restore`);
        return response.data;
    },
};