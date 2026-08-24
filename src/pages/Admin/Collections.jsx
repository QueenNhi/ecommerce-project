import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { API_URL, getAuthHeaders } from "../../config/api";
import "../../css/admin/Collections.css";

const Collections = () => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        status: "active"
    });

    const fetchCollections = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/collections`, {
                headers: getAuthHeaders()
            });
            const data = await res.json();
            if (data.success && Array.isArray(data.collections)) {
                setCollections(data.collections);
            }
        } catch (err) {
            console.error("Fetch collections error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCollections();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!formData.name || formData.name.trim() === "") {
            alert("Vui lòng nhập tên bộ sưu tập.");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/admin/collections`, {
                method: "POST",
                headers: getAuthHeaders({ "Content-Type": "application/json" }),
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (res.ok && data.success) {
                alert("🎉 " + data.message);
                setShowModal(false);
                setFormData({ name: "", description: "", status: "active" });
                fetchCollections();
            } else {
                alert(data.message || "Lỗi tạo bộ sưu tập.");
            }
        } catch (err) {
            console.error("Create collection error:", err);
            alert("Lỗi kết nối server.");
        }
    };

    return (
        <AdminLayout>
            <div className="admin-collections-page">
                
                {/* HEADER */}
                <div className="collections-header">
                    <div>
                        <h1>Quản lý Bộ sưu tập (Product Collections)</h1>
                        <p>Gom nhóm các sản phẩm túi xách theo mùa hoặc chủ đề khuyến mãi đặc biệt</p>
                    </div>
                    <button className="add-promo-btn" onClick={() => setShowModal(true)}>
                        + Thêm Bộ sưu tập mới
                    </button>
                </div>

                {/* GRID */}
                {loading ? (
                    <div style={{ textAlign: "center", color: "#64748b", padding: "40px" }}>
                        Đang tải danh sách bộ sưu tập...
                    </div>
                ) : collections.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#64748b", padding: "40px" }}>
                        Chưa có bộ sưu tập nào.
                    </div>
                ) : (
                    <div className="collections-grid">
                        {collections.map(col => (
                            <div key={col.id} className="collection-card">
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                        <h3>{col.name}</h3>
                                        <span className={`status-badge ${col.status === "active" ? "active" : "blocked"}`}>
                                            {col.status === "active" ? "ĐANG MỞ" : "TẠM DỪNG"}
                                        </span>
                                    </div>
                                    <p>{col.description || "Chưa có mô tả cho bộ sưu tập này."}</p>
                                </div>
                                <div style={{ fontSize: "12px", color: "#94a3b8", borderTop: "1px solid #f1f5f9", paddingTop: "12px" }}>
                                    Ngày tạo: {col.created_at ? new Date(col.created_at).toLocaleDateString("vi-VN") : "N/A"}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ADD MODAL */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="promo-modal-card" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Thêm Bộ sưu tập mới</h3>
                                <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
                            </div>

                            <form onSubmit={handleCreate}>
                                <div className="form-group">
                                    <label>Tên Bộ sưu tập *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ví dụ: Summer Luxury 2026, Winter Collection..."
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Mô tả ngắn</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Giới thiệu về đợt bộ sưu tập túi xách này..."
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Trạng thái</label>
                                    <select
                                        className="form-control"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="active">Active (Đang hiển thị)</option>
                                        <option value="inactive">Inactive (Tạm ẩn)</option>
                                    </select>
                                </div>

                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                                    <button type="submit" className="btn-primary">Tạo ngay</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </AdminLayout>
    );
};

export default Collections;
