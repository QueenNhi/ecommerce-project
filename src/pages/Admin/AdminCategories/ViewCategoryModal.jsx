const ViewCategoryModal = ({
    open,
    category,
    onClose
}) => {

    if (!open || !category) return null;

    return (

        <div className="modal-overlay">

            <div className="category-modal">

                {/* HEADER */}

                <div className="modal-header">

                    <h2>

                        Category Details

                    </h2>

                    <button
                        type="button"
                        className="close-btn"
                        onClick={onClose}
                    >
                        ×
                    </button>

                </div>

                {/* BODY */}

                <div
                    style={{
                        padding: "28px"
                    }}
                >

                    <div className="view-info">

                        <div className="info-row">

                            <span>ID</span>

                            <strong>

                                {category.id ?? "-"}

                            </strong>

                        </div>

                        <div className="info-row">

                            <span>Category Name</span>

                            <strong>

                                {category.name ?? "-"}

                            </strong>

                        </div>

                        <div className="info-row">

                            <span>Description</span>

                            <strong>

                                {category.description || "-"}

                            </strong>

                        </div>

                        <div className="info-row">

                            <span>Total Products</span>

                            <strong>

                                {category.total_products ?? 0}

                            </strong>

                        </div>

                        <div className="info-row">

                            <span>Created At</span>

                            <strong>

                                {

                                    category.created_at

                                        ? new Date(
                                            category.created_at
                                        ).toLocaleString("vi-VN")

                                        : "-"

                                }

                            </strong>

                        </div>

                    </div>

                </div>

                {/* FOOTER */}

                <div className="modal-footer">

                    <button
                        type="button"
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

export default ViewCategoryModal;