/**
 * Trung tâm cấu hình API URL cho toàn bộ ứng dụng Frontend
 * Tự động đọc VITE_API_URL từ environment variable (.env / Vercel),
 * fallback về "http://localhost:5000" khi chạy local.
 */
const getBaseUrl = () => {
    let url = import.meta.env.VITE_API_URL || "https://ecommerce-project-n45y.onrender.com";
    return url.replace(/\/+$/, "").replace(/\/api$/, "");
};

export const API_URL = getBaseUrl();
export const UPLOADS_URL = `${API_URL}/uploads`;

export default API_URL;
