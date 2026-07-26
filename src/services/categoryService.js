import axios from "axios";

const API_URL = "http://localhost:5000/api/categories";

// =======================
// GET ALL
// =======================

export const getAllCategories = async () => {
    try {
        const { data } = await axios.get(API_URL);
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

    const { data } = await axios.post(API_URL, category);

    return data.category;

};

// =======================
// UPDATE
// =======================

export const updateCategory = async (id, category) => {

    const { data } = await axios.put(
        `${API_URL}/${id}`,
        category
    );

    return data.category;

};

// =======================
// DELETE
// =======================

export const deleteCategory = async (id) => {

    const { data } = await axios.delete(
        `${API_URL}/${id}`
    );

    return data;

};

// =======================
// EXPORT
// =======================

export const exportCategories = async () => {

    const response = await axios.get(
        `${API_URL}/export`,
        {
            responseType: "blob",
        }
    );

    return response.data;

};