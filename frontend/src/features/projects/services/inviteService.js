import api from "../../../shared/services/api";

export const inviteService = {
    getProjectInvites: async (projectId) => {
        const response = await api.get(`/api/projects/${projectId}/invites`);
        return response.data;
    },

    createInvite: async (projectId, identifier, role) => {
        const response = await api.post(`/api/projects/${projectId}/invites`, { identifier, role });
        return response.data;
    },

    cancelInvite: async (projectId, inviteId) => {
        const response = await api.delete(`/api/projects/${projectId}/invites/${inviteId}`);
        return response.data;
    },

    getMyInvites: async () => {
        const response = await api.get("/api/invites");
        return response.data;
    },

    acceptInvite: async (inviteId) => {
        const response = await api.post(`/api/invites/${inviteId}/accept`);
        return response.data;
    },

    declineInvite: async (inviteId) => {
        const response = await api.post(`/api/invites/${inviteId}/decline`);
        return response.data;
    },
};