import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../../../layouts/AdminLayout";
import BrandModal from "./BrandModal";
import DeleteBrandModal from "./DeleteBrandModal";
import { API_URL, UPLOADS_URL, getAuthHeaders } from "../../../config/api";
import "../../../css/admin/Brands.css";

const Brands = () => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [showDelete, setShowDelete] = useState(false);

    const getBrands = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/admin/brands`, {
                headers: getAuthHeaders()
            });
            // Backend trả về { success: true, brands: [...] }
            if (res.data?.success && Array.isArray(res.data?.brands)) {
                setBrands(res.data.brands);
            } else if (Array.isArray(res.data)) {
                // Fallback nếu API trả về mảng trực tiếp
                setBrands(res.data);
            } else {
                console.warn("Unexpected brands response format:", res.data);
                setBrands([]);
            }
        } catch (error) {
            console.error("Fetch brands error:", error);
            setBrands([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getBrands();
    }, []);

    // ADD + EDIT HANDLERS
    const handleEdit = (brand) => {
        setSelectedBrand(brand);
        setShowModal(true);
    };

    const handleAdd = () => {
        setSelectedBrand(null);
        setShowModal(true);
    };

    // DELETE HANDLER
    const handleDelete = (brand) => {
        setSelectedBrand(brand);
        setShowDelete(true);
    };

    // Live search filter
    const filteredBrands = brands.filter((brand) =>
        brand.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="admin-brands-page">

                {/* HEADER */}
                <div className="brands-header">
                    <div>
                        <h1>Quản lý Thương hiệu (Brands)</h1>
                        <p>Quản lý các nhãn hiệu thời trang xa xỉ trong hệ thống</p>
                    </div>
                    <button className="add-brand-btn" onClick={handleAdd}>
                        + Thêm thương hiệu
                    </button>
                </div>

                {/* SEARCH & FILTER BAR */}
                <div className="brands-action-bar">
                    <input
                        type="text"
                        className="brand-search-input"
                        placeholder="🔍 Tìm kiếm thương hiệu..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div style={{ fontSize: "13px", color: "#64748b" }}>
                        Hiển thị <strong>{filteredBrands.length}</strong> / {brands.length} thương hiệu
                    </div>
                </div>

                {/* BRANDS TABLE CARD */}
                <div className="brands-card">
                    {loading ? (
                        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                            Đang tải danh sách thương hiệu...
                        </div>
                    ) : filteredBrands.length === 0 ? (
                        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                            Không tìm thấy thương hiệu nào.
                        </div>
                    ) : (
                        <div className="brands-table-container">
                            <table className="brands-table">
                                <thead>
                                    <tr>
                                        <th>Mã TH</th>
                                        <th>Logo</th>
                                        <th>Tên thương hiệu</th>
                                        <th>Số sản phẩm</th>
                                        <th>Ngày khởi tạo</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBrands.map((brand) => (
                                        <tr key={brand.id}>
                                            <td className="brand-id">#BR-{brand.id}</td>
                                            <td>
                                                {brand.logo ? (
                                                    <img
                                                        src={`${UPLOADS_URL}/${brand.logo}`}
                                                        alt={brand.name}
                                                        className="brand-logo-img"
                                                    />
                                                ) : (
                                                    <div className="no-logo-placeholder">No Logo</div>
                                                )}
                                            </td>
                                            <td style={{ fontWeight: "600", color: "#0f172a" }}>
                                                {brand.name}
                                            </td>
                                            <td>
                                                <span className="count-badge">
                                                    {brand.product_count || 0} sản phẩm
                                                </span>
                                            </td>
                                            <td>
                                                {brand.created_at
                                                    ? new Date(brand.created_at).toLocaleDateString("vi-VN")
                                                    : "N/A"}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => handleEdit(brand)}
                                                >
                                                    Chỉnh sửa
                                                </button>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleDelete(brand)}
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

                {/* ADD/EDIT MODAL */}
                {showModal && (
                    <BrandModal
                        brand={selectedBrand}
                        close={() => setShowModal(false)}
                        reload={getBrands}
                    />
                )}

                {/* DELETE CONFIRM MODAL */}
                {showDelete && (
                    <DeleteBrandModal
                        brand={selectedBrand}
                        close={() => setShowDelete(false)}
                        reload={getBrands}
                    />
                )}

            </div>
        </AdminLayout>
    );
};

export default Brands;