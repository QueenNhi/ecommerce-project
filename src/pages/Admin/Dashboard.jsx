import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import "../../css/admin/Dashboard.css";
import {
    FiDollarSign,
    FiShoppingBag,
    FiUsers,
    FiBox,
    FiArrowRight
} from "react-icons/fi";

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalCustomers: 0,
        recentOrders: [],
        topProducts: [],
        statusBreakdown: []
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/admin/stats");
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
    }, []);

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

    return (
        <AdminLayout>
            <div className="admin-dashboard">
                
                {/* HEADER */}
                <div className="dashboard-header">
                    <h1>Tổng quan hệ thống (Dashboard)</h1>
                    <p>Theo dõi chỉ số doanh thu, đơn hàng và hoạt động kinh doanh trực tiếp</p>
                </div>

                {/* STAT CARDS */}
                <div className="dashboard-cards">
                    
                    <div className="stat-card">
                        <div className="stat-info">
                            <p>Tổng doanh thu</p>
                            <h2>{loading ? "..." : `${stats.totalRevenue.toLocaleString("vi-VN")}₫`}</h2>
                        </div>
                        <div className="stat-icon revenue">
                            <FiDollarSign />
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-info">
                            <p>Tổng đơn hàng</p>
                            <h2>{loading ? "..." : stats.totalOrders}</h2>
                        </div>
                        <div className="stat-icon orders">
                            <FiShoppingBag />
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-info">
                            <p>Khách hàng</p>
                            <h2>{loading ? "..." : stats.totalCustomers}</h2>
                        </div>
                        <div className="stat-icon customers">
                            <FiUsers />
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-info">
                            <p>Sản phẩm</p>
                            <h2>{loading ? "..." : stats.totalProducts}</h2>
                        </div>
                        <div className="stat-icon products">
                            <FiBox />
                        </div>
                    </div>

                </div>

                {/* MAIN GRID */}
                <div className="dashboard-grid">
                    
                    {/* RECENT ORDERS TABLE */}
                    <div className="dashboard-box">
                        <div className="box-header">
                            <h3>Đơn hàng gần đây</h3>
                            <Link to="/admin/orders" className="btn-link">
                                Xem tất cả đơn hàng <FiArrowRight />
                            </Link>
                        </div>

                        {loading ? (
                            <p style={{ color: "#64748b", textAlign: "center", padding: "20px" }}>Đang tải...</p>
                        ) : stats.recentOrders.length === 0 ? (
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
                        ) : stats.topProducts.length === 0 ? (
                            <p style={{ color: "#64748b", textAlign: "center", padding: "20px" }}>Chưa có dữ liệu bán hàng.</p>
                        ) : (
                            <div className="top-product-list">
                                {stats.topProducts.map(prod => (
                                    <div className="top-product-item" key={prod.id}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <img
                                                src={`http://localhost:5000/uploads/${prod.image_url}`}
                                                alt={prod.name}
                                                onError={(e) => { if(!e.target.dataset.err){e.target.dataset.err=1;e.target.src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='44' height='44'><rect width='44' height='44' rx='8' fill='%23f1f5f9'/><text x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-size='9' font-family='sans-serif' fill='%2394a3b8'>IMG</text></svg>";} }}
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

            </div>
        </AdminLayout>
    );
};

export default Dashboard;