import { useEffect, useState, useRef } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProductCard from "./components/ProductCard";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "./config/api";
import {
    FiTruck,
    FiShield,
    FiGift,
    FiAward,
    FiArrowRight,
    FiChevronRight
} from "react-icons/fi";

import "./App.css";

// High-fashion fallback category photography
const CATEGORY_IMAGES = [
    "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=800&auto=format&fit=crop",
];

function App() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [categories, setCategories] = useState([]);

    // Refs cho scroll animation
    const craftTextRef = useRef(null);
    const craftImageRef = useRef(null);

    // Lấy sản phẩm nổi bật (giới hạn 8 sp)
    useEffect(() => {
        fetch(`${API_URL}/api/products`)
            .then((res) => {
                if (!res.ok) throw new Error("Không thể kết nối tới server");
                return res.json();
            })
            .then((data) => {
                const list = Array.isArray(data) ? data : (data?.products || []);
                setProducts(list.slice(0, 8)); // Chỉ hiện 8 SP nổi bật ở trang chủ
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    // Lấy danh mục
    useEffect(() => {
        fetch(`${API_URL}/api/categories`)
            .then((res) => {
                if (!res.ok) throw new Error("Không thể lấy danh mục");
                return res.json();
            })
            .then((data) => {
                const list = Array.isArray(data) ? data : (data?.categories || []);
                setCategories(list);
            })
            .catch((err) => console.error(err));
    }, []);

    // Animation khi scroll tới Craft Section
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("show");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.2 }
        );

        if (craftTextRef.current) observer.observe(craftTextRef.current);
        if (craftImageRef.current) observer.observe(craftImageRef.current);

        return () => observer.disconnect();
    }, []);

    return (
        <div className="app luxury-home">
            {/* SEO Title cho trang chủ */}
            <title>Heritage Luxury — Túi Xách Cao Cấp</title>

            <Header />

            {/* ======================== HERO SECTION ======================== */}
            <section className="hero">
                <div className="hero-overlay"></div>

                <div className="hero-content">
                   
                    <h1>
                        Chế tác Thủ công,
                        <br />
                        <span className="serif-title">Phong cách Vượt thời gian</span>
                    </h1>

                    <p className="hero-description">
                        Khám phá bộ sưu tập túi xách cao cấp hàng đầu,
                        kết hợp giữa kỹ nghệ may thủ công Ý và ngôn ngữ thiết kế tối giản xa xỉ.
                    </p>

                    <div className="hero-actions">
                        <Link to="/products" className="hero-btn primary-btn">
                            Khám Phá Bộ Sưu Tập <FiArrowRight className="btn-icon" />
                        </Link>
                        <Link to="/categories" className="hero-btn outline-btn">
                            Đặt Lịch Tư Vấn Cá Nhân
                        </Link>
                    </div>

                    <div className="hero-trust-row">
                        <span className="trust-item">✓ 100% Da Thật Ý</span>
                        <span className="trust-item">• Miễn Phí Vận Chuyển</span>
                        <span className="trust-item">• Hộp Quà Luxury</span>
                    </div>
                </div>

                <div className="hero-scroll-indicator">
                    <span>SCROLL DOWN</span>
                    <div className="scroll-line"></div>
                </div>
            </section>

            {/* ======================== LUXURY FEATURE TICKER BAR ======================== */}
            <div className="luxury-ticker-bar">
                <div className="ticker-item">
                    <FiTruck className="ticker-icon" />
                    <div>
                        <strong>Giao Hàng Hỏa Tốc</strong>
                        <span>Complimentary Express Shipping</span>
                    </div>
                </div>
                <div className="ticker-item">
                    <FiShield className="ticker-icon" />
                    <div>
                        <strong>100% Da Thật Ý</strong>
                        <span>Certified Authentic Leather</span>
                    </div>
                </div>
                <div className="ticker-item">
                    <FiGift className="ticker-icon" />
                    <div>
                        <strong>Hộp Quà Sang Trọng</strong>
                        <span>Signature Dustbag & Box</span>
                    </div>
                </div>
                <div className="ticker-item">
                    <FiAward className="ticker-icon" />
                    <div>
                        <strong>Dịch Vụ Bespoke</strong>
                        <span>Private Customization</span>
                    </div>
                </div>
            </div>

            {/* ======================== FEATURED CATEGORIES SHOWCASE ======================== */}
            {categories.length > 0 && (
                <section className="home-categories-section">
                    <div className="section-header center">
                        <span className="section-subtitle">CURATED COLLECTIONS</span>
                        <h2>Danh Mục Nổi Bật</h2>
                        <p>Tuyển chọn những dòng túi xách tinh tế nhất dành riêng cho bạn</p>
                    </div>

                    <div className="categories-grid">
                        {categories.slice(0, 4).map((cat, idx) => (
                            <Link
                                to={`/categories/${cat.id}`}
                                key={cat.id}
                                className="category-card"
                            >
                                <div className="cat-img-box">
                                    <img
                                        src={CATEGORY_IMAGES[idx % CATEGORY_IMAGES.length]}
                                        alt={cat.name}
                                    />
                                    <div className="cat-overlay"></div>
                                </div>
                                <div className="cat-info">
                                    <h3>{cat.name}</h3>
                                    <span className="cat-count">
                                        {cat.total_products || 0} sản phẩm <FiChevronRight />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* ======================== SẢN PHẨM NỔI BẬT ======================== */}
            <main className="main home-products-section">
                <div className="section-header">
                    <div>
                        <span className="section-subtitle">EXCLUSIVELY SELECTION</span>
                        <h2>Sản Phẩm Nổi Bật</h2>
                    </div>
                    <Link to="/products" className="view-all-link">
                        Xem toàn bộ <FiArrowRight />
                    </Link>
                </div>

                {loading && (
                    <div className="home-loading-box">
                        <div className="home-spinner"></div>
                        <p>Đang tải bộ sưu tập nổi bật...</p>
                    </div>
                )}

                {error && (
                    <div className="home-error-box">
                        <p>⚠️ {error}</p>
                    </div>
                )}

                {!loading && !error && products.length === 0 && (
                    <div className="home-empty-box">
                        <p>Chưa có sản phẩm nổi bật nào.</p>
                    </div>
                )}

                {!loading && !error && products.length > 0 && (
                    <div className="product-grid">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                            />
                        ))}
                    </div>
                )}

                {!loading && products.length > 0 && (
                    <div className="home-cta-box">
                        <Link to="/products" className="home-cta-btn">
                            Khám phá toàn bộ bộ sưu tập mới <FiArrowRight />
                        </Link>
                    </div>
                )}
            </main>

            {/* ======================== CRAFT SECTION ======================== */}
            <section className="craft-section">
                <div className="craft-text" ref={craftTextRef}>
                    <span className="craft-subtitle">HERITAGE CRAFTSMANSHIP</span>

                    <h2>
                        Curated
                        <br />
                        <span>Craftsmanship</span>
                    </h2>

                    <p>
                        Mỗi chiếc túi xách Heritage là một tác phẩm nghệ thuật độc bản,
                        được chế tác thủ công bởi các nghệ nhân Ý giàu kinh nghiệm. Từ từng đường kim mũi chỉ
                        đến chất liệu da thuộc cao cấp nhất, chúng tôi cam kết mang lại vẻ đẹp bền vững vượt thời gian.
                    </p>

                    <button
                        className="craft-btn"
                        onClick={() => navigate("/products")}
                    >
                        Khám Phá Di Sản <FiArrowRight className="inline-icon" />
                    </button>
                </div>

                <div className="craft-image" ref={craftImageRef}>
                    <img
                        src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1200&auto=format&fit=crop"
                        alt="Luxury Bag Handcrafted"
                    />

                    <div className="craft-card">
                        <h4>Aurelia Satchel</h4>
                        <p>Italian Calfskin Leather</p>
                    </div>
                </div>
            </section>

            {/* ======================== BESPOKE SECTION ======================== */}
            <section className="bespoke-section">
                <div className="bespoke-gallery">
                    <div className="material-card material-1">
                        <img
                            src="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1200&auto=format&fit=crop"
                            alt="Luxury Leather Material"
                        />
                    </div>
                    <div className="material-card material-2">
                        <img
                            src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1200&auto=format&fit=crop"
                            alt="Luxury Bag Detail"
                        />
                    </div>
                </div>

                <div className="bespoke-content">
                    <span className="bespoke-tag">BESPOKE SERVICE</span>

                    <h2>
                        Bespoke
                        <br />
                        <span>Excellence</span>
                    </h2>

                    <p>
                        Dịch vụ tư vấn cá nhân hóa cao cấp. Đặt hẹn cùng các chuyên gia hàng đầu
                        để tạo nên chiếc túi xách độc bản theo đúng gu thẩm mỹ và phong cách cá nhân của quý khách.
                    </p>

                    <button
                        className="bespoke-btn"
                        onClick={() => navigate("/categories")}
                    >
                        ĐẶT LỊCH TƯ VẤN CÁ NHÂN →
                    </button>
                </div>
            </section>

            {/* ======================== BRAND VALUES SECTION ======================== */}
            <section className="brand-values-section">
                <div className="section-header center">
                    <span className="section-subtitle">THE HERITAGE GUARANTEE</span>
                    <h2>Giá Trị Thương Hiệu</h2>
                    <p>Những nguyên tắc cam kết tạo nên vị thế thời trang xa xỉ đẳng cấp</p>
                </div>

                <div className="values-grid">
                    <div className="value-card">
                        <div className="value-icon">💎</div>
                        <h4>Chất Liệu Tuyển Chọn</h4>
                        <p>100% da thật nhập khẩu trực tiếp từ các xưởng thuộc da lâu đời tại Florence & Milan.</p>
                    </div>
                    <div className="value-card">
                        <div className="value-icon">✨</div>
                        <h4>May Thủ Công Tỉ Mỉ</h4>
                        <p>Mỗi sản phẩm trải qua hơn 40 giờ chế tác chi tiết bởi các nghệ nhân lành nghề.</p>
                    </div>
                    <div className="value-card">
                        <div className="value-icon">🔒</div>
                        <h4>Bảo Hành Trọn Đời</h4>
                        <p>Cam kết bảo dưỡng da, thay phụ kiện kim loại và spa túi xách định kỳ miễn phí.</p>
                    </div>
                    <div className="value-card">
                        <div className="value-icon">🏆</div>
                        <h4>Độc Quyền & Giới Hạn</h4>
                        <p>Mỗi bộ sưu tập phát hành số lượng có hạn với mã số chứng thực độc bản.</p>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

export default App;