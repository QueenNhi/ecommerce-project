import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL, UPLOADS_URL } from "../../../config/api";
import "../../../css/admin/Brands.css";

const BrandModal = ({ brand, close, reload }) => {
    const [name, setName] = useState("");
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => {
        if (brand) {
            setName(brand.name || "");
            if (brand.logo) {
                setLogoPreview(`${UPLOADS_URL}/${brand.logo}`);
            }
        }
    }, [brand]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        if (!name || name.trim() === "") {
            setErrorMsg("Vui lòng nhập tên thương hiệu.");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("name", name.trim());
            if (logoFile) {
                formData.append("logo", logoFile);
            }

            if (brand) {
                await axios.put(
                    `${API_URL}/api/admin/brands/${brand.id}`,
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );
                setSuccessMsg("✅ Cập nhật thương hiệu thành công!");
            } else {
                await axios.post(
                    `${API_URL}/api/admin/brands`,
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );
                setSuccessMsg("🎉 Thêm thương hiệu mới thành công!");
            }

            reload();
            // Đóng modal sau 800ms để user thấy thông báo
            setTimeout(() => close(), 800);
        } catch (error) {
            console.error("Save brand error:", error);
            const msg = error.response?.data?.message || "Có lỗi xảy ra khi lưu thương hiệu.";
            setErrorMsg(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={close}>
            <div className="brand-modal-card" onClick={(e) => e.stopPropagation()}>

                <div className="brand-modal-header">
                    <h3>{brand ? "Chỉnh sửa Thương hiệu" : "Thêm Thương hiệu Mới"}</h3>
                    <button className="close-btn" onClick={close}>×</button>
                </div>

                <form onSubmit={handleSubmit}>

                    {errorMsg && (
                        <div style={{ padding: "10px 14px", backgroundColor: "#fee2e2", color: "#dc2626", borderRadius: "8px", fontSize: "13px", marginBottom: "16px", fontWeight: "600" }}>
                            ⚠️ {errorMsg}
                        </div>
                    )}

                    {successMsg && (
                        <div style={{ padding: "10px 14px", backgroundColor: "#d1fae5", color: "#065f46", borderRadius: "8px", fontSize: "13px", marginBottom: "16px", fontWeight: "600" }}>
                            {successMsg}
                        </div>
                    )}

                    <div className="form-group">
                        <label>Tên thương hiệu *</label>
                        <input
                            type="text"
                            className="form-control"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ví dụ: Chanel, Gucci, Dior..."
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Logo thương hiệu (Hình ảnh)</label>
                        <input
                            type="file"
                            className="form-control"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        {logoPreview && (
                            <div className="logo-preview-container">
                                <span style={{ fontSize: "12px", color: "#64748b" }}>Xem trước logo:</span>
                                <img src={logoPreview} alt="Logo preview" className="logo-preview-img" />
                            </div>
                        )}
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={close} disabled={loading}>
                            Hủy bỏ
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? "Đang lưu..." : (brand ? "Lưu thay đổi" : "Tạo thương hiệu")}
                        </button>
                    </div>

                </form>

            </div>
        </div>
    );
};

export default BrandModal;