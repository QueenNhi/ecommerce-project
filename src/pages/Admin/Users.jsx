import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import "../../css/admin/Customers.css";

const AdminCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const fetchCustomers = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/admin/customers");
            const data = await res.json();
            if (data.success && Array.isArray(data.customers)) {
                setCustomers(data.customers);
            }
        } catch (err) {
            console.error("Fetch customers error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleToggleStatus = async (customer) => {
        const newStatus = customer.status === "active" ? "blocked" : "active";

        try {
            const res = await fetch(`http://localhost:5000/api/admin/customers/${customer.id}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                alert(`✅ ${data.message}`);
                fetchCustomers();
            } else {
                alert(data.message || "Lỗi cập nhật trạng thái.");
            }
        } catch (err) {
            console.error("Toggle status error:", err);
            alert("Lỗi kết nối server.");
        }
    };

    const handleDeleteCustomer = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/admin/customers/${id}`, {
                method: "DELETE"
            });
            const data = await res.json();
            if (res.ok && data.success) {
                alert("🗑️ Xóa tài khoản khách hàng thành công!");
                setDeleteModalOpen(false);
                setSelectedCustomer(null);
                fetchCustomers();
            } else {
                alert(data.message || "Lỗi xóa tài khoản.");
            }
        } catch (err) {
            console.error("Delete customer error:", err);
            alert("Lỗi kết nối server.");
        }
    };

    const filteredCustomers = customers.filter(c => {
        const q = searchQuery.toLowerCase().trim();
        return (
            (c.fullname && c.fullname.toLowerCase().includes(q)) ||
            (c.email && c.email.toLowerCase().includes(q)) ||
            (c.phone && c.phone.includes(q))
        );
    });

    return (
        <AdminLayout>
            <div className="admin-customers-page">
                
                {/* HEADER */}
                <div className="customers-header">
                    <div>
                        <h1>Quản lý Khách hàng (Customers)</h1>
                        <p>Theo dõi danh sách khách hàng, thống kê số đơn hàng và tổng tiền chi tiêu</p>
                    </div>

                    <div className="customers-search-bar">
                        🔍
                        <input
                            type="text"
                            placeholder="Tìm theo tên, email, sđt..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* TABLE CARD */}
                <div className="customers-card">
                    {loading ? (
                        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                            Đang tải danh sách khách hàng...
                        </div>
                    ) : filteredCustomers.length === 0 ? (
                        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                            Không tìm thấy khách hàng phù hợp.
                        </div>
                    ) : (
                        <div className="customers-table-container">
                            <table className="customers-table">
                                <thead>
                                    <tr>
                                        <th>Mã KH</th>
                                        <th>Khách hàng</th>
                                        <th>Email</th>
                                        <th>Số điện thoại</th>
                                        <th>Ngày đăng ký</th>
                                        <th>Số đơn đã đặt</th>
                                        <th>Tổng chi tiêu</th>
                                        <th>Trạng thái</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCustomers.map(cust => (
                                        <tr key={cust.id}>
                                            <td style={{ fontWeight: "700", color: "#2563eb" }}>#CUST-{cust.id}</td>
                                            <td>
                                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                    <div className="customer-avatar-placeholder">
                                                        {cust.fullname ? cust.fullname.charAt(0) : "U"}
                                                    </div>
                                                    <span style={{ fontWeight: "600" }}>{cust.fullname || "Khách hàng"}</span>
                                                </div>
                                            </td>
                                            <td>{cust.email}</td>
                                            <td>{cust.phone || "Chưa cập nhật"}</td>
                                            <td>
                                                {cust.created_at ? new Date(cust.created_at).toLocaleDateString("vi-VN") : "N/A"}
                                            </td>
                                            <td style={{ fontWeight: "700", textAlign: "center" }}>
                                                {cust.total_orders} đơn
                                            </td>
                                            <td style={{ fontWeight: "700", color: "#16a34a" }}>
                                                {Number(cust.total_spent).toLocaleString("vi-VN")}₫
                                            </td>
                                            <td>
                                                <span className={`status-badge ${cust.status === "blocked" ? "blocked" : "active"}`}>
                                                    {cust.status === "blocked" ? "ĐÃ KHÓA" : "HOẠT ĐỘNG"}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn-edit"
                                                    style={{ backgroundColor: cust.status === "blocked" ? "#16a34a" : "#f59e0b", color: "#fff" }}
                                                    onClick={() => handleToggleStatus(cust)}
                                                >
                                                    {cust.status === "blocked" ? "Mở khóa" : "Khóa TK"}
                                                </button>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => { setSelectedCustomer(cust); setDeleteModalOpen(true); }}
                                                >
                                                    Xóa
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* DELETE MODAL */}
                {deleteModalOpen && selectedCustomer && (
                    <div className="modal-overlay" onClick={() => setDeleteModalOpen(false)}>
                        <div className="promo-modal-card" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Xóa tài khoản khách hàng</h3>
                                <button className="close-btn" onClick={() => setDeleteModalOpen(false)}>×</button>
                            </div>
                            <p style={{ padding: "10px 0" }}>
                                Bạn có chắc chắn muốn xóa tài khoản <strong>"{selectedCustomer.fullname}" ({selectedCustomer.email})</strong> không? Hành động này không thể hoàn tác!
                            </p>
                            <div className="modal-actions">
                                <button className="btn-secondary" onClick={() => setDeleteModalOpen(false)}>Hủy</button>
                                <button className="btn-danger" onClick={() => handleDeleteCustomer(selectedCustomer.id)}>Xóa vĩnh viễn</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </AdminLayout>
    );
};

export default AdminCustomers;
