import API_URL from "./api";

// ====================================
// GET HOME PRODUCTS (15 sản phẩm)
// ====================================

export const getProducts = async () => {

    const res = await fetch(`${API_URL}/products`);

    if (!res.ok) {
        throw new Error("Không thể lấy sản phẩm.");
    }

    return await res.json();

};

// ====================================
// GET ALL PRODUCTS
// ====================================

export const getAllProducts = async () => {

    const res = await fetch(`${API_URL}/products/all`);

    if (!res.ok) {
        throw new Error("Không thể lấy danh sách sản phẩm.");
    }

    return await res.json();

};

// ====================================
// GET PRODUCT DETAIL
// ====================================

export const getProductById = async (id) => {

    const res = await fetch(`${API_URL}/products/${id}`);

    if (!res.ok) {
        throw new Error("Không tìm thấy sản phẩm.");
    }

    return await res.json();

};

// ====================================
// CREATE PRODUCT
// ====================================
export const createProduct = async (formData) => {

    const res = await fetch(`${API_URL}/products`, {

        method: "POST",

        body: formData

    });

    if (!res.ok) {
        throw new Error("Thêm sản phẩm thất bại.");
    }

    return await res.json();

};
// ====================================
// UPDATE PRODUCT
// ====================================

export const updateProduct = async (id, formData) => {

    const res = await fetch(`${API_URL}/products/${id}`, {

        method: "PUT",

        body: formData

    });

    if (!res.ok) {
        throw new Error("Cập nhật sản phẩm thất bại.");
    }

    return await res.json();

};
// ====================================
// DELETE PRODUCT
// ====================================

export const deleteProduct = async (id) => {

    const res = await fetch(`${API_URL}/products/${id}`, {

        method: "DELETE"

    });

    if (!res.ok) {
        throw new Error("Xóa sản phẩm thất bại.");
    }

    return await res.json();

};

// ====================================
// EXPORT PRODUCTS
// ====================================

export const exportProducts = async () => {

    const res = await fetch(`${API_URL}/products/export`);

    if (!res.ok) {
        throw new Error("Export thất bại.");
    }

    return await res.blob();

};