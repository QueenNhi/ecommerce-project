import { useState } from "react";
import "../../../css/admin/Products.css";

import {
    FiAlertTriangle,
    FiX
} from "react-icons/fi";

const DeleteProductModal = ({
    open,
    product,
    onClose,
    onDelete
}) => {

    const [loading, setLoading] = useState(false);

    if (!open || !product) return null;

    const handleDelete = async () => {

        try {

            setLoading(true);

            await onDelete(product.id);

        } catch (err) {

            console.log(err);

            alert("Delete failed!");

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="modal-overlay">

            <div className="delete-modal">

                {/* Header */}

                <div className="delete-header">

                    <div className="delete-icon">

                        <FiAlertTriangle />

                    </div>

                    <button
                        className="close-btn"
                        onClick={onClose}
                        disabled={loading}
                    >
                        <FiX />
                    </button>

                </div>

                {/* Content */}

                <div className="delete-content">

                    <h2>
                        Delete Product
                    </h2>

                    <p>
                        Are you sure you want to delete this product?
                    </p>

                    <div className="delete-product">

                        <img
                            src={`http://localhost:5000/uploads/${product.image_url}`}
                            alt={product.name}
                            onError={(e) => {
                                if (!e.target.dataset.err) {
                                    e.target.dataset.err = 1;
                                    e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='80' height='80' rx='12' fill='%23f1f5f9'/><text x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-size='10' font-family='sans-serif' fill='%2394a3b8'>No Img</text></svg>";
                                }
                            }}
                        />

                        <div>

                            <h4>{product.name}</h4>

                            <span>

                                Product ID: #{product.id}

                            </span>

                        </div>

                    </div>

                    <small>

                        This action cannot be undone.

                    </small>

                </div>

                {/* Footer */}

                <div className="delete-footer">

                    <button
                        className="cancel-btn"
                        onClick={onClose}
                        disabled={loading}
                    >

                        Cancel

                    </button>

                    <button
                        className="delete-btn"
                        onClick={handleDelete}
                        disabled={loading}
                    >

                        {loading
                            ? "Deleting..."
                            : "Delete Product"}

                    </button>

                </div>

            </div>

        </div>

    );

};

export default DeleteProductModal;