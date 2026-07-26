import { useEffect, useState, useRef } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProductCard from "./components/ProductCard";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "./config/api";

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
                // Backend /api/products trả về mảng trực tiếp
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
            { threshold: 0.3 }
        );

        if (craftTextRef.current) observer.observe(craftTextRef.current);
        if (craftImageRef.current) observer.observe(craftImageRef.current);

        return () => observer.disconnect();
    }, []);

    return (
        <div className="app">
            {/* SEO Title cho trang chủ */}
            <title>Heritage Luxury — Túi Xách Cao Cấp</title>

            <Header />

            {/* ======================== HERO SECTION ======================== */}
            <section className="hero">
                <div className="hero-overlay"></div>

                <div className="hero-content">
                    <span className="hero-tag">
                        BỘ SƯU TẬP MÙA THU
                    </span>

                    <h1>
                        Chế tác Thủ công,
                        <br />
                        Phong cách Vượt thời gian
                    </h1>

                    <p>
                        Khám phá bộ sưu tập túi xách cao cấp,
                        thiết kế tối giản nhưng sang trọng,
                        dành cho những người yêu thời trang.
                    </p>

                    {/* Nút Mua Sắm — điều hướng đến /products */}
                    <Link
                        to="/products"
                        className="hero-btn"
                        style={{ display: "inline-block", textDecoration: "none" }}
                    >
                        Mua Sắm Ngay
                    </Link>
                </div>
            </section>

            

            {/* ======================== SẢN PHẨM NỔI BẬT ======================== */}
            <main className="main">

                <div className="section-title">
                    <h2>Sản Phẩm Nổi Bật</h2>
                                    </div>

                {loading && (
                    <p className="message">Đang tải sản phẩm...</p>
                )}

                {error && (
                    <p className="error">{error}</p>
                )}

                {!loading && !error && products.length === 0 && (
                    <p className="message">Không có sản phẩm.</p>
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

                {/* CTA xem thêm */}
                {!loading && products.length > 0 && (
                    <div style={{ textAlign: "center", paddingTop: "24px" }}>
                        <Link
                            to="/products"
                            style={{
                                display: "inline-block",
                                padding: "12px 32px",
                                background: "#0f172a",
                                color: "#fff",
                                borderRadius: "8px",
                                textDecoration: "none",
                                fontWeight: "600",
                                fontSize: "14px",
                                letterSpacing: "0.5px",
                            }}
                        >
                            Xem toàn bộ sản phẩm →
                        </Link>
                    </div>
                )}

            </main>

            {/* ======================== CRAFT SECTION ======================== */}
            <section className="craft-section">

                <div className="craft-text" ref={craftTextRef}>
                    <span className="craft-subtitle">LUXURY COLLECTION</span>

                    <h2>
                        Curated
                        <br />
                        <span>Craftsmanship</span>
                    </h2>

                    <p>
                        Every luxury handbag is handcrafted by skilled artisans using
                        carefully selected premium leather and exceptional attention to
                        every detail. Experience elegance that lasts a lifetime.
                    </p>

                    <button
                        className="craft-btn"
                        onClick={() => navigate("/products")}
                        style={{ cursor: "pointer" }}
                    >
                        Discover Collection
                    </button>
                </div>

                <div className="craft-image" ref={craftImageRef}>
                    <img
                        src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1200&auto=format&fit=crop"
                        alt="Luxury Bag Handcrafted"
                    />

                    <div className="craft-card">
                        <h4>Aurelia Satchel</h4>
                        <p>Italian Leather</p>
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
                        Our master craftsmen are available for private consultations.
                        Design your unique piece with materials sourced from the world's
                        most prestigious tanneries and luxury workshops.
                    </p>

                    <button
                        className="bespoke-btn"
                        onClick={() => navigate("/categories")}
                        style={{ cursor: "pointer" }}
                    >
                        BOOK A CONSULTATION →
                    </button>
                </div>

            </section>

            <Footer />
        </div>
    );
}

export default App;