import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import "../../css/admin/Settings.css";

const AdminSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        store_name: "Heritage Luxury Store",
        contact_email: "contact@luxurybag.com",
        contact_phone: "0869081120",
        address: "123 Le Loi, District 1, Ho Chi Minh City",
        maintenance_mode: false
    });

    const fetchSettings = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/admin/settings");
            const data = await res.json();
            if (data.success && data.settings) {
                setFormData({
                    store_name: data.settings.store_name || "",
                    contact_email: data.settings.contact_email || "",
                    contact_phone: data.settings.contact_phone || "",
                    address: data.settings.address || "",
                    maintenance_mode: Boolean(data.settings.maintenance_mode)
                });
            }
        } catch (err) {
            console.error("Fetch settings error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("http://localhost:5000/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok && data.success) {
                alert("✅ Lưu cấu hình trang web thành công!");
                fetchSettings();
            } else {
                alert(data.message || "Lỗi lưu cấu hình.");
            }
        } catch (err) {
            console.error("Save settings error:", err);
            alert("Lỗi kết nối server.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <AdminLayout>
            <div className="admin-settings-page">
                
                {/* HEADER */}
                <div className="settings-header">
                    <h1>Cài đặt hệ thống (Admin Settings)</h1>
                    <p>Cấu hình các thông tin cửa hàng, thông tin liên hệ và chế độ bảo trì trang web</p>
                </div>

                {/* CARD */}
                <div className="settings-card">
                    {loading ? (
                        <div style={{ textAlign: "center", color: "#64748b", padding: "20px" }}>
                            Đang tải cấu hình hệ thống...
                        </div>
                    ) : (
                        <form onSubmit={handleSave}>
                            
                            {/* STORE INFO SECTION */}
                            <h3 className="settings-section-title">🏢 Thông tin Cửa hàng</h3>
                            
                            <div className="form-group">
                                <label>Tên Cửa hàng / Website *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.store_name}
                                    onChange={e => setFormData({ ...formData, store_name: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                <div className="form-group">
                                    <label>Email Liên hệ *</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={formData.contact_email}
                                        onChange={e => setFormData({ ...formData, contact_email: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Số điện thoại Hotline *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.contact_phone}
                                        onChange={e => setFormData({ ...formData, contact_phone: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Địa chỉ cửa hàng / Showroom</label>
                                <textarea
                                    className="form-control"
                                    rows="2"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>

                            {/* SYSTEM MAINTENANCE SECTION */}
                            <h3 className="settings-section-title" style={{ marginTop: "32px" }}>⚠️ Chế độ Bảo trì Hệ thống</h3>

                            <div className="toggle-switch-container">
                                <div className="toggle-switch-info">
                                    <h4>Bật chế độ bảo trì (Maintenance Mode)</h4>
                                    <p>Khi bật, người dùng truy cập sẽ nhận được thông báo hệ thống đang nâng cấp bảo trì</p>
                                </div>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={formData.maintenance_mode}
                                        onChange={e => setFormData({ ...formData, maintenance_mode: e.target.checked })}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
                                <button type="submit" className="add-promo-btn" disabled={saving}>
                                    {saving ? "Đang lưu..." : "💾 Lưu thay đổi Cài đặt"}
                                </button>
                            </div>

                        </form>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
};

export default AdminSettings;
