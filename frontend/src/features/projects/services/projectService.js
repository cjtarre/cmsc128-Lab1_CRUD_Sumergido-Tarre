import api from "../../../shared/services/api";

const API_URL = "/api/projects";

export const projectService = {
    getProjects: async () => {
        const response = await api.get(API_URL);
        return response.data;
    },

    getDeletedProjects: async () => {
        const response = await api.get(API_URL, { params: { deleted: true } });
        return response.data;
    },

    createProject: async (projectName) => {
        const response = await api.post(API_URL, { project_name: projectName });
        return response.data;
    },

    updateProject: async (projectId, projectData) => {
        const response = await api.put(`${API_URL}/${projectId}`, projectData);
        return response.data;
    },

    deleteProject: async (projectId) => {
        const response = await api.delete(`${API_URL}/${projectId}`);
        return response.data;
    },

    restoreProject: async (projectId) => {
        const response = await api.patch(`${API_URL}/${projectId}/restore`);
        return response.data;
    },

    getMembers: async (projectId) => {
        const response = await api.get(`${API_URL}/${projectId}/members`);
        return response.data;
    },

    changeMemberRole: async (projectId, userId, role) => {
        const response = await api.patch(`${API_URL}/${projectId}/members/${userId}`, { role });
        return response.data;
    },

    removeMember: async (projectId, userId) => {
        const response = await api.delete(`${API_URL}/${projectId}/members/${userId}`);
        return response.data;
    },

    leaveProject: async (projectId) => {
        const response = await api.post(`${API_URL}/${projectId}/leave`);
        return response.data;
    },

    getActivities: async (projectId, limit = 20) => {
        const response = await api.get(`${API_URL}/${projectId}/activities`, { params: { limit } });
        return response.data;
    },
};