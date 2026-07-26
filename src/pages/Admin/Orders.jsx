import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import "../../css/admin/Orders.css";

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");

    // Modal state
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);

    // ======================================
    // FETCH ALL ORDERS
    // ======================================
    const fetchOrders = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/admin/orders/all");
            const data = await res.json();
            if (data.success && Array.isArray(data.orders)) {
                setOrders(data.orders);
            } else {
                setOrders([]);
            }
        } catch (err) {
            console.error("Fetch admin orders error:", err);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // ======================================
    // UPDATE ORDER STATUS
    // ======================================
    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const res = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                alert(`✅ ${data.message}`);
                fetchOrders();
            } else {
                alert(data.message || "Cập nhật trạng thái thất bại.");
            }
        } catch (err) {
            console.error("Update status error:", err);
            alert("Lỗi kết nối server.");
        }
    };

    // ======================================
    // VIEW ORDER DETAILS MODAL
    // ======================================
    const handleViewDetail = async (order) => {
        setSelectedOrder(order);
        setModalLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/orders/${order.id}`);
            const data = await res.json();
            if (data.success && Array.isArray(data.items)) {
                setOrderItems(data.items);
            } else {
                setOrderItems([]);
            }
        } catch (err) {
            console.error("Fetch order items error:", err);
            setOrderItems([]);
        } finally {
            setModalLoading(false);
        }
    };

    const closeModal = () => {
        setSelectedOrder(null);
        setOrderItems([]);
    };

    // Filter orders by tab
    const filteredOrders = activeTab === "all"
        ? orders
        : orders.filter(o => o.order_status?.toLowerCase() === activeTab.toLowerCase());

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
            <div className="admin-orders-page">
                
                {/* HEADER */}
                <div className="orders-header">
                    <div>
                        <h1>Quản lý Đơn hàng (Orders)</h1>
                        <p>Theo dõi, duyệt và cập nhật trạng thái đơn hàng từ khách hàng</p>
                    </div>
                </div>

                {/* STATUS TABS */}
                <div className="orders-tabs">
                    <button 
                        className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
                        onClick={() => setActiveTab("all")}
                    >
                        Tất cả ({orders.length})
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
                        onClick={() => setActiveTab("pending")}
                    >
                        Chờ xử lý ({orders.filter(o => o.order_status === "pending").length})
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === "processing" ? "active" : ""}`}
                        onClick={() => setActiveTab("processing")}
                    >
                        Đang xử lý ({orders.filter(o => o.order_status === "processing").length})
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === "shipping" ? "active" : ""}`}
                        onClick={() => setActiveTab("shipping")}
                    >
                        Đang giao ({orders.filter(o => o.order_status === "shipping").length})
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === "completed" ? "active" : ""}`}
                        onClick={() => setActiveTab("completed")}
                    >
                        Hoàn thành ({orders.filter(o => o.order_status === "completed").length})
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === "cancelled" ? "active" : ""}`}
                        onClick={() => setActiveTab("cancelled")}
                    >
                        Đã hủy ({orders.filter(o => o.order_status === "cancelled").length})
                    </button>
                </div>

                {/* TABLE CARD */}
                <div className="orders-card">
                    {loading ? (
                        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                            Đang tải danh sách đơn hàng...
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                            Không có đơn hàng nào trong mục này.
                        </div>
                    ) : (
                        <div className="orders-table-container">
                            <table className="orders-table">
                                <thead>
                                    <tr>
                                        <th>Mã Đơn</th>
                                        <th>Khách hàng</th>
                                        <th>Địa chỉ</th>
                                        <th>Ngày đặt</th>
                                        <th>SL</th>
                                        <th>Tổng tiền</th>
                                        <th>Thanh toán</th>
                                        <th>Trạng thái</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map(order => (
                                        <tr key={order.id}>
                                            <td className="order-id">#LX-{order.id}</td>
                                            <td className="customer-info">
                                                <h4>{order.fullname}</h4>
                                                <p>{order.phone}</p>
                                            </td>
                                            <td style={{ maxWidth: "220px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={order.address}>
                                                {order.address}
                                            </td>
                                            <td>
                                                {new Date(order.created_at).toLocaleDateString("vi-VN")}
                                            </td>
                                            <td style={{ textAlign: "center", fontWeight: "600" }}>
                                                {order.total_items}
                                            </td>
                                            <td style={{ fontWeight: "700", color: "#0f172a" }}>
                                                {Number(order.total_price).toLocaleString("vi-VN")}₫
                                            </td>
                                            <td style={{ textTransform: "uppercase", fontSize: "12px", fontWeight: "600" }}>
                                                {order.payment_method}
                                            </td>
                                            <td>
                                                <select
                                                    className="status-select"
                                                    value={order.order_status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                >
                                                    <option value="pending">Chờ xử lý (Pending)</option>
                                                    <option value="processing">Đang xử lý (Processing)</option>
                                                    <option value="shipping">Đang giao (Shipping)</option>
                                                    <option value="completed">Hoàn thành (Completed)</option>
                                                    <option value="cancelled">Hủy đơn (Cancelled)</option>
                                                </select>
                                            </td>
                                            <td>
                                                <button 
                                                    className="btn-view-detail"
                                                    onClick={() => handleViewDetail(order)}
                                                >
                                                    Xem chi tiết
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* ORDER DETAIL MODAL */}
                {selectedOrder && (
                    <div className="modal-overlay" onClick={closeModal}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Chi tiết đơn hàng #LX-{selectedOrder.id}</h3>
                                <button className="close-btn" onClick={closeModal}>×</button>
                            </div>

                            <div className="modal-grid">
                                <div>
                                    <p><strong>Khách hàng:</strong> {selectedOrder.fullname}</p>
                                    <p><strong>Số điện thoại:</strong> {selectedOrder.phone}</p>
                                    <p><strong>Phương thức:</strong> {selectedOrder.payment_method?.toUpperCase()}</p>
                                </div>
                                <div>
                                    <p><strong>Địa chỉ:</strong> {selectedOrder.address}</p>
                                    <p><strong>Trạng thái:</strong> <span className={`status-badge ${selectedOrder.order_status}`}>{getStatusText(selectedOrder.order_status)}</span></p>
                                    <p><strong>Ngày tạo:</strong> {new Date(selectedOrder.created_at).toLocaleString("vi-VN")}</p>
                                </div>
                            </div>

                            <h4 style={{ margin: "0 0 12px", color: "#0f172a" }}>Danh sách sản phẩm trong đơn</h4>
                            
                            {modalLoading ? (
                                <p style={{ textAlign: "center", color: "#64748b", padding: "20px" }}>Đang tải danh sách sản phẩm...</p>
                            ) : (
                                <div className="modal-item-list">
                                    {orderItems.map(item => (
                                        <div className="modal-item" key={item.id}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                <img src={`http://localhost:5000/uploads/${item.image_url}`} alt={item.name} />
                                                <div className="modal-item-info">
                                                    <h5>{item.name}</h5>
                                                    <p>
                                                        {item.color_name && `Màu: ${item.color_name}`} {item.size_name && `| Size: ${item.size_name}`} | SL: x{item.quantity}
                                                    </p>
                                                </div>
                                            </div>
                                            <div style={{ fontWeight: "700" }}>
                                                {(Number(item.price) * Number(item.quantity)).toLocaleString("vi-VN")}₫
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="modal-footer">
                                <span>Tổng tiền thanh toán</span>
                                <span style={{ color: "#2563eb" }}>{Number(selectedOrder.total_price).toLocaleString("vi-VN")}₫</span>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </AdminLayout>
    );
};

export default AdminOrders;
