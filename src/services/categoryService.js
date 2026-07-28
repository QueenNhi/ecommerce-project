import API from "./api";

// =======================
// GET ALL
// =======================
export const getAllCategories = async () => {
    try {
        const { data } = await API.get("/categories");
        return data;
    } catch (err) {
        console.error(err);
        return [];
    }
};

// =======================
// CREATE
// =======================
export const createCategory = async (category) => {
    const { data } = await API.post("/categories", category);
    return data.category;
};

// =======================
// UPDATE
// =======================
export const updateCategory = async (id, category) => {
    const { data } = await API.put(`/categories/${id}`, category);
    return data.category;
};

// =======================
// DELETE
// =======================
export const deleteCategory = async (id) => {
    const { data } = await API.delete(`/categories/${id}`);
    return data;
};

// =======================
// EXPORT
// =======================
export const exportCategories = async () => {
    const response = await API.get("/categories/export", {
        responseType: "blob",
    });
    return response.data;
};