import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/api";
import "../../css/admin/Dashboard.css";
import {
    FiDollarSign,
    FiShoppingBag,
    FiUsers,
    FiBox,
    FiArrowRight,
    FiClock,
    FiCheckCircle,
    FiAlertTriangle,
    FiXCircle,
    FiTruck,
    FiUserPlus,
    FiRefreshCw
} from "react-icons/fi";

const Dashboard = () => {
    const { user, token, isAdmin, isSalesStaff, isWarehouseStaff } = useAuth();

    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [accessDenied, setAccessDenied] = useState(false);

    const fetchStats = async () => {
        try {
            setLoading(true);
            setAccessDenied(false);

            const headers = {
                "Content-Type": "application/json"
            };

            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            if (user?.role) {
                headers["x-user-role"] = user.role;
            }

            const res = await fetch(`${API_URL}/api/admin/stats`, { headers });

            if (res.status === 403) {
                setAccessDenied(true);
                return;
            }

            const data = await res.json();
            if (data.success && data.stats) {
                setStats(data.stats);
            }
        } catch (err) {
            console.error("Fetch dashboard stats error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [user, token]);

    const getStatusText = (status) => {
        switch (status?.toLowerCase()) {
            case "pending": return "Chờ xử lý";
            case "processing": return "Đang xử lý";
            case "shipping": return "Đang giao hàng";
            case "completed": return "Đã hoàn thành";
            case "cancelled": return "Đã hủy";
            default: return status || "N/A";
        }
    };

    // ─── 403 ACCESS DENIED STATE ─────────────────────
    if (accessDenied) {
        return (
            <AdminLayout>
                <div style={{ padding: "60px 24px", textAlign: "center" }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔒</div>
                    <h2 style={{ color: "#0f172a", margin: "0 0 8px" }}>Truy cập bị từ chối</h2>
                    <p style={{ color: "#64748b", margin: 0 }}>Tài khoản của bạn không có quyền xem bảng thông tin Dashboard.</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="admin-dashboard">

                {/* ─── 1. ADMIN DASHBOARD VIEW ─────────────────────── */}
                {isAdmin && (
                    <>
                        <div className="dashboard-header">
                            <h1>Tổng quan hệ thống (Admin Dashboard)</h1>
                            <p>Theo dõi các chỉ số doanh thu, đơn hàng và hoạt động kinh doanh toàn diện</p>
                        </div>

                        {/* CARDS */}
                        <div className="dashboard-cards">
                            <div className="stat-card">
                                <div className="stat-info">
                                    <p>Tổng doanh thu</p>
                                    <h2>{loading ? "..." : `${(stats.totalRevenue || 0).toLocaleString("vi-VN")}₫`}</h2>
                                </div>
                                <div className="stat-icon revenue">
                                    <FiDollarSign />
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-info">
                                    <p>Tổng đơn hàng</p>
                                    <h2>{loading ? "..." : (stats.totalOrders || 0)}</h2>
                                </div>
                                <div className="stat-icon orders">
                                    <FiShoppingBag />
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-info">
                                    <p>Khách hàng</p>
                                    <h2>{loading ? "..." : (stats.totalCustomers || 0)}</h2>
                                </div>
                                <div className="stat-icon customers">
                                    <FiUsers />
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-info">
                                    <p>Sản phẩm</p>
                                    <h2>{loading ? "..." : (stats.totalProducts || 0)}</h2>
                                </div>
                                <div className="stat-icon products">
                                    <FiBox />
                                </div>
                            </div>
                        </div>

                        {/* GRID */}
                        <div className="dashboard-grid">
                            {/* RECENT ORDERS */}
                            <div className="dashboard-box">
                                <div className="box-header">
                                    <h3>Đơn hàng gần đây</h3>
                                    <Link to="/admin/orders" className="btn-link">
                                        Xem tất cả <FiArrowRight />
                                    </Link>
                                </div>

                                {loading ? (
                                    <p style={{ color: "#64748b", textAlign: "center", padding: "20px" }}>Đang tải...</p>
                                ) : !stats.recentOrders || stats.recentOrders.length === 0 ? (
                                    <p style={{ color: "#64748b", textAlign: "center", padding: "20px" }}>Chưa có đơn hàng nào.</p>
                                ) : (
                                    <div className="recent-orders-container">
                                        <table className="recent-orders-table">
                                            <thead>
                                                <tr>
                                                    <th>Mã Đơn</th>
                                                    <th>Khách hàng</th>
                                                    <th>Ngày đặt</th>
                                                    <th>Tổng tiền</th>
                                                    <th>Trạng thái</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {stats.recentOrders.map(order => (
                                                    <tr key={order.id}>
                                                        <td style={{ fontWeight: "700", color: "#2563eb" }}>#LX-{order.id}</td>
                                                        <td style={{ fontWeight: "600" }}>{order.fullname}</td>
                                                        <td>{new Date(order.created_at).toLocaleDateString("vi-VN")}</td>
                                                        <td style={{ fontWeight: "700" }}>{Number(order.total_price).toLocaleString("vi-VN")}₫</td>
                                                        <td>
                                                            <span className={`status-badge ${order.order_status}`}>
                                                                {getStatusText(order.order_status)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* TOP SELLING PRODUCTS */}
                            <div className="dashboard-box">
                                <div className="box-header">
                                    <h3>Top Sản phẩm bán chạy</h3>
                                </div>

                                {loading ? (
                                    <p style={{ color: "#64748b", textAlign: "center", padding: "20px" }}>Đang tải...</p>
                                ) : !stats.topProducts || stats.topProducts.length === 0 ? (
                                    <p style={{ color: "#64748b", textAlign: "center", padding: "20px" }}>Chưa có dữ liệu.</p>
                                ) : (
                                    <div className="top-product-list">
                                        {stats.topProducts.map(prod => (
                                            <div className="top-product-item" key={prod.id}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                    <img
                                                        src={`${API_URL}/uploads/${prod.image_url}`}
                                                        alt={prod.name}
                                                        onError={(e) => { if (!e.target.dataset.err) { e.target.dataset.err = 1; e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='44' height='44'><rect width='44' height='44' rx='8' fill='%23f1f5f9'/><text x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-size='9' font-family='sans-serif' fill='%2394a3b8'>IMG</text></svg>"; } }}
                                                    />
                                                    <div className="top-product-info">
                                                        <h5>{prod.name}</h5>
                                                        <p>{Number(prod.price).toLocaleString("vi-VN")}₫</p>
                                                    </div>
                                                </div>
                                                <span className="badge-sold">{prod.total_sold} bán</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* ─── 2. SALE DASHBOARD VIEW ───────────────────────── */}
                {isSalesStaff && !isAdmin && (
                    <>
                        <div className="dashboard-header">
                            <h1>Bảng điều khiển Bán hàng (Sales Dashboard)</h1>
                            <p>Quản lý đơn hàng, xử lý yêu cầu và theo dõi khách hàng mới</p>
                        </div>

                        {/* CARDS */}
                        <div className="dashboard-cards">
                            <div className="stat-card">
                                <div className="stat-info">
                                    <p>Đơn chờ xác nhận</p>
                                    <h2>{loading ? "..." : (stats.pendingOrders || 0)}</h2>
                                </div>
                                <div className="stat-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
                                    <FiClock />
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-info">
                                    <p>Đơn đang xử lý</p>
                                    <h2>{loading ? "..." : (stats.processingOrders || 0)}</h2>
                                </div>
                                <div className="stat-icon" style={{ background: "#e0f2fe", color: "#0284c7" }}>
                                    <FiRefreshCw />
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-info">
                                    <p>Đơn hoàn thành hôm nay</p>
                                    <h2>{loading ? "..." : (stats.completedTodayOrders || 0)}</h2>
                                </div>
                                <div className="stat-icon" style={{ background: "#dcfce7", color: "#16a34a" }}>
                                    <FiCheckCircle />
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-info">
                                    <p>Khách hàng mới (30 ngày)</p>
                                    <h2>{loading ? "..." : (stats.newCustomersCount || 0)}</h2>
                                </div>
                                <div className="stat-icon" style={{ background: "#f3e8ff", color: "#9333ea" }}>
                                    <FiUserPlus />
                                </div>
                            </div>
                        </div>

                        {/* GRID */}
                        <div className="dashboard-grid" style={{ gridTemplateColumns: "1fr" }}>
                            <div className="dashboard-box">
                                <div className="box-header">
                                    <h3>Đơn hàng mới nhận</h3>
                                    <Link to="/admin/orders" className="btn-link">
                                        Quản lý đơn hàng <FiArrowRight />
                                    </Link>
                                </div>

                                {loading ? (
                                    <p style={{ color: "#64748b", textAlign: "center", padding: "20px" }}>Đang tải...</p>
                                ) : !stats.recentOrders || stats.recentOrders.length === 0 ? (
                                    <p style={{ color: "#64748b", textAlign: "center", padding: "20px" }}>Chưa có đơn hàng nào.</p>
                                ) : (
                                    <div className="recent-orders-container">
                                        <table className="recent-orders-table">
                                            <thead>
                                                <tr>
                                                    <th>Mã Đơn</th>
                                                    <th>Khách hàng</th>
                                                    <th>Số điện thoại</th>
                                                    <th>Địa chỉ giao</th>
                                                    <th>Ngày đặt</th>
                                                    <th>Trạng thái</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {stats.recentOrders.map(order => (
                                                    <tr key={order.id}>
                                                        <td style={{ fontWeight: "700", color: "#2563eb" }}>#LX-{order.id}</td>
                                                        <td style={{ fontWeight: "600" }}>{order.fullname}</td>
                                                        <td>{order.phone || "—"}</td>
                                                        <td>{order.address || "—"}</td>
                                                        <td>{new Date(order.created_at).toLocaleDateString("vi-VN")}</td>
                                                        <td>
                                                            <span className={`status-badge ${order.order_status}`}>
                                                                {getStatusText(order.order_status)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* ─── 3. WAREHOUSE DASHBOARD VIEW ─────────────────── */}
                {isWarehouseStaff && !isAdmin && (
                    <>
                        <div className="dashboard-header">
                            <h1>Bảng điều khiển Kho hàng (Warehouse Dashboard)</h1>
                            <p>Theo dõi tồn kho sản phẩm và kiểm soát các đơn hàng cần xuất kho</p>
                        </div>

                        {/* CARDS */}
                        <div className="dashboard-cards">
                            <div className="stat-card">
                                <div className="stat-info">
                                    <p>Tổng sản phẩm</p>
                                    <h2>{loading ? "..." : (stats.totalProducts || 0)}</h2>
                                </div>
                                <div className="stat-icon" style={{ background: "#e0f2fe", color: "#0284c7" }}>
                                    <FiBox />
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-info">
                                    <p>Sản phẩm sắp hết (≤5)</p>
                                    <h2>{loading ? "..." : (stats.lowStockCount || 0)}</h2>
                                </div>
                                <div className="stat-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
                                    <FiAlertTriangle />
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-info">
                                    <p>Sản phẩm hết hàng (0)</p>
                                    <h2>{loading ? "..." : (stats.outOfStockCount || 0)}</h2>
                                </div>
                                <div className="stat-icon" style={{ background: "#fee2e2", color: "#dc2626" }}>
                                    <FiXCircle />
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-info">
                                    <p>Đơn cần xuất kho</p>
                                    <h2>{loading ? "..." : (stats.pendingDispatchCount || 0)}</h2>
                                </div>
                                <div className="stat-icon" style={{ background: "#dcfce7", color: "#16a34a" }}>
                                    <FiTruck />
                                </div>
                            </div>
                        </div>

                        {/* GRID */}
                        <div className="dashboard-grid">
                            {/* LOW STOCK PRODUCTS LIST */}
                            <div className="dashboard-box">
                                <div className="box-header">
                                    <h3>⚠️ Cảnh báo Tồn kho (Sắp hết / Hết hàng)</h3>
                                    <Link to="/admin/products" className="btn-link">
                                        Quản lý kho <FiArrowRight />
                                    </Link>
                                </div>

                                {loading ? (
                                    <p style={{ color: "#64748b", textAlign: "center", padding: "20px" }}>Đang tải...</p>
                                ) : !stats.lowStockList || stats.lowStockList.length === 0 ? (
                                    <p style={{ color: "#16a34a", textAlign: "center", padding: "20px", fontWeight: "600" }}>
                                        ✅ Tất cả sản phẩm đều đủ số lượng tồn kho!
                                    </p>
                                ) : (
                                    <div className="top-product-list">
                                        {stats.lowStockList.map(prod => (
                                            <div className="top-product-item" key={prod.id}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                    <img
                                                        src={`${API_URL}/uploads/${prod.image_url}`}
                                                        alt={prod.name}
                                                        onError={(e) => { if (!e.target.dataset.err) { e.target.dataset.err = 1; e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='44' height='44'><rect width='44' height='44' rx='8' fill='%23f1f5f9'/><text x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-size='9' font-family='sans-serif' fill='%2394a3b8'>IMG</text></svg>"; } }}
                                                    />
                                                    <div>
                                                        <h5 style={{ margin: "0 0 2px", fontSize: "14px", fontWeight: 600 }}>{prod.name}</h5>
                                                        <span style={{ fontSize: "11px", color: "#64748b" }}>Mã SP: #{prod.id}</span>
                                                    </div>
                                                </div>

                                                <span className={`status-badge ${prod.stock_quantity <= 0 ? "cancelled" : "pending"}`}>
                                                    {prod.stock_quantity <= 0 ? "HẾT HÀNG" : `Còn ${prod.stock_quantity} SP`}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* PENDING DISPATCH ORDERS */}
                            <div className="dashboard-box">
                                <div className="box-header">
                                    <h3>🚚 Đơn cần đóng gói xuất kho</h3>
                                    <Link to="/admin/orders" className="btn-link">
                                        Xem đơn <FiArrowRight />
                                    </Link>
                                </div>

                                {loading ? (
                                    <p style={{ color: "#64748b", textAlign: "center", padding: "20px" }}>Đang tải...</p>
                                ) : !stats.pendingDispatchList || stats.pendingDispatchList.length === 0 ? (
                                    <p style={{ color: "#64748b", textAlign: "center", padding: "20px" }}>Không có đơn hàng chờ xuất kho.</p>
                                ) : (
                                    <div className="top-product-list">
                                        {stats.pendingDispatchList.map(order => (
                                            <div className="top-product-item" key={order.id}>
                                                <div>
                                                    <h5 style={{ margin: "0 0 2px", fontSize: "14px", fontWeight: 700, color: "#2563eb" }}>#LX-{order.id}</h5>
                                                    <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>{order.fullname} ({order.phone || "—"})</p>
                                                </div>
                                                <span className={`status-badge ${order.order_status}`}>
                                                    {getStatusText(order.order_status)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

            </div>
        </AdminLayout>
    );
};

export default Dashboard;