import { useEffect, useState } from "react";

const CategoryModal = ({
    open,
    mode,
    category,
    onClose,
    onSave
}) => {

    const [form, setForm] = useState({
        name: "",
        description: ""
    });

    useEffect(() => {

        if (category) {

            setForm({
                name: category.name || "",
                description: category.description || ""
            });

        } else {

            setForm({
                name: "",
                description: ""
            });

        }

    }, [category]);

    if (!open) return null;

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = (e) => {

        e.preventDefault();

        onSave(form);

    };

    return (

        <div className="modal-overlay">

            <div className="category-modal">

                {/* HEADER */}

                <div className="modal-header">

                    <h2>

                        {
                            mode === "edit"
                                ? "Edit Category"
                                : "Add Category"
                        }

                    </h2>

                    <button
                        className="close-btn"
                        type="button"
                        onClick={onClose}
                    >
                        ×
                    </button>

                </div>

                {/* FORM */}

                <form
                    className="category-form"
                    onSubmit={handleSubmit}
                >

                    <div className="form-group">

                        <label>

                            Category Name

                        </label>

                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />

                    </div>

                    <div className="form-group">

                        <label>

                            Description

                        </label>

                        <textarea
                            name="description"
                            rows="5"
                            value={form.description}
                            onChange={handleChange}
                        />

                    </div>

                    {/* FOOTER */}

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
                            {
                                mode === "edit"
                                    ? "Update"
                                    : "Create"
                            }
                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

};

export default CategoryModal;