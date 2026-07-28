import { useEffect, useState } from "react";
    import AdminLayout from "../../../layouts/AdminLayout";
    import ViewProductModal from "./ViewProductModal";
    import DeleteProductModal from "./DeleteProductModal";
    import "../../../css/admin/Products.css";
    import ProductModal from "./ProductModal";
    import { exportProducts } from "../../../services/productService";
    import { UPLOADS_URL } from "../../../config/api"; // <--- ĐÃ THÊM DÒNG IMPORT NÀY

    import {
        getAllProducts,
        deleteProduct,
        createProduct,
        updateProduct
    } from "../../../services/productService";



    import {
        FiSearch,
        FiDownload,
        FiPlus,
        FiEye,
        FiEdit2,
        FiTrash2
    } from "react-icons/fi";

    const Products = () => {

        const [products, setProducts] = useState([]);
        const [loading, setLoading] = useState(true);
        const [search, setSearch] = useState("");
        
        const [viewOpen, setViewOpen] = useState(false);
        const [deleteOpen, setDeleteOpen] = useState(false);
        const [productOpen, setProductOpen] = useState(false);
        
        const [selectedProduct, setSelectedProduct] = useState(null);

        // Pagination
        const [currentPage, setCurrentPage] = useState(1);
        const productsPerPage = 10;
        

        useEffect(() => {

            loadProducts();
        
        }, []);
        
        const loadProducts = async () => {
        
            try {
        
                const data = await getAllProducts();
        
                setProducts(data);
        
            } catch (err) {
        
                console.log(err);
        
            } finally {
        
                setLoading(false);
        
            }
        
        };
        // ======================
    // VIEW
    // ======================

    const handleView = (product) => {

        setSelectedProduct(product);

        setViewOpen(true);

    };

    const handleEdit = (product) => {

        setSelectedProduct(product);

        setProductOpen(true);

    };

    const handleSave = async (form) => {

        try {
    
            if (selectedProduct) {
    
                const updatedProduct = await updateProduct(selectedProduct.id, form);
    
                setProducts(prev =>
                    prev.map(item =>
                        item.id === updatedProduct.id
                            ? updatedProduct
                            : item
                    )
                );
    
            } else {
    
                const newProduct = await createProduct(form);
    
                setProducts(prev => [newProduct, ...prev]);
    
            }
    
            setProductOpen(false);
    
            setSelectedProduct(null);
    
        } catch (err) {

    console.error(err);

    if (err.response) {
        console.log(err.response.data);
    }

    alert(err.message);

}
    
    };

    // ======================
    // DELETE
    // ======================

    const handleDeleteClick = (product) => {

        setSelectedProduct(product);

        setDeleteOpen(true);

    };

    const handleDelete = async (id) => {

        try {

            await deleteProduct(id);

            setProducts(prev =>
                prev.filter(item => item.id !== id)
            );

            setDeleteOpen(false);

            setSelectedProduct(null);

        } catch (err) {

            console.log(err);

            alert("Delete failed!");

        }

    };

    const handleExport = async () => {

        try {
    
            const blob = await exportProducts();
    
            const url = window.URL.createObjectURL(blob);
    
            const link = document.createElement("a");
    
            link.href = url;
    
            link.download = "products.xlsx";
    
            document.body.appendChild(link);
    
            link.click();
    
            link.remove();
    
            window.URL.revokeObjectURL(url);
    
        } catch (err) {
    
            console.log(err);
    
            alert("Export thất bại!");
    
        }
    
    };

        // Search
        const filteredProducts = products.filter((item) =>
            item.name.toLowerCase().includes(search.toLowerCase())
        );

        // Pagination
        const totalPages = Math.ceil(
            filteredProducts.length / productsPerPage
        );

        const indexOfLast = currentPage * productsPerPage;
        const indexOfFirst = indexOfLast - productsPerPage;

        const currentProducts = filteredProducts.slice(
            indexOfFirst,
            indexOfLast
        );

        return (

            <AdminLayout>

                {/* Toolbar */}

                <div className="product-toolbar">

                    <div className="search-box">

                        <FiSearch />

                        <input
                            type="text"
                            placeholder="Search product..."
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
                        onClick={handleExport}   >
                        <FiDownload />
                        Export
                    </button>

                        <button
        className="add-btn"
        onClick={() => {

            setSelectedProduct(null);

            setProductOpen(true);

        }}
    >

                            <FiPlus />
                            Add Product

                        </button>

                    </div>

                </div>

                
                {/* Table */}

                <div className="product-table-wrapper">

                    <table className="product-table">

                        <thead>

                            <tr>

                                <th></th>
                                <th>PRODUCT</th>
                                <th>CATEGORY</th>
                                <th>PRICE</th>
                                <th>STOCK</th>
                                <th>STATUS</th>
                                <th>ACTIONS</th>

                            </tr>

                        </thead>

                        <tbody>

                            {loading ? (

                                <tr>

                                    <td colSpan="7">
                                        Loading...
                                    </td>

                                </tr>

                            ) : currentProducts.length === 0 ? (

                                <tr>

                                    <td colSpan="7">
                                        No products found.
                                    </td>

                                </tr>

                            ) : (

                                currentProducts.map((item) => (

                                    <tr key={item.id}>

                                        <td>

                                            <input type="checkbox" />

                                        </td>

                                        <td>

                                            <div className="product-info">

                                            <img
                                                src={`${UPLOADS_URL}/${item.image_url}`}
                                                alt={item.name}
                                                onError={(e) => {
                                                    e.target.src =
                                                        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='70' height='70'><rect width='70' height='70' rx='10' fill='%23f1f5f9'/><text x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-size='10' font-family='sans-serif' fill='%2394a3b8'>No Img</text></svg>";
                                                }}
                                            />

                                                <div>

                                                    <h4>{item.name}</h4>

                                                    <span>ID: {item.id}</span>

                                                </div>

                                            </div>

                                        </td>

                                        <td>

                                            {item.category_id}

                                        </td>

                                        <td>

                                            {Number(item.price).toLocaleString("vi-VN")} ₫

                                        </td>

                                        <td>

                                            {item.stock_quantity}

                                        </td>

                                        <td>

                                            <span
                                                className={
                                                    item.status === "Active"
                                                        ? "status active"
                                                        : "status inactive"
                                                }
                                            >

                                                {item.status}

                                            </span>

                                        </td>

                                        <td>

                                            <div className="table-actions">

                                        <button onClick={() => handleView(item)}>

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

                            )}

                        </tbody>

                    </table>

                </div>

                {/* Footer */}

                <div className="table-footer">

    <span>
        Showing {indexOfFirst + 1} - {Math.min(indexOfLast, filteredProducts.length)} of {filteredProducts.length} products
    </span>

    <div className="pagination">

        {/* Prev */}

        <button
            className="page-arrow"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
        >
            &#8249;
        </button>

        {/* Trang đầu */}

        <button
            className={currentPage === 1 ? "active-page" : ""}
            onClick={() => setCurrentPage(1)}
        >
            1
        </button>

        {/* Trang thứ 2 */}

        {totalPages >= 2 && (

            <button
                className={currentPage === 2 ? "active-page" : ""}
                onClick={() => setCurrentPage(2)}
            >
                2
            </button>

        )}

        {/* ... */}

        {totalPages > 4 && (

            <span className="dots">
                ...
            </span>

        )}

        {/* Trang cuối */}

        {totalPages > 2 && (

            <button
                className={
                    currentPage === totalPages
                        ? "active-page"
                        : ""
                }
                onClick={() => setCurrentPage(totalPages)}
            >
                {totalPages}
            </button>

        )}

        {/* Next */}

        <button
            className="page-arrow"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
        >
            &#8250;
        </button>

    </div>

    </div>

    <ViewProductModal
    open={viewOpen}
    product={selectedProduct}
    onClose={() => {
        setViewOpen(false);
        setSelectedProduct(null);
    }}
/>

<DeleteProductModal
    open={deleteOpen}
    product={selectedProduct}
    onClose={() => {
        setDeleteOpen(false);
        setSelectedProduct(null);
    }}
    onDelete={handleDelete}
/>

<ProductModal
    open={productOpen}
    mode={selectedProduct ? "edit" : "add"}
    product={selectedProduct}
    onClose={() => {

        setProductOpen(false);

        setSelectedProduct(null);

    }}
    onSave={handleSave}
/>
    </AdminLayout>

        );

    };

    export default Products;