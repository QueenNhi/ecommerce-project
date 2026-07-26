import { useEffect, useState } from "react";
import AdminLayout from "../../../layouts/AdminLayout";

import CategoryModal from "./CategoryModal";
import ViewCategoryModal from "./ViewCategoryModal";
import DeleteCategoryModal from "./DeleteCategoryModal";


import "../../../css/admin/Categories.css";

import {
    FiSearch,
    FiDownload,
    FiPlus,
    FiEye,
    FiEdit2,
    FiTrash2
} from "react-icons/fi";

import {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    exportCategories
} from "../../../services/categoryService";

const Categories = () => {

    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [viewOpen, setViewOpen] = useState(false);

    const [deleteOpen, setDeleteOpen] = useState(false);

    const [categoryOpen, setCategoryOpen] = useState(false);

    const [selectedCategory, setSelectedCategory] = useState(null);

    // ==========================
    // PAGINATION
    // ==========================

    const [currentPage, setCurrentPage] = useState(1);

    const categoriesPerPage = 10;

    // ==========================
    // LOAD CATEGORY
    // ==========================

    useEffect(() => {

        loadCategories();

    }, []);

    const loadCategories = async () => {

        try {

            const data = await getAllCategories();

            setCategories(data);

        } catch (err) {

            console.log(err);

        } finally {

            setLoading(false);

        }

    };

    // ==========================
    // VIEW
    // ==========================

    const handleView = (category) => {

        setSelectedCategory(category);

        setViewOpen(true);

    };

    // ==========================
    // EDIT
    // ==========================

    const handleEdit = (category) => {

        setSelectedCategory(category);

        setCategoryOpen(true);

    };

    // ==========================
    // SAVE
    // ==========================

    const handleSave = async (form) => {

        try {

            if (selectedCategory) {

                const updated = await updateCategory(
                    selectedCategory.id,
                    form
                );

                setCategories(prev =>
                    prev.map(item =>
                        item.id === updated.id
                            ? updated
                            : item
                    )
                );

            } else {

                const created = await createCategory(form);

                setCategories(prev => [created, ...prev]);

            }

            setCategoryOpen(false);

            setSelectedCategory(null);

        } catch (err) {

            console.log(err);

            alert("Save failed!");

        }

    };

    // ==========================
    // DELETE
    // ==========================

    const handleDeleteClick = (category) => {

        setSelectedCategory(category);

        setDeleteOpen(true);

    };

    const handleDelete = async (id) => {

        try {

            await deleteCategory(id);

            setCategories(prev =>
                prev.filter(item => item.id !== id)
            );

            setDeleteOpen(false);

            setSelectedCategory(null);

        } catch (err) {

            console.log(err);

            alert("Delete failed!");

        }

    };

    // ==========================
    // EXPORT
    // ==========================

    const handleExport = async () => {

        try {

            const blob = await exportCategories();

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");

            link.href = url;

            link.download = "categories.xlsx";

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

        } catch (err) {

            console.log(err);

            alert("Export failed!");

        }

    };

    // ==========================
    // SEARCH
    // ==========================

    const filteredCategories = categories.filter(item =>

        item.name.toLowerCase().includes(search.toLowerCase())

    );

    // ==========================
    // PAGINATION
    // ==========================

    const totalPages = Math.ceil(

        filteredCategories.length / categoriesPerPage

    );

    const indexOfLast = currentPage * categoriesPerPage;

    const indexOfFirst = indexOfLast - categoriesPerPage;

    const currentCategories = filteredCategories.slice(

        indexOfFirst,

        indexOfLast

    );

    return (

        <AdminLayout>
    
            {/* Toolbar */}
    
            <div className="category-toolbar">
    
                <div className="search-box">
    
                    <FiSearch />
    
                    <input
                        type="text"
                        placeholder="Search category..."
                        value={search}
                        onChange={(e) => {
    
                            setSearch(e.target.value);
    
                            setCurrentPage(1);
    
                        }}
                    />
    
                </div>
    
                <div className="toolbar-actions">
    
                    <button
                        className="export-btn"
                        onClick={handleExport}
                    >
    
                        <FiDownload />
    
                        Export
    
                    </button>
    
                    <button
                        className="add-btn"
                        onClick={() => {
    
                            setSelectedCategory(null);
    
                            setCategoryOpen(true);
    
                        }}
                    >
    
                        <FiPlus />
    
                        Add Category
    
                    </button>
    
                </div>
    
            </div>
    
            {/* TABLE */}
    
            <div className="category-table-wrapper">
    
                <table className="category-table">
    
                    <thead>
    
                        <tr>
    
                            <th></th>
    
                            <th>CATEGORY</th>
    
                            <th>DESCRIPTION</th>
    
                            <th>PRODUCTS</th>
    
                            <th>ACTIONS</th>
    
                        </tr>
    
                    </thead>
    
                    <tbody>
    
                        {
    
                            loading ?
    
                            (
    
                                <tr>
    
                                    <td colSpan="5">
    
                                        Loading...
    
                                    </td>
    
                                </tr>
    
                            )
    
                            :
    
                            currentCategories.length === 0 ?
    
                            (
    
                                <tr>
    
                                    <td colSpan="5">
    
                                        No categories found.
    
                                    </td>
    
                                </tr>
    
                            )
    
                            :
    
                            (
    
                                currentCategories.map((item) => (
    
                                    <tr key={item.id}>
    
                                        <td>
    
                                            <input type="checkbox" />
    
                                        </td>
    
                                        <td>
    
                                            <div className="category-info">
    
                                                <h4>
    
                                                    {item.name}
    
                                                </h4>
    
                                                <span>
    
                                                    ID: {item.id}
    
                                                </span>
    
                                            </div>
    
                                        </td>
    
                                        <td>
    
                                            {item.description}
    
                                        </td>
    
                                        <td>
    
                                            <span className="product-count">
    
                                                {item.total_products}
    
                                            </span>
    
                                        </td>
    
                                        <td>
    
                                            <div className="table-actions">
    
                                                <button
                                                    onClick={() => handleView(item)}
                                                >
    
                                                    <FiEye />
    
                                                </button>
    
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                >
    
                                                    <FiEdit2 />
    
                                                </button>
    
                                                <button
                                                    onClick={() => handleDeleteClick(item)}
                                                >
    
                                                    <FiTrash2 />
    
                                                </button>
    
                                            </div>
    
                                        </td>
    
                                    </tr>
    
                                ))
    
                            )
    
                        }
    
                    </tbody>
    
                </table>
    
            </div>
    
            {/* FOOTER */}
    
            <div className="table-footer">
    
                <span>
    
                    Showing {indexOfFirst + 1} -
    
                    {" "}
    
                    {Math.min(indexOfLast, filteredCategories.length)}
    
                    {" "}of{" "}
    
                    {filteredCategories.length}
    
                    {" "}categories
    
                </span>
    
                <div className="pagination">
    
                    <button
                        className="page-arrow"
                        disabled={currentPage === 1}
                        onClick={() =>
                            setCurrentPage(currentPage - 1)
                        }
                    >
                        &#8249;
                    </button>
    
                    <button
                        className={
                            currentPage === 1
                                ? "active-page"
                                : ""
                        }
                        onClick={() => setCurrentPage(1)}
                    >
                        1
                    </button>
    
                    {
    
                        totalPages >= 2 && (
    
                            <button
                                className={
                                    currentPage === 2
                                        ? "active-page"
                                        : ""
                                }
                                onClick={() =>
                                    setCurrentPage(2)
                                }
                            >
                                2
                            </button>
    
                        )
    
                    }
    
                    {
    
                        totalPages > 4 &&
    
                        <span className="dots">
    
                            ...
    
                        </span>
    
                    }
    
                    {
    
                        totalPages > 2 && (
    
                            <button
                                className={
                                    currentPage === totalPages
                                        ? "active-page"
                                        : ""
                                }
                                onClick={() =>
                                    setCurrentPage(totalPages)
                                }
                            >
    
                                {totalPages}
    
                            </button>
    
                        )
    
                    }
    
                    <button
                        className="page-arrow"
                        disabled={currentPage === totalPages}
                        onClick={() =>
                            setCurrentPage(currentPage + 1)
                        }
                    >
    
                        &#8250;
    
                    </button>
    
                </div>
    
            </div> 
                    {/* VIEW MODAL */}

        <ViewCategoryModal
            open={viewOpen}
            category={selectedCategory}
            onClose={() => {

                setViewOpen(false);

                setSelectedCategory(null);

            }}
        />

        {/* DELETE MODAL */}

        <DeleteCategoryModal
            open={deleteOpen}
            category={selectedCategory}
            onClose={() => {

                setDeleteOpen(false);

                setSelectedCategory(null);

            }}
            onDelete={handleDelete}
        />

        {/* ADD / EDIT MODAL */}

        <CategoryModal
            open={categoryOpen}
            mode={selectedCategory ? "edit" : "add"}
            category={selectedCategory}
            onClose={() => {

                setCategoryOpen(false);

                setSelectedCategory(null);

            }}
            onSave={handleSave}
        />

    </AdminLayout>

);

};

export default Categories;

