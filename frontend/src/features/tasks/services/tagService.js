import api from "../../../shared/services/api";

const API_URL = "/api/tags";

export const tagService = {
    getTags: async ({ projectId, defaultProject = false } = {}) => {
        const params = {};

        if (projectId) params.project_id = projectId;
        else if (defaultProject) params.default = true;

        const response = Object.keys(params).length
            ? await api.get(API_URL, { params })
            : await api.get(API_URL);

        return response.data;
    },

    createTag: async ({ tagName, color, projectId }) => {
        const response = await api.post(API_URL, {
            tag_name: tagName,
            color,
            ...(projectId ? { project_id: projectId } : {}),
        });

        return response.data;
    },

    updateTag: async (tagId, { tagName, color }) => {
        const response = await api.patch(`${API_URL}/${tagId}`, {
            ...(tagName !== undefined ? { tag_name: tagName } : {}),
            ...(color !== undefined ? { color } : {}),
        });

        return response.data;
    },

    deleteTag: async (tagId) => {
        const response = await api.delete(`${API_URL}/${tagId}`);
        return response.data;
    },
};