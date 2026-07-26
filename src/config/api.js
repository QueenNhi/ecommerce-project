/**
 * Trung tâm cấu hình API URL
 * Sử dụng VITE_API_URL từ .env nếu có, fallback sang localhost:5000
 *
 * Cách dùng trong component:
 *   import { API_URL, UPLOADS_URL } from '../../config/api';
 *   fetch(`${API_URL}/api/products/all`)
 *   src={`${UPLOADS_URL}/${product.image_url}`}
 */

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const UPLOADS_URL = `${API_URL}/uploads`;

export default API_URL;
