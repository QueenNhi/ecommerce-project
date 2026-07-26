import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { API_URL } from "../../config/api";
import "../../css/Brands.css";

// SVG placeholder nội tuyến — không phụ thuộc dịch vụ bên ngoài
const BRAND_FALLBACK_SVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><rect width='80' height='80' rx='12' fill='%23f1f5f9'/><text x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-size='11' font-family='sans-serif' fill='%2394a3b8'>No Logo</text></svg>`;

const BrandsPage = () => {
    const navigate = useNavigate();
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBrands = async () => {
        try {
            const res = await fetch(`${API_URL}/api/brands`);
            const data = await res.json();
            if (data?.success && Array.isArray(data?.brands)) {
                setBrands(data.brands);
            } else if (Array.isArray(data)) {
                setBrands(data);
            }
        } catch (err) {
            console.error("Fetch brands error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    // Xử lý lỗi ảnh: dùng SVG nội tuyến thay vì gọi dịch vụ bên ngoài
    const handleImgError = (e) => {
        // Chỉ set fallback 1 lần để tránh vòng lặp nếu SVG cũng lỗi
        if (e.target.src !== BRAND_FALLBACK_SVG) {
            e.target.src = BRAND_FALLBACK_SVG;
        }
    };

    return (
        <div className="brands-page">
            <Header />

            {/* BANNER */}
            <div className="brands-banner">
                <h1>Thương Hiệu Thời Trang Cao Cấp</h1>
                <p>Đối tác chính hãng từ các nhà mốt xa xỉ danh tiếng hàng đầu thế giới</p>
            </div>

            {/* CONTAINER */}
            <div className="brands-container">
                {loading ? (
                    <div style={{ textAlign: "center", color: "#64748b", padding: "60px" }}>
                        Đang tải danh sách thương hiệu...
                    </div>
                ) : brands.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#64748b", padding: "60px" }}>
                        Chưa có thương hiệu nào.
                    </div>
                ) : (
                    <div className="brands-grid">
                        {brands.map(brand => (
                            <div
                                key={brand.id}
                                className="brand-card"
                                onClick={() => navigate(`/products?brand=${brand.id}`)}
                            >
                                {brand.logo ? (
                                    <img
                                        src={`${API_URL}/uploads/${brand.logo}`}
                                        alt={brand.name}
                                        className="brand-logo-img"
                                        onError={handleImgError}
                                    />
                                ) : (
                                    <div className="brand-logo-placeholder">
                                        <span>{brand.name?.charAt(0)?.toUpperCase() || "B"}</span>
                                    </div>
                                )}
                                <h3>{brand.name}</h3>
                                <p>{brand.description || "Thương hiệu sản xuất túi xách xa xỉ cao cấp."}</p>
                                <button className="copy-btn" style={{ width: "100%" }}>
                                    Xem sản phẩm ({brand.product_count || 0}) →
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default BrandsPage;
