import {
    FiEye,
    FiEdit2,
    FiTrash2
} from "react-icons/fi";

import { UPLOADS_URL } from "../../../config/api";

const ProductTable = ({
    products,
    loading,
    onView,
    onEdit,
    onDelete
}) => {

    return (

        <div className="product-table-wrapper">

            <table className="product-table">

                <thead>

                    <tr>

                        <th>
                            <input type="checkbox" />
                        </th>

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

                            <td
                                colSpan="7"
                                style={{ textAlign: "center" }}
                            >

                                Loading...

                            </td>

                        </tr>

                    ) : products.length === 0 ? (

                        <tr>

                            <td
                                colSpan="7"
                                style={{ textAlign: "center" }}
                            >

                                No products found.

                            </td>

                        </tr>

                    ) : (

                        products.map((item) => (

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
                                                if (!e.target.dataset.err) {
                                                    e.target.dataset.err = 1;
                                                    e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='70' height='70'><rect width='70' height='70' rx='10' fill='%23f1f5f9'/><text x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-size='10' font-family='sans-serif' fill='%2394a3b8'>No Img</text></svg>";
                                                }
                                            }}
                                        />

                                        <div>

                                            <h4>

                                                {item.name}

                                            </h4>

                                            <span>

                                                ID: {item.id}

                                            </span>

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

                                        <button
                                            onClick={() => onView(item)}
                                            title="View"
                                        >

                                            <FiEye />

                                        </button>

                                        <button
                                            onClick={() => onEdit(item)}
                                            title="Edit"
                                        >

                                            <FiEdit2 />

                                        </button>

                                        <button
                                            onClick={() => onDelete(item)}
                                            title="Delete"
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

    );

};

export default ProductTable;