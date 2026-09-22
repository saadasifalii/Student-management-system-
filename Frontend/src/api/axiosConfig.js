import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // 401 = authentication/token problem
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.assign('/');
        }

        // 403 = authenticated, but not authorized
        // DO NOT logout the user
        return Promise.reject(error);
    }
);

export default api;