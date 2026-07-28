import { useEffect, useState } from "react";
import "../../../css/admin/Products.css";
import { FiX } from "react-icons/fi";
import { UPLOADS_URL } from "../../../config/api";

const ProductModal = ({
    open,
    mode = "add",
    product,
    onClose,
    onSave
}) => {

    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        stock_quantity: "",
        category_id: "",
        brand_id: "",
        status: "Active",
        image_url: "",
        image: null
    });

    useEffect(() => {

        if (mode === "edit" && product) {

            setForm({
                name: product.name || "",
                description: product.description || "",
                price: product.price || "",
                stock_quantity: product.stock_quantity || "",
                category_id: product.category_id || "",
                brand_id: product.brand_id || "",
                status: product.status || "Active",
                image_url: "",
                image: null
            });

        } else {

            setForm({
                name: "",
                description: "",
                price: "",
                stock_quantity: "",
                category_id: "",
                brand_id: "",
                status: "Active",
                image_url: ""
            });

        }

    }, [product, mode]);

    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));

    };

    const handleSubmit = (e) => {

        e.preventDefault();
    
        console.log("Submit clicked");
    
        const data = new FormData();
    
        data.append("name", form.name);
        data.append("description", form.description);
        data.append("price", form.price);
        data.append("stock_quantity", form.stock_quantity);
        data.append("category_id", form.category_id);
        data.append("brand_id", form.brand_id);
        data.append("status", form.status);
    
        if (form.image) {
            data.append("image", form.image);
        }
    
        console.log("Calling onSave...");
    
        onSave(data);
    };



    if (!open) return null;

    return (

        <div className="modal-overlay">

            <div className="product-modal">

                <div className="modal-header">

                    <h2>

                        {mode === "add"
                            ? "Add Product"
                            : "Edit Product"}

                    </h2>

                    <button
                        className="close-btn"
                        onClick={onClose}
                    >

                        <FiX />

                    </button>

                </div>

                <form
                    className="product-form"
                    onSubmit={handleSubmit}
                >

                    <div className="form-grid">

                        <div className="form-group">

                            <label>Product Name</label>

                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />

                        </div>

                        <div className="form-group">

                            <label>Price</label>

                            <input
                                type="number"
                                name="price"
                                value={form.price}
                                onChange={handleChange}
                                required
                            />

                        </div>

                        <div className="form-group">

                            <label>Stock</label>

                            <input
                                type="number"
                                name="stock_quantity"
                                value={form.stock_quantity}
                                onChange={handleChange}
                            />

                        </div>

                        <div className="form-group">

                            <label>Category ID</label>

                            <input
                                type="number"
                                name="category_id"
                                value={form.category_id}
                                onChange={handleChange}
                            />

                        </div>

                        <div className="form-group">

                            <label>Brand ID</label>

                            <input
                                type="number"
                                name="brand_id"
                                value={form.brand_id}
                                onChange={handleChange}
                            />

                        </div>

                        <div className="form-group">

                            <label>Status</label>

                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                            >

                                <option value="Active">
                                    Active
                                </option>

                                <option value="Inactive">
                                    Inactive
                                </option>

                            </select>

                        </div>

                        <div className="form-group full">

                        <div className="form-group full">

<label>Product Image</label>

<input
    type="file"
    accept="image/*"
    onChange={(e) => {

        const file = e.target.files[0];

        setForm(prev => ({
            ...prev,
            image: file
        }));

    }}
/>

{form.image_url && !form.image && (

    <img
        src={`${UPLOADS_URL}/${form.image_url}`}
        alt=""
        style={{
            width: 120,
            marginTop: 10,
            borderRadius: 8
        }}
    />

)}

{form.image && (

    <img
        src={URL.createObjectURL(form.image)}
        alt=""
        style={{
            width: 120,
            marginTop: 10,
            borderRadius: 8
        }}
    />

)}

</div>

                            {form.image_url && (

                                <img
                                    src={`${UPLOADS_URL}/${form.image_url}`}
                                    alt=""
                                    style={{
                                        width: 120,
                                        marginTop: 10,
                                        borderRadius: 8
                                    }}
                                />

                            )}

                        </div>

                        <div className="form-group full">

                            <label>Description</label>

                            <textarea
                                rows="5"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                            />

                        </div>

                    </div>

                    <div className="modal-footer">

                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={onClose}
                        >

                            Cancel

                        </button>

                        <button
                            type="submit"
                            className="save-btn"
                        >

                            {mode === "add"
                                ? "Add Product"
                                : "Save Changes"}

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

};

export default ProductModal;