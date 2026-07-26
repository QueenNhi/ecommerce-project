import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";

import "../../css/pages/ProductDetail.css";

function ProductDetail() {
    const { user } = useAuth();
    const currentUserId = user?.id || 1;
    const { id } = useParams();
    const navigate = useNavigate();

    // =============================
    // STATES
    // =============================
    const [product, setProduct] = useState(null);
    const [images, setImages] = useState([]);
    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [mainImage, setMainImage] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);

    // AI STYLIST STATES
    const [aiOutfits, setAiOutfits] = useState([]);
    const [loadingAi, setLoadingAi] = useState(false);
    const [showAiModal, setShowAiModal] = useState(false);

    // REVIEWS & RELATED PRODUCTS STATES
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(5.0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState([]);

    // =============================
    // FETCH DATA FUNCTIONS
    // =============================
    const fetchReviews = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/products/${id}/reviews`);
            const data = await res.json();
            if (data.success) {
                setReviews(data.reviews || []);
                setAverageRating(data.averageRating || 5.0);
                setTotalReviews(data.totalReviews || 0);
            }
        } catch (err) {
            console.error("Fetch product reviews error:", err);
        }
    };

    const fetchRelatedProducts = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/products/all");
            const data = await res.json();
            const allProducts = Array.isArray(data) ? data : (data?.products || data?.data || []);
            setRelatedProducts(allProducts.filter(p => p.id !== Number(id)).slice(0, 4));
        } catch (err) {
            console.error("Fetch related products error:", err);
        }
    };

    // =============================
    // AI STYLIST
    // =============================
    const handleGetAiStylist = async () => {
        setLoadingAi(true);
        setShowAiModal(true);
        try {
            const res = await fetch("http://localhost:5000/api/ai/recommend-outfit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productName: product.name,
                    productCategory: product.category,
                    productDescription: product.description,
                    productColor: product.color
                })
            });
            const data = await res.json();
            if (data.success) {
                setAiOutfits(data.recommendations);
            } else {
                alert(data.message || "Lỗi lấy gợi ý từ AI.");
            }
        } catch (err) {
            console.error("Fetch AI error:", err);
            alert("Lỗi kết nối tới AI Stylist.");
        } finally {
            setLoadingAi(false);
        }
    };

    // =============================
    // REVIEW SUBMIT
    // =============================
    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!newComment || newComment.trim() === "") {
            alert("Vui lòng nhập nội dung đánh giá.");
            return;
        }

        const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const rawId = user?.id || user?.user_id || savedUser?.id || savedUser?.user_id || currentUserId;
        const activeUserId = Number(rawId);

        if (!activeUserId || isNaN(activeUserId)) {
            alert("Vui lòng đăng nhập lại để thực hiện đánh giá.");
            return;
        }

        setSubmittingReview(true);
        try {
            const res = await fetch(`http://localhost:5000/api/products/${id}/reviews`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: activeUserId,
                    rating: Number(newRating),
                    comment: newComment.trim()
                })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                alert("🎉 " + data.message);
                setNewComment("");
                fetchReviews();
            } else {
                alert(data.message || "Lỗi gửi đánh giá.");
            }
        } catch (err) {
            console.error("Submit review error:", err);
            alert("Lỗi kết nối server.");
        } finally {
            setSubmittingReview(false);
        }
    };

    // =============================
    // ADD TO CART
    // =============================
    const handleAddToCart = async () => {
        if (!selectedColor && colors.length > 0) {
            alert("Vui lòng chọn màu sắc.");
            return;
        }
        if (!selectedSize && sizes.length > 0) {
            alert("Vui lòng chọn kích thước.");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/cart/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: currentUserId,
                    product_id: Number(id),
                    color_id: selectedColor || null,
                    size_id: selectedSize || null,
                    quantity: quantity
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert("🛒 Đã thêm vào giỏ hàng!");
            } else {
                console.error("Server error response:", data);
                alert(data.message || "Không thể thêm vào giỏ hàng.");
            }
        } catch (err) {
            console.error("Network or code error:", err);
            alert("Lỗi kết nối server.");
        }
    };

    // =============================
    // EFFECTS (LOAD & COLOR CHANGE)
    // =============================
    useEffect(() => {
        if (id) {
            fetchReviews();
            fetchRelatedProducts();
        }
    }, [id]);

    useEffect(() => {
        const loadData = async () => {
            try {
                // PRODUCT
                const productRes = await fetch(`http://localhost:5000/api/products/${id}`);
                const productData = await productRes.json();
                setProduct(productData);

                // COLORS
                const colorRes = await fetch(`http://localhost:5000/api/products/${id}/colors`);
                const colorData = await colorRes.json();
                setColors(colorData);

                // SIZES
                const sizeRes = await fetch(`http://localhost:5000/api/products/${id}/sizes`);
                const sizeData = await sizeRes.json();
                setSizes(sizeData);

                // Default Image Setup
                if (colorData.length > 0) {
                    const firstColorId = colorData[0].id;
                    setSelectedColor(firstColorId);

                    const imageRes = await fetch(`http://localhost:5000/api/products/${id}/images?color=${firstColorId}`);
                    const imageData = await imageRes.json();
                    setImages(imageData);

                    if (imageData.length > 0) {
                        setMainImage(`http://localhost:5000/uploads/${imageData[0].image_url}`);
                    } else if (productData.image_url) {
                        setMainImage(`http://localhost:5000/uploads/${productData.image_url}`);
                    }
                } else if (productData.image_url) {
                    setMainImage(`http://localhost:5000/uploads/${productData.image_url}`);
                }
            } catch (err) {
                console.log(err);
            }
        };
        loadData();
    }, [id]);

    useEffect(() => {
        if (!selectedColor) return;
        fetch(`http://localhost:5000/api/products/${id}/images?color=${selectedColor}`)
            .then(res => res.json())
            .then(data => {
                setImages(data);
                if (data.length > 0) {
                    setMainImage(`http://localhost:5000/uploads/${data[0].image_url}`);
                }
            })
            .catch(console.error);
    }, [selectedColor, id]);

    // =============================
    // RENDER
    // =============================
    if (!product) {
        return <h2>Loading...</h2>;
    }

    return (
        <>
            <Header />

            <div className="detail-container">
                {/* LEFT - GALLERY */}
                <div className="gallery">
                    <div className="thumb-list">
                        {images.map((img) => (
                            <img
                                key={img.id}
                                src={`http://localhost:5000/uploads/${img.image_url}`}
                                alt={product.name}
                                className={mainImage === `http://localhost:5000/uploads/${img.image_url}` ? "thumb active" : "thumb"}
                                onClick={() => setMainImage(`http://localhost:5000/uploads/${img.image_url}`)}
                            />
                        ))}
                    </div>
                    <div className="main-image">
                        {mainImage ? (
                            <img src={mainImage} alt={product.name} />
                        ) : (
                            <div style={{ height: "550px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                No Image
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT - INFO */}
                <div className="detail-info">
                    <h1>{product.name}</h1>

                    <div className="rating">
                        ★★★★★ <span>({totalReviews} Reviews)</span>
                    </div>

                    <h2>{Number(product.price).toLocaleString()} VNĐ</h2>
                    <p>{product.description}</p>

                    {/* COLOR OPTIONS */}
                    <div className="option-group">
                        <h4>Color</h4>
                        <div className="colors">
                            {colors.map((color) => (
                                <button
                                    key={color.id}
                                    title={color.color_name}
                                    className={selectedColor === color.id ? "color active" : "color"}
                                    style={{ backgroundColor: color.color_code }}
                                    onClick={() => setSelectedColor(color.id)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* SIZE OPTIONS */}
                    {sizes.length > 0 && (
                        <div className="option-group">
                            <h4>Size</h4>
                            <div className="sizes">
                                {sizes.map((size) => (
                                    <button
                                        key={size.id}
                                        className={selectedSize === size.id ? "size active" : "size"}
                                        onClick={() => setSelectedSize(size.id)}
                                    >
                                        {size.size_name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* QUANTITY */}
                    <div className="quantity">
                        <button onClick={() => quantity > 1 && setQuantity(quantity - 1)}>-</button>
                        <span>{quantity}</span>
                        <button onClick={() => setQuantity(quantity + 1)}>+</button>
                    </div>
{/* ================= ACTIONS ================= */}
<div className="product-actions-wrapper" style={{ marginTop: "30px", width: "100%" }}>
                        
                        {/* Hàng 1: Add to Cart và Buy Now xếp ngang */}
                        <div style={{ display: "flex", gap: "12px", marginBottom: "16px", width: "100%" }}>
                            <button 
                                onClick={handleAddToCart}
                                style={{
                                    flex: 1,
                                    padding: "16px 0",
                                    backgroundColor: "#0f172a",
                                    color: "#ffffff",
                                    border: "1px solid #0f172a",
                                    borderRadius: "4px",
                                    fontWeight: "600",
                                    fontSize: "14px",
                                    letterSpacing: "1px",
                                    cursor: "pointer",
                                    textTransform: "uppercase",
                                    transition: "all 0.3s ease"
                                }}
                                onMouseOver={(e) => { e.target.style.backgroundColor = "#000"; e.target.style.borderColor = "#000"; }}
                                onMouseOut={(e) => { e.target.style.backgroundColor = "#0f172a"; e.target.style.borderColor = "#0f172a"; }}
                            >
                                Add To Cart
                            </button>

                            <button 
                                style={{
                                    flex: 1,
                                    padding: "16px 0",
                                    backgroundColor: "#ffffff",
                                    color: "#0f172a",
                                    border: "1px solid #0f172a",
                                    borderRadius: "4px",
                                    fontWeight: "600",
                                    fontSize: "14px",
                                    letterSpacing: "1px",
                                    cursor: "pointer",
                                    textTransform: "uppercase",
                                    transition: "all 0.3s ease"
                                }}
                                onMouseOver={(e) => { e.target.style.backgroundColor = "#f8fafc"; }}
                                onMouseOut={(e) => { e.target.style.backgroundColor = "#ffffff"; }}
                            >
                                Buy Now
                            </button>
                        </div>

                        {/* Hàng 2: Nút AI Stylist (Premium Look) */}
                        <button
                            onClick={handleGetAiStylist}
                            style={{
                                width: "100%",
                                padding: "16px",
                                background: "linear-gradient(90deg, #1e1b4b, #4338ca, #312e81)",
                                backgroundSize: "200% auto",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "4px",
                                fontWeight: "600",
                                fontSize: "15px",
                                cursor: "pointer",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: "10px",
                                boxShadow: "0 4px 15px rgba(67, 56, 202, 0.2)",
                                transition: "all 0.3s ease"
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.backgroundPosition = "right center"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(67, 56, 202, 0.4)"; }}
                            onMouseOut={(e) => { e.currentTarget.style.backgroundPosition = "left center"; e.currentTarget.style.boxShadow = "0 4px 15px rgba(67, 56, 202, 0.2)"; }}
                        >
                            <span style={{ fontSize: "18px" }}>✨</span> 
                            <span>AI Stylist: Gợi ý phối đồ với túi này</span>
                        </button>
                    </div>

                </div>
            </div>

            {/* LOOKBOOK SECTION */}
            <section className="lookbook-section">
                <div className="lookbook-header">
                    <span>LUXURY LOOKBOOK</span>
                    <h2>Inspired by Modern Elegance</h2>
                    <p>Discover timeless styling inspirations and pair your favorite handbag with effortlessly elegant looks.</p>
                </div>
                <div className="lookbook-banner">
                    <img src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1600&auto=format&fit=crop" alt="Lookbook" />
                </div>
                <div className="lookbook-grid">
                    <div className="look-card">
                        <img src="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1200&auto=format&fit=crop" alt="Look 1" />
                        <div className="overlay">
                            <h4>LOOK 01</h4>
                            <span>View Look →</span>
                        </div>
                    </div>
                    <div className="look-card">
                        <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop" alt="Look 2" />
                        <div className="overlay">
                            <h4>LOOK 02</h4>
                            <span>View Look →</span>
                        </div>
                    </div>
                    <div className="look-card">
                        <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop" alt="Look 3" />
                        <div className="overlay">
                            <h4>LOOK 03</h4>
                            <span>View Look →</span>
                        </div>
                    </div>
                    <div className="look-card">
                        <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop" alt="Look 4" />
                        <div className="overlay">
                            <h4>LOOK 04</h4>
                            <span>View Look →</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* REVIEWS SECTION */}
            <section style={{ maxWidth: "1200px", margin: "40px auto", padding: "0 20px" }}>
                <div style={{ background: "#ffffff", borderRadius: "16px", padding: "32px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    <h2 style={{ fontSize: "22px", fontWeight: "700", margin: "0 0 8px", color: "#0f172a" }}>
                        Đánh giá sản phẩm ({averageRating} ★ / {totalReviews} lượt đánh giá)
                    </h2>
                    <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 24px" }}>
                        Cảm nhận thực tế từ các khách hàng đã mua sản phẩm này
                    </p>

                    {/* REVIEW FORM */}
                    <form onSubmit={handleReviewSubmit} style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "32px" }}>
                        <h4 style={{ margin: "0 0 12px", fontSize: "16px", fontWeight: "600" }}>Gửi đánh giá của bạn</h4>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                            <label style={{ fontSize: "14px", fontWeight: "600" }}>Chọn số sao: </label>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    onClick={() => setNewRating(star)}
                                    style={{ cursor: "pointer", fontSize: "22px", color: star <= newRating ? "#f59e0b" : "#cbd5e1" }}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                        <textarea
                            className="form-control"
                            rows="3"
                            placeholder="Chia sẻ trải nghiệm của bạn về kiểu dáng, chất liệu da, dịch vụ đóng gói..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            required
                            style={{ width: "100%", marginBottom: "12px" }}
                        />
                        <button type="submit" className="add-promo-btn" disabled={submittingReview}>
                            {submittingReview ? "Đang gửi..." : "Gửi đánh giá ngay"}
                        </button>
                    </form>

                    {/* REVIEWS LIST */}
                    {reviews.length === 0 ? (
                        <p style={{ color: "#64748b", fontStyle: "italic", textAlign: "center", padding: "20px" }}>
                            Chưa có bình luận nào. Hãy là người đầu tiên đánh giá sản phẩm này!
                        </p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {reviews.map((rev) => (
                                <div key={rev.id} style={{ padding: "16px", borderBottom: "1px solid #f1f5f9" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                        <span style={{ fontWeight: "700", color: "#0f172a" }}>{rev.user_fullname || "Khách hàng"}</span>
                                        <span style={{ color: "#f59e0b", fontSize: "16px" }}>{"★".repeat(rev.rating)}</span>
                                    </div>
                                    <p style={{ margin: "0 0 6px", fontSize: "14px", color: "#334155" }}>"{rev.comment}"</p>
                                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>{new Date(rev.created_at).toLocaleDateString("vi-VN")}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* AI STYLIST MODAL - ĐẶT Ở NGOÀI CÙNG ĐỂ KHÔNG BỊ LỖI HIỂN THỊ */}
            {showAiModal && (
                <div className="ai-modal-overlay" style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
                    <div className="ai-modal-content" style={{ background: "white", padding: "30px", borderRadius: "12px", width: "90%", maxWidth: "600px", maxHeight: "80vh", overflowY: "auto", position: "relative" }}>
                        <button onClick={() => setShowAiModal(false)} style={{ position: "absolute", top: "15px", right: "15px", border: "none", background: "none", fontSize: "20px", cursor: "pointer" }}>✕</button>

                        <h2 style={{ color: "#4f46e5", marginBottom: "15px" }}>✨ Gợi ý phong cách từ AI Stylist</h2>
                        <p style={{ color: "#666", marginBottom: "20px" }}>Dành riêng cho chiếc túi: <b>{product?.name}</b></p>

                        {loadingAi ? (
                            <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                                <p>🤖 AI đang phân tích kiểu dáng và mix-match trang phục cho bạn...</p>
                            </div>
                        ) : (
                            <div className="outfit-list">
                                {aiOutfits.map((outfit, index) => (
                                    <div key={index} style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", marginBottom: "15px", borderLeft: "4px solid #6366f1" }}>
                                        <h3 style={{ color: "#1e293b", fontSize: "18px", marginBottom: "8px" }}>👗 {outfit.styleName} <span style={{ fontSize: "12px", background: "#e0e7ff", color: "#3730a3", padding: "2px 8px", borderRadius: "4px", float: "right" }}>{outfit.occasion}</span></h3>
                                        <p style={{ margin: "6px 0", color: "#334155" }}><b>Trang phục:</b> {outfit.clothingSuggestion}</p>
                                        <p style={{ margin: "6px 0", color: "#334155" }}><b>Giày & Phụ kiện:</b> {outfit.shoesAndAccessories}</p>
                                        <p style={{ margin: "6px 0", color: "#64748b", fontStyle: "italic", fontSize: "14px" }}>💡 <b>Tip màu sắc:</b> {outfit.colorTip}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
}

export default ProductDetail;