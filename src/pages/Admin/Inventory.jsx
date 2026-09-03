import { useEffect, useState, useCallback } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getAllProducts, updateStock } from "../../services/productService";
import { UPLOADS_URL } from "../../config/api";
import "../../css/admin/Inventory.css";

import {
    FiSearch,
    FiRefreshCw,
    FiPackage,
    FiAlertTriangle,
    FiXCircle,
    FiCheckCircle,
    FiEdit3,
    FiCheck,
    FiX,
    FiPlusCircle,
    FiSliders
} from "react-icons/fi";

const LOW_STOCK_THRESHOLD = 10;

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [stats, setStats] = useState({
        total_products: 0,
        out_of_stock_count: 0,
        low_stock_count: 0,
        in_stock_count: 0
    });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all"); // all | low | out | in

    // Inline edit state
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [saving, setSaving] = useState(false);
    const [successId, setSuccessId] = useState(null);

    const loadInventory = useCallback(async () => {
        setLoading(true);
        try {
            // Dùng chung API getAllProducts để đồng bộ dữ liệu chuẩn nhất từ bảng products
            const data = await getAllProducts();
            const productList = Array.isArray(data) ? data : (data.products || []);
            
            // Map thêm các flag tồn kho
            const mappedProducts = productList.map(p => ({
                ...p,
                stock_quantity: Number(p.stock_quantity) || 0,
                is_out_of_stock: Number(p.stock_quantity) <= 0 || p.status === "Out of Stock",
                is_low_stock: Number(p.stock_quantity) > 0 && Number(p.stock_quantity) <= LOW_STOCK_THRESHOLD
            }));

            setProducts(mappedProducts);

            // Tính toán stats tĩnh trên Frontend
            setStats({
                total_products: mappedProducts.length,
                out_of_stock_count: mappedProducts.filter(p => p.is_out_of_stock).length,
                low_stock_count: mappedProducts.filter(p => p.is_low_stock).length,
                in_stock_count: mappedProducts.filter(p => !p.is_out_of_stock && !p.is_low_stock).length
            });
        } catch (err) {
            console.error("Lỗi tải kho hàng:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadInventory();
    }, [loadInventory]);

    // Bắt đầu chỉnh sửa stock
    const handleEditStart = (product) => {
        setEditingId(product.id);
        setEditValue(String(product.stock_quantity));
    };

    // Hủy chỉnh sửa
    const handleEditCancel = () => {
        setEditingId(null);
        setEditValue("");
    };

    // Lưu stock
    const handleEditSave = async (productId) => {
        const qty = Number(editValue);
        if (isNaN(qty)) return;
        setSaving(true);
        try {
            const result = await updateStock(productId, qty);
            if (result.success) {
                // Gọi lại API fetch danh sách để lấy dữ liệu mới nhất (gồm cả việc tự động update stats)
                await loadInventory();
                setSuccessId(productId);
                setTimeout(() => setSuccessId(null), 2000);
                setEditingId(null);
            }
        } catch (err) {
            alert("Cập nhật tồn kho thất bại: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    // Filter + Search
    const filtered = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        if (!matchSearch) return false;
        if (filter === "out") return p.is_out_of_stock;
        if (filter === "low") return p.is_low_stock;
        if (filter === "in") return !p.is_out_of_stock && !p.is_low_stock;
        return true;
    });

    const getStockBadge = (product) => {
        if (product.is_out_of_stock) {
            return <span className="inv-badge inv-badge--out"><FiXCircle /> Hết hàng</span>;
        }
        if (product.is_low_stock) {
            return <span className="inv-badge inv-badge--low"><FiAlertTriangle /> Sắp hết</span>;
        }
        return <span className="inv-badge inv-badge--ok"><FiCheckCircle /> Còn hàng</span>;
    };

    return (
        <AdminLayout>
            <div className="inv-page">

                {/* HEADER */}
                <div className="inv-header">
                    <div className="inv-title-block">
                        <FiPackage className="inv-title-icon" />
                        <div>
                            <h1>Quản lý kho hàng</h1>
                            <p>Theo dõi và cập nhật số lượng tồn kho sản phẩm</p>
                        </div>
                    </div>
                    <button className="inv-refresh-btn" onClick={loadInventory} disabled={loading}>
                        <FiRefreshCw className={loading ? "spinning" : ""} />
                        Làm mới
                    </button>
                </div>

                {/* STAT CARDS */}
                <div className="inv-stats">
                    <div className="inv-stat-card inv-stat--total">
                        <div className="stat-num">{stats.total_products}</div>
                        <div className="stat-label">Tổng sản phẩm</div>
                    </div>
                    <div className="inv-stat-card inv-stat--ok">
                        <div className="stat-num">{stats.in_stock_count}</div>
                        <div className="stat-label">Còn hàng</div>
                    </div>
                    <div className="inv-stat-card inv-stat--low">
                        <div className="stat-num">{stats.low_stock_count}</div>
                        <div className="stat-label">Sắp hết (≤{LOW_STOCK_THRESHOLD})</div>
                    </div>
                    <div className="inv-stat-card inv-stat--out">
                        <div className="stat-num">{stats.out_of_stock_count}</div>
                        <div className="stat-label">Hết hàng</div>
                    </div>
                </div>

                {/* TOOLBAR */}
                <div className="inv-toolbar">
                    <div className="inv-search">
                        <FiSearch />
                        <input
                            type="text"
                            placeholder="Tìm sản phẩm..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="inv-filters">
                        <FiSliders />
                        {[
                            { key: "all", label: "Tất cả" },
                            { key: "in", label: "✅ Còn hàng" },
                            { key: "low", label: "⚠️ Sắp hết" },
                            { key: "out", label: "🔴 Hết hàng" }
                        ].map(f => (
                            <button
                                key={f.key}
                                className={`inv-filter-btn${filter === f.key ? " active" : ""}`}
                                onClick={() => setFilter(f.key)}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* TABLE */}
                <div className="inv-table-wrapper">
                    <table className="inv-table">
                        <thead>
                            <tr>
                                <th>Sản phẩm</th>
                                <th>Danh mục</th>
                                <th>Giá</th>
                                <th>Tồn kho</th>
                                <th>Trạng thái</th>
                                <th>Cập nhật kho</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="inv-loading">
                                        <div className="inv-spinner" />
                                        Đang tải dữ liệu kho hàng...
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="inv-empty">
                                        Không tìm thấy sản phẩm phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map(product => (
                                    <tr
                                        key={product.id}
                                        className={`inv-row${product.is_out_of_stock ? " row-out" : product.is_low_stock ? " row-low" : ""}`}
                                    >
                                        {/* PRODUCT */}
                                        <td>
                                            <div className="inv-product-cell">
                                                <img
                                                    src={`${UPLOADS_URL}/${product.image_url}`}
                                                    alt={product.name}
                                                    className="inv-product-img"
                                                    onError={e => {
                                                        e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='50' height='50'><rect width='50' height='50' rx='8' fill='%23f1f5f9'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-size='10' fill='%2394a3b8'>N/A</text></svg>";
                                                    }}
                                                />
                                                <div>
                                                    <div className="inv-product-name">{product.name}</div>
                                                    <div className="inv-product-id">ID: {product.id}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* CATEGORY */}
                                        <td className="inv-category">
                                            {product.category_name || "—"}
                                        </td>

                                        {/* PRICE */}
                                        <td className="inv-price">
                                            {Number(product.price).toLocaleString("vi-VN")}₫
                                        </td>

                                        {/* STOCK QTY */}
                                        <td>
                                            <div className={`inv-qty${product.is_out_of_stock ? " qty-out" : product.is_low_stock ? " qty-low" : " qty-ok"}`}>
                                                {successId === product.id
                                                    ? <span className="qty-saved">✅ Đã lưu!</span>
                                                    : product.stock_quantity}
                                            </div>
                                        </td>

                                        {/* STATUS BADGE */}
                                        <td>
                                            {getStockBadge(product)}
                                        </td>

                                        {/* EDIT STOCK */}
                                        <td>
                                            {editingId === product.id ? (
                                                <div className="inv-edit-row">
                                                    <input
                                                        type="number"
                                                        className="inv-qty-input"
                                                        value={editValue}
                                                        min={0}
                                                        onChange={e => setEditValue(e.target.value)}
                                                        onKeyDown={e => {
                                                            if (e.key === "Enter") handleEditSave(product.id);
                                                            if (e.key === "Escape") handleEditCancel();
                                                        }}
                                                        autoFocus
                                                    />
                                                    <button
                                                        className="inv-save-btn"
                                                        onClick={() => handleEditSave(product.id)}
                                                        disabled={saving}
                                                        title="Lưu"
                                                    >
                                                        <FiCheck />
                                                    </button>
                                                    <button
                                                        className="inv-cancel-btn"
                                                        onClick={handleEditCancel}
                                                        title="Hủy"
                                                    >
                                                        <FiX />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    className="inv-edit-btn"
                                                    onClick={() => handleEditStart(product)}
                                                    title="Cập nhật tồn kho"
                                                >
                                                    <FiEdit3 />
                                                    <span>Cập nhật</span>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="inv-footer">
                    Hiển thị {filtered.length} / {products.length} sản phẩm
                    {filter !== "all" && (
                        <button className="inv-clear-filter" onClick={() => setFilter("all")}>
                            <FiX /> Xóa bộ lọc
                        </button>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default Inventory;
