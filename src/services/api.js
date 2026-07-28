// src/services/api.js
import axios from 'axios';

const API = axios.create({
    baseURL: "https://ecommerce-project-n45y.onrender.com/api"
});

export default API;