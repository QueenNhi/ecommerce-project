const DeleteCategoryModal = ({
    open,
    category,
    onClose,
    onDelete
}) => {

    if (!open || !category) return null;

    return (

        <div className="modal-overlay">

            <div className="category-modal">

                {/* HEADER */}

                <div className="modal-header">

                    <h2>

                        Delete Category

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

                    <p
                        style={{
                            fontSize: "16px",
                            lineHeight: "28px",
                            marginBottom: "30px"
                        }}
                    >

                        Are you sure you want to delete

                        <strong>

                            {" "}

                            {category.name}

                        </strong>

                        ?

                    </p>

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
                        type="button"
                        className="delete-btn"
                        onClick={() => onDelete(category.id)}
                    >

                        Delete

                    </button>

                </div>

            </div>

        </div>

    );

};

export default DeleteCategoryModal;