import "../../../css/admin/Products.css";

import {
    FiX,
    FiPackage,
    FiTag,
    FiLayers,
    FiDollarSign,
    FiArchive,
    FiCheckCircle
} from "react-icons/fi";

const ViewProductModal = ({ open, product, onClose }) => {

    if (!open || !product) return null;

    return (

        <div className="modal-overlay">

            <div className="view-modal">

                {/* Header */}

                <div className="modal-header">

                    <h2>

                        Product Details

                    </h2>

                    <button
                        className="close-btn"
                        onClick={onClose}
                    >

                        <FiX />

                    </button>

                </div>

                {/* Body */}

                <div className="view-body">

                    {/* Image */}

                    <div className="view-image">

                        <img
                            src={`http://localhost:5000/uploads/${product.image_url}`}
                            alt={product.name}
                            onError={(e) => {
                                if (!e.target.dataset.err) {
                                    e.target.dataset.err = 1;
                                    e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><rect width='400' height='400' rx='16' fill='%23f1f5f9'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='18' font-family='sans-serif' fill='%2394a3b8'>No Image</text></svg>";
                                }
                            }}
                        />

                    </div>

                    {/* Info */}

                    <div className="view-info">

                        <div className="info-item">

                            <FiPackage />

                            <div>

                                <label>Name</label>

                                <p>{product.name}</p>

                            </div>

                        </div>

                        <div className="info-item">

                            <FiTag />

                            <div>

                                <label>ID</label>

                                <p>

                                    #{product.id}

                                </p>

                            </div>

                        </div>

                        <div className="info-item">

                            <FiLayers />

                            <div>

                                <label>Category</label>

                                <p>

                                    {product.category_id}

                                </p>

                            </div>

                        </div>

                        <div className="info-item">

                            <FiDollarSign />

                            <div>

                                <label>Price</label>

                                <p>

                                    {Number(product.price).toLocaleString("vi-VN")} ₫

                                </p>

                            </div>

                        </div>

                        <div className="info-item">

                            <FiArchive />

                            <div>

                                <label>Stock</label>

                                <p>

                                    {product.stock_quantity}

                                </p>

                            </div>

                        </div>

                        <div className="info-item">

                            <FiCheckCircle />

                            <div>

                                <label>Status</label>

                                <p>

                                    <span
                                        className={
                                            product.status === "Active"
                                                ? "status active"
                                                : "status inactive"
                                        }
                                    >

                                        {product.status}

                                    </span>

                                </p>

                            </div>

                        </div>

                        <div className="description-box">

                            <h4>

                                Description

                            </h4>

                            <p>

                                {product.description ||
                                    "No description."}

                            </p>

                        </div>

                    </div>

                </div>

                {/* Footer */}

                <div className="modal-footer">

                    <button
                        className="cancel-btn"
                        onClick={onClose}
                    >

                        Close

                    </button>

                </div>

            </div>

        </div>

    );

};

export default ViewProductModal;