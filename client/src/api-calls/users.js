import { axiosInstance } from './index';

export const loginUser = async (user) => {
    try {
        const response = await axiosInstance.post('/api/users/login', user);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
};

export const registerUser = async (user) => {
    try {
        const response = await axiosInstance.post('/api/users/register', user);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
};

export const getCurrentUser = async () => {
    try {
        const response = await axiosInstance.get('/api/users/get-current-user');
        return response.data;
    } catch (error) {
        return error.response.data;
    }
};

export const getAllUsers = async () => {
    try {
        const response = await axiosInstance.get('/api/users/get-all-users');
        return response.data;
    } catch (error) {
        return error.response.data;
    }
};

export const updateProfilePicture = async (image) => {
    try {
        const response = await axiosInstance.post('/api/users/update-profile-picture', {
            image
        });
        return response.data;
    } catch (error) {
        return error.response.data;
    }
};
