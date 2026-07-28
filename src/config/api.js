/**
 * Trung tâm cấu hình API URL cho toàn bộ ứng dụng Frontend
 * Tự động phát hiện môi trường Vercel Production vs Localhost.
 */
const getBaseUrl = () => {
    let url = import.meta.env.VITE_API_URL;

    // Bảo vệ: Nếu chạy trên Vercel/Production (hostname khác localhost) 
    // mà biến VITE_API_URL chưa cài đặt hoặc bị trỏ lầm về localhost
    if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
        if (!url || url.includes("localhost") || url.includes("127.0.0.1")) {
            url = "https://ecommerce-project-n45y.onrender.com";
        }
    }

    if (!url || url.trim() === "") {
        url = "https://ecommerce-project-n45y.onrender.com";
    }

    return url.replace(/\/+$/, "").replace(/\/api$/, "");
};

export const API_URL = getBaseUrl();
export const UPLOADS_URL = `${API_URL}/uploads`;

export default API_URL;
