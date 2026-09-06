import axios from 'axios';

const API_URL = 'http://localhost:5000/api/tasks';

export const taskService = {
    getTasks: async () => {
        const response = await axios.get(API_URL);
        return response.data;
    },
    createTask: async (taskData) => {
        const response = await axios.post(API_URL, taskData);
        return response.data;
    },
    updateTask: async (taskId, taskData) => {
        const response = await axios.put(`${API_URL}/${taskId}`, taskData);
        return response.data;
    },
    deleteTask: async (taskId) => {
        const response = await axios.delete(`${API_URL}/${taskId}`);
        return response.data;
    }
};
