import API from "./api";

// ====================================
// GET HOME PRODUCTS (15 sản phẩm)
// ====================================
export const getProducts = async () => {
    try {
        const response = await API.get("/products");
        return response.data;
    } catch (err) {
        throw new Error("Không thể lấy sản phẩm.");
    }
};

// ====================================
// GET ALL PRODUCTS
// ====================================
export const getAllProducts = async () => {
    try {
        const response = await API.get("/products/all");
        return response.data;
    } catch (err) {
        throw new Error("Không thể lấy danh sách sản phẩm.");
    }
};

// ====================================
// GET PRODUCT DETAIL
// ====================================
export const getProductById = async (id) => {
    try {
        const response = await API.get(`/products/${id}`);
        return response.data;
    } catch (err) {
        throw new Error("Không tìm thấy sản phẩm.");
    }
};

// ====================================
// CREATE PRODUCT
// ====================================
export const createProduct = async (formData) => {
    try {
        const response = await API.post("/products", formData);
        return response.data;
    } catch (err) {
        throw new Error("Thêm sản phẩm thất bại.");
    }
};

// ====================================
// UPDATE PRODUCT
// ====================================
export const updateProduct = async (id, formData) => {
    try {
        const response = await API.put(`/products/${id}`, formData);
        return response.data;
    } catch (err) {
        throw new Error("Cập nhật sản phẩm thất bại.");
    }
};

// ====================================
// DELETE PRODUCT
// ====================================
export const deleteProduct = async (id) => {
    try {
        const response = await API.delete(`/products/${id}`);
        return response.data;
    } catch (err) {
        throw new Error("Xóa sản phẩm thất bại.");
    }
};

// ====================================
// EXPORT PRODUCTS
// ====================================
export const exportProducts = async () => {
    try {
        const response = await API.get("/products/export", {
            responseType: "blob",
        });
        return response.data;
    } catch (err) {
        throw new Error("Export thất bại.");
    }
};