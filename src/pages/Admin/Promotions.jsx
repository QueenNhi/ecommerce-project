import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import "../../css/admin/Promotions.css";

const Promotions = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [selectedPromo, setSelectedPromo] = useState(null);
    const [formData, setFormData] = useState({
        code: "",
        discount_percent: 10,
        min_order_amount: 1000000,
        expiration_date: "",
        status: "active"
    });

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const fetchPromotions = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/admin/promotions");
            const data = await res.json();
            if (data.success && Array.isArray(data.promotions)) {
                setPromotions(data.promotions);
            }
        } catch (err) {
            console.error("Fetch promotions error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    const handleOpenAdd = () => {
        setSelectedPromo(null);
        setFormData({
            code: "",
            discount_percent: 10,
            min_order_amount: 1000000,
            expiration_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            status: "active"
        });
        setShowModal(true);
    };

    const handleOpenEdit = (promo) => {
        setSelectedPromo(promo);
        setFormData({
            code: promo.code,
            discount_percent: promo.discount_percent || 0,
            min_order_amount: promo.min_order_amount || 0,
            expiration_date: promo.expiration_date ? new Date(promo.expiration_date).toISOString().split("T")[0] : "",
            status: promo.status || "active"
        });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.code || formData.code.trim() === "") {
            alert("Vui lòng nhập mã khuyến mãi.");
            return;
        }

        try {
            let res;
            if (selectedPromo) {
                res = await fetch(`http://localhost:5000/api/admin/promotions/${selectedPromo.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData)
                });
            } else {
                res = await fetch("http://localhost:5000/api/admin/promotions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData)
                });
            }

            const data = await res.json();
            if (res.ok && data.success) {
                alert(`✅ ${data.message}`);
                setShowModal(false);
                fetchPromotions();
            } else {
                alert(data.message || "Lỗi lưu mã khuyến mãi.");
            }
        } catch (err) {
            console.error("Save promo error:", err);
            alert("Lỗi kết nối server.");
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/admin/promotions/${id}`, {
                method: "DELETE"
            });
            const data = await res.json();
            if (res.ok && data.success) {
                alert("🗑️ Xóa mã khuyến mãi thành công!");
                setDeleteModalOpen(false);
                setSelectedPromo(null);
                fetchPromotions();
            } else {
                alert(data.message || "Lỗi xóa khuyến mãi.");
            }
        } catch (err) {
            console.error("Delete promo error:", err);
            alert("Lỗi kết nối server.");
        }
    };

    return (
        <AdminLayout>
            <div className="admin-promotions-page">
                
                {/* HEADER */}
                <div className="promotions-header">
                    <div>
                        <h1>Quản lý Khuyến mãi & Mã giảm giá</h1>
                        <p>Tạo và quản lý các chương trình ưu đãi tri ân khách hàng</p>
                    </div>
                    <button className="add-promo-btn" onClick={handleOpenAdd}>
                        + Thêm mã khuyến mãi
                    </button>
                </div>

                {/* TABLE CARD */}
                <div className="promotions-card">
                    {loading ? (
                        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                            Đang tải danh sách mã khuyến mãi...
                        </div>
                    ) : promotions.length === 0 ? (
                        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                            Chưa có mã khuyến mãi nào.
                        </div>
                    ) : (
                        <div className="promotions-table-container">
                            <table className="promotions-table">
                                <thead>
                                    <tr>
                                        <th>Mã Khuyến mãi</th>
                                        <th>Mức giảm</th>
                                        <th>Đơn hàng tối thiểu</th>
                                        <th>Ngày hết hạn</th>
                                        <th>Trạng thái</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {promotions.map(promo => (
                                        <tr key={promo.id}>
                                            <td>
                                                <span className="code-badge">{promo.code}</span>
                                            </td>
                                            <td style={{ fontWeight: "700", color: "#16a34a" }}>
                                                {promo.discount_percent > 0 ? `Giảm ${promo.discount_percent}%` : `${Number(promo.discount_amount).toLocaleString("vi-VN")}₫`}
                                            </td>
                                            <td>
                                                {Number(promo.min_order_amount).toLocaleString("vi-VN")}₫
                                            </td>
                                            <td>
                                                {promo.expiration_date ? new Date(promo.expiration_date).toLocaleDateString("vi-VN") : "Không thời hạn"}
                                            </td>
                                            <td>
                                                <span className={`status-badge ${promo.status}`}>
                                                    {promo.status === "active" ? "ĐANG HẠN" : "HẾT HẠN"}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="btn-edit" onClick={() => handleOpenEdit(promo)}>
                                                    Sửa
                                                </button>
                                                <button className="btn-delete" onClick={() => { setSelectedPromo(promo); setDeleteModalOpen(true); }}>
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

                {/* ADD/EDIT MODAL */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="promo-modal-card" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>{selectedPromo ? "Chỉnh sửa mã khuyến mãi" : "Thêm mã khuyến mãi mới"}</h3>
                                <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
                            </div>

                            <form onSubmit={handleSave}>
                                <div className="form-group">
                                    <label>Mã Voucher / Coupon *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        placeholder="Ví dụ: LUXURY20, SUMMER10..."
                                        required
                                    />
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                    <div className="form-group">
                                        <label>Phần trăm giảm (%)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={formData.discount_percent}
                                            onChange={e => setFormData({ ...formData, discount_percent: e.target.value })}
                                            min="0"
                                            max="100"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Đơn tối thiểu (₫)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={formData.min_order_amount}
                                            onChange={e => setFormData({ ...formData, min_order_amount: e.target.value })}
                                            min="0"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Ngày hết hạn</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={formData.expiration_date}
                                        onChange={e => setFormData({ ...formData, expiration_date: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Trạng thái</label>
                                    <select
                                        className="form-control"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="active">Active (Đang áp dụng)</option>
                                        <option value="expired">Expired (Hết hạn)</option>
                                    </select>
                                </div>

                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                                    <button type="submit" className="btn-primary">Lưu mã</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* DELETE MODAL */}
                {deleteModalOpen && selectedPromo && (
                    <div className="modal-overlay" onClick={() => setDeleteModalOpen(false)}>
                        <div className="promo-modal-card" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Xóa mã khuyến mãi</h3>
                                <button className="close-btn" onClick={() => setDeleteModalOpen(false)}>×</button>
                            </div>
                            <p style={{ padding: "10px 0" }}>Bạn có chắc chắn muốn xóa mã <strong>"{selectedPromo.code}"</strong> không?</p>
                            <div className="modal-actions">
                                <button className="btn-secondary" onClick={() => setDeleteModalOpen(false)}>Hủy</button>
                                <button className="btn-danger" onClick={() => handleDelete(selectedPromo.id)}>Xóa ngay</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </AdminLayout>
    );
};

export default Promotions;
