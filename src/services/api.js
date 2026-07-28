import axios from 'axios';
import { API_URL } from '../config/api';

const API = axios.create({
    baseURL: `${API_URL}/api`
});

// Tự động đính kèm Token trong header nếu user đã đăng nhập
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default API;