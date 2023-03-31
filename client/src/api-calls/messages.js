import { axiosInstance } from './index';

export const sendMessage = async (message) => {
    try {
        const response = await axiosInstance.post('/api/messages/new-message', message);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getMessagesById = async (chatId) => {
    try {
        const response = await axiosInstance.get(`/api/messages/get-all-messages/${chatId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
