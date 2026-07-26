import {
    FiEye,
    FiEdit2,
    FiTrash2
} from "react-icons/fi";

const CategoryTable = ({
    categories,
    loading,
    onView,
    onEdit,
    onDelete
}) => {

    if (loading) {

        return (

            <div className="category-table-wrapper">

                <table className="category-table">

                    <tbody>

                        <tr>

                            <td
                                colSpan="5"
                                style={{
                                    textAlign: "center",
                                    padding: "40px"
                                }}
                            >
                                Loading...
                            </td>

                        </tr>

                    </tbody>

                </table>

            </div>

        );

    }

    return (

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

                        categories.length === 0 ?

                        (

                            <tr>

                                <td
                                    colSpan="5"
                                    style={{
                                        textAlign: "center",
                                        padding: "40px"
                                    }}
                                >

                                    No categories found.

                                </td>

                            </tr>

                        )

                        :

                        (

                            categories.map((category) => (

                                <tr key={category.id}>

                                    <td>

                                        <input type="checkbox" />

                                    </td>

                                    <td>

                                        <div className="category-info">

                                            <h4>

                                                {category.name}

                                            </h4>

                                            <span>

                                                ID: {category.id}

                                            </span>

                                        </div>

                                    </td>

                                    <td>

                                        {

                                            category.description ||

                                            "-"

                                        }

                                    </td>

                                    <td>

                                        <span className="product-count">

                                            {

                                                category.total_products ??

                                                0

                                            }

                                        </span>

                                    </td>

                                    <td>

                                        <div className="table-actions">

                                            <button
                                                title="View"
                                                onClick={() =>
                                                    onView(category)
                                                }
                                            >

                                                <FiEye />

                                            </button>

                                            <button
                                                title="Edit"
                                                onClick={() =>
                                                    onEdit(category)
                                                }
                                            >

                                                <FiEdit2 />

                                            </button>

                                            <button
                                                title="Delete"
                                                onClick={() =>
                                                    onDelete(category)
                                                }
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

    );

};

export default CategoryTable;