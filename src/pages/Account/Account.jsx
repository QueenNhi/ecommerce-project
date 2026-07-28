import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";
import "../../css/Account.css";
import { API_URL } from "../../config/api";

const Account = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("orders");
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    const userId = user?.id || 1;

    const fetchUserOrders = async () => {
        if (!user?.id) {
            setOrders([]);
            setLoadingOrders(false);
            return;
        }
        try {
            const res = await fetch(`${API_URL}/api/orders/user/${user.id}`);
            const data = await res.json();
            if (data.success && Array.isArray(data.orders)) {
                setOrders(data.orders);
            }
        } catch (err) {
            console.error("Fetch user orders error:", err);
        } finally {
            setLoadingOrders(false);
        }
    };

    useEffect(() => {
        fetchUserOrders();
    }, [user]);

    const renderStatusBadge = (status) => {
        const s = status ? status.toLowerCase() : "pending";
        if (s === "completed") return <span className="status-badge active">Đã hoàn thành</span>;
        if (s === "shipping") return <span className="status-badge active" style={{ backgroundColor: "#e0f2fe", color: "#0369a1" }}>Đang giao hàng</span>;
        if (s === "cancelled") return <span className="status-badge blocked">Đã hủy</span>;
        return <span className="status-badge active" style={{ backgroundColor: "#fef3c7", color: "#b45309" }}>Đang xử lý</span>;
    };

    return (
        <div className="account-page">
            <Header />

            <div className="account-container">
                <div className="account-card">
                    
                    {/* TABS */}
                    <div className="account-tabs">
                        <button
                            className={`account-tab-btn ${activeTab === "orders" ? "active" : ""}`}
                            onClick={() => setActiveTab("orders")}
                        >
                            📦 Lịch sử đơn hàng
                        </button>
                        <button
                            className={`account-tab-btn ${activeTab === "profile" ? "active" : ""}`}
                            onClick={() => setActiveTab("profile")}
                        >
                            👤 Thông tin cá nhân
                        </button>
                    </div>

                    {/* ORDERS TAB */}
                    {activeTab === "orders" && (
                        <div>
                            <h2 style={{ fontSize: "20px", fontWeight: "700", margin: "0 0 16px" }}>Danh sách đơn hàng của bạn</h2>
                            
                            {loadingOrders ? (
                                <div style={{ textAlign: "center", color: "#64748b", padding: "40px" }}>
                                    Đang tải lịch sử đơn hàng...
                                </div>
                            ) : orders.length === 0 ? (
                                <div style={{ textAlign: "center", color: "#64748b", padding: "40px" }}>
                                    Bạn chưa đặt đơn hàng nào.
                                </div>
                            ) : (
                                <div className="promotions-table-container">
                                    <table className="promotions-table">
                                        <thead>
                                            <tr>
                                                <th>Mã đơn</th>
                                                <th>Ngày đặt</th>
                                                <th>Số sản phẩm</th>
                                                <th>Thanh toán</th>
                                                <th>Tổng tiền</th>
                                                <th>Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map(order => (
                                                <tr key={order.id}>
                                                    <td style={{ fontWeight: "700", color: "#2563eb" }}>#LX-{order.id}</td>
                                                    <td>{new Date(order.created_at).toLocaleDateString("vi-VN")}</td>
                                                    <td>{order.total_items} sản phẩm</td>
                                                    <td style={{ textTransform: "uppercase", fontSize: "12px", fontWeight: "600" }}>{order.payment_method}</td>
                                                    <td style={{ fontWeight: "700", color: "#16a34a" }}>
                                                        {Number(order.total_price).toLocaleString("vi-VN")}₫
                                                    </td>
                                                    <td>{renderStatusBadge(order.order_status)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* PROFILE TAB */}
                    {activeTab === "profile" && (
                        <div style={{ maxWidth: "540px" }}>
                            <h2 style={{ fontSize: "20px", fontWeight: "700", margin: "0 0 20px" }}>Thông tin tài khoản</h2>
                            
                            <div className="form-group">
                                <label>Họ và tên</label>
                                <input type="text" className="form-control" value={user?.fullname || "Chưa cập nhật"} readOnly />
                            </div>

                            <div className="form-group">
                                <label>Email liên hệ</label>
                                <input type="email" className="form-control" value={user?.email || "Chưa cập nhật"} readOnly />
                            </div>

                            <div className="form-group">
                                <label>Vai trò hệ thống</label>
                                <input type="text" className="form-control" value={user?.role === 'admin' ? 'Quản trị viên' : user?.role === 'manager' ? 'Quản lý' : 'Khách hàng'} readOnly />
                            </div>

                            <div className="form-group">
                                <label>Địa chỉ mặc định</label>
                                <textarea className="form-control" rows="2" defaultValue="123 Le Loi, District 1, Ho Chi Minh City" />
                            </div>

                            <button className="add-promo-btn" style={{ marginTop: "12px" }}>
                                💾 Cập nhật hồ sơ
                            </button>
                        </div>
                    )}

                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Account;
