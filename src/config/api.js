/**
 * Trung tâm cấu hình API URL cho toàn bộ ứng dụng Frontend
 * Tự động phát hiện môi trường Vercel Production vs Localhost.
 */
const getBaseUrl = () => {
    let url = import.meta.env.VITE_API_URL;

    // Nếu đang chạy trên máy tính (localhost)
    if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
        if (!url || url.trim() === "") {
            url = "http://localhost:5000"; // Tự động trỏ về backend local
        }
    } else {
        // Nếu chạy trên Vercel/Production
        if (!url || url.includes("localhost") || url.includes("127.0.0.1") || url.trim() === "") {
            url = "https://ecommerce-project-n45y.onrender.com"; // Tự động trỏ về backend thật
        }
    }

    return url.replace(/\/+$/, "").replace(/\/api$/, "");
};

export const API_URL = getBaseUrl();
export const UPLOADS_URL = `${API_URL}/uploads`;

/**
 * Tạo Headers có chứa Token xác thực cho các lệnh gọi fetch()
 */
export const getAuthHeaders = (additionalHeaders = {}) => {
    const token = localStorage.getItem("token");
    const headers = {
        ...additionalHeaders
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
};

export default API_URL;

