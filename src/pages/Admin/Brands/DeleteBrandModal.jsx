import { useState } from "react";
import axios from "axios";
import { API_URL, getAuthHeaders } from "../../../config/api";
import "../../../css/admin/Brands.css";

const DeleteBrandModal = ({ brand, close, reload }) => {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const handleDelete = async () => {
        setLoading(true);
        setErrorMsg("");
        setSuccessMsg("");
        try {
            const res = await axios.delete(`${API_URL}/api/admin/brands/${brand.id}`, {
                headers: getAuthHeaders()
            });
            if (res.data.success) {
                setSuccessMsg("🗑️ Xóa thương hiệu thành công!");
                reload();
                setTimeout(() => close(), 800);
            }
        } catch (error) {
            console.error("Delete brand error:", error);
            const msg = error.response?.data?.message || "Không thể xóa thương hiệu này.";
            setErrorMsg(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={close}>
            <div className="brand-modal-card" onClick={(e) => e.stopPropagation()}>
                
                <div className="brand-modal-header">
                    <h3>Xác nhận xóa thương hiệu</h3>
                    <button className="close-btn" onClick={close}>×</button>
                </div>

                <div style={{ padding: "10px 0" }}>
                    {errorMsg && (
                        <div style={{ padding: "12px 14px", backgroundColor: "#fee2e2", color: "#dc2626", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
                            ⚠️ {errorMsg}
                        </div>
                    )}
                    {successMsg && (
                        <div style={{ padding: "12px 14px", backgroundColor: "#d1fae5", color: "#065f46", borderRadius: "8px", fontSize: "13px", marginBottom: "16px", fontWeight: "600" }}>
                            {successMsg}
                        </div>
                    )}
                    <p style={{ color: "#334155", fontSize: "14px", margin: "0 0 8px" }}>
                        Bạn có chắc chắn muốn xóa thương hiệu <strong>"{brand?.name}"</strong> không?
                    </p>
                    <p style={{ color: "#94a3b8", fontSize: "12px", margin: 0 }}>
                        Hành động này không thể hoàn tác.
                    </p>
                </div>

                <div className="modal-actions">
                    <button type="button" className="btn-secondary" onClick={close} disabled={loading}>
                        Hủy
                    </button>
                    <button type="button" className="btn-danger" onClick={handleDelete} disabled={loading}>
                        {loading ? "Đang xóa..." : "Xóa vĩnh viễn"}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default DeleteBrandModal;