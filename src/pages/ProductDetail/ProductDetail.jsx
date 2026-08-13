import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";
import { API_URL, UPLOADS_URL } from "../../config/api";

import {
    FiShoppingBag,
    FiHeart,
    FiShield,
    FiTruck,
    FiLock,
    FiPackage,
    FiStar,
    FiChevronRight,
    FiCheck,
    FiMinus,
    FiPlus,
    FiMaximize2,
    FiShare2
} from "react-icons/fi";

import { HiShieldCheck, HiSparkles } from "react-icons/hi";

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
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [activeTab, setActiveTab] = useState("description");
    const [zoomImage, setZoomImage] = useState(false);

    // AI STYLIST STATES
    const [aiOutfits, setAiOutfits] = useState([]);
    const [loadingAi, setLoadingAi] = useState(false);
    const [showAiModal, setShowAiModal] = useState(false);
    const [streamingText, setStreamingText] = useState("");
    const [isCachedResult, setIsCachedResult] = useState(false);

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
            const res = await fetch(`${API_URL}/api/products/${id}/reviews`);
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
            const res = await fetch(`${API_URL}/api/products/all`);
            const data = await res.json();
            const allProducts = Array.isArray(data) ? data : (data?.products || data?.data || []);
            setRelatedProducts(allProducts.filter(p => p.id !== Number(id)).slice(0, 4));
        } catch (err) {
            console.error("Fetch related products error:", err);
        }
    };

    // =============================
    // AI STYLIST (SSE STREAMING + CACHING)
    // =============================
    const handleGetAiStylist = async () => {
        setLoadingAi(true);
        setShowAiModal(true);
        setAiOutfits([]);
        setStreamingText("");
        setIsCachedResult(false);

        try {
            const response = await fetch(`${API_URL}/api/ai/recommend-outfit-stream`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productName: product?.name || "",
                    productCategory: product?.category || "Túi xách thời trang",
                    productDescription: product?.description || "",
                    productColor: product?.color || ""
                })
            });

            if (!response.ok) {
                throw new Error("Không thể kết nối dịch vụ AI Stream.");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let accumulatedText = "";
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed || trimmed.startsWith(":")) continue;

                    if (trimmed.startsWith("data: ")) {
                        const dataStr = trimmed.replace(/^data:\s*/, "");
                        if (dataStr === "[DONE]") break;

                        try {
                            const parsed = JSON.parse(dataStr);
                            if (parsed.type === "cached") {
                                setIsCachedResult(true);
                                setAiOutfits(parsed.recommendations || []);
                                setLoadingAi(false);
                                return;
                            } else if (parsed.type === "chunk") {
                                accumulatedText += parsed.content;
                                setStreamingText(accumulatedText);
                            } else if (parsed.type === "done") {
                                setAiOutfits(parsed.recommendations || []);
                                setLoadingAi(false);
                                return;
                            } else if (parsed.type === "error") {
                                alert(parsed.message || "Lỗi tạo phản hồi AI.");
                            }
                        } catch (e) {
                            // Skip JSON parse error on partial SSE token
                        }
                    }
                }
            }
        } catch (err) {
            console.error("Fetch AI SSE stream error, falling back to standard HTTP:", err);
            try {
                const res = await fetch(`${API_URL}/api/ai/recommend-outfit`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        productName: product?.name || "",
                        productCategory: product?.category || "Túi xách thời trang",
                        productDescription: product?.description || "",
                        productColor: product?.color || ""
                    })
                });
                const data = await res.json();
                if (data.success) {
                    setAiOutfits(data.recommendations);
                    if (data.cached) setIsCachedResult(true);
                } else {
                    alert(data.message || "Lỗi lấy gợi ý từ AI.");
                }
            } catch (e) {
                alert("Lỗi kết nối tới AI Stylist.");
            }
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
            const res = await fetch(`${API_URL}/api/products/${id}/reviews`, {
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
            const response = await fetch(`${API_URL}/api/cart/add`, {
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

    const handleBuyNow = async () => {
        await handleAddToCart();
        navigate("/cart");
    };

    // =============================
    // EFFECTS (LOAD & COLOR CHANGE)
    // =============================
    useEffect(() => {
        window.scrollTo(0, 0);
        if (id) {
            fetchReviews();
            fetchRelatedProducts();
        }
    }, [id]);

    useEffect(() => {
        const loadData = async () => {
            try {
                // PRODUCT
                const productRes = await fetch(`${API_URL}/api/products/${id}`);
                const productData = await productRes.json();
                setProduct(productData);

                // COLORS
                const colorRes = await fetch(`${API_URL}/api/products/${id}/colors`);
                const colorData = await colorRes.json();
                setColors(colorData);

                // SIZES
                const sizeRes = await fetch(`${API_URL}/api/products/${id}/sizes`);
                const sizeData = await sizeRes.json();
                setSizes(sizeData);

                // Default Image Setup
                if (colorData.length > 0) {
                    const firstColorId = colorData[0].id;
                    setSelectedColor(firstColorId);

                    const imageRes = await fetch(`${API_URL}/api/products/${id}/images?color=${firstColorId}`);
                    const imageData = await imageRes.json();
                    setImages(imageData);

                    if (imageData.length > 0) {
                        setMainImage(`${UPLOADS_URL}/${imageData[0].image_url}`);
                    } else if (productData.image_url) {
                        setMainImage(`${UPLOADS_URL}/${productData.image_url}`);
                    }
                } else if (productData.image_url) {
                    setMainImage(`${UPLOADS_URL}/${productData.image_url}`);
                }
            } catch (err) {
                console.log(err);
            }
        };
        loadData();
    }, [id]);

    useEffect(() => {
        if (!selectedColor) return;
        fetch(`${API_URL}/api/products/${id}/images?color=${selectedColor}`)
            .then(res => res.json())
            .then(data => {
                setImages(data);
                if (data.length > 0) {
                    setMainImage(`${UPLOADS_URL}/${data[0].image_url}`);
                }
            })
            .catch(console.error);
    }, [selectedColor, id]);

    // Active color object
    const activeColorObj = colors.find(c => c.id === selectedColor);

    // =============================
    // RENDER
    // =============================
    if (!product) {
        return (
            <>
                <Header />
                <div className="product-detail-skeleton">
                    <div className="skeleton-spinner"></div>
                    <p>Loading Luxury Collection...</p>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />

            <div className="luxury-product-page">
                {/* ── BREADCRUMB ───────────────────────────── */}
                <div className="product-breadcrumb">
                    <Link to="/">HOME</Link>
                    <FiChevronRight className="bc-icon" />
                    <Link to="/products">HANDBAGS</Link>
                    <FiChevronRight className="bc-icon" />
                    <span className="current">{product.name}</span>
                </div>

                {/* ── MAIN PRODUCT GRID ────────────────────── */}
                <div className="detail-container">
                    
                    {/* LEFT - GALLERY */}
                    <div className="gallery">
                        {/* THUMBNAILS */}
                        <div className="thumb-list">
                            {images.map((img) => {
                                const imgSrc = `${UPLOADS_URL}/${img.image_url}`;
                                const isActive = mainImage === imgSrc;
                                return (
                                    <div
                                        key={img.id}
                                        className={`thumb-wrapper ${isActive ? "active" : ""}`}
                                        onClick={() => setMainImage(imgSrc)}
                                    >
                                        <img src={imgSrc} alt={product.name} className="thumb" />
                                    </div>
                                );
                            })}
                        </div>

                        {/* MAIN IMAGE CARD */}
                        <div className="main-image-card">
                            <span className="luxury-badge">HERITAGE SELECTION</span>
                            
                            <button
                                className="zoom-btn"
                                onClick={() => setZoomImage(!zoomImage)}
                                title="Zoom Image"
                            >
                                <FiMaximize2 />
                            </button>

                            {mainImage ? (
                                <img
                                    src={mainImage}
                                    alt={product.name}
                                    className={`main-img ${zoomImage ? "zoomed" : ""}`}
                                    onClick={() => setZoomImage(!zoomImage)}
                                />
                            ) : (
                                <div className="no-img-placeholder">
                                    <span>NO IMAGE AVAILABLE</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT - PRODUCT INFO */}
                    <div className="detail-info">
                        
                        {/* BRAND BADGE */}
                        <div className="product-brand-tag">
                            <span>LUXURY EDITION</span>
                            <span className="dot">•</span>
                            <span className="in-stock-label">IN STOCK</span>
                        </div>

                        {/* TITLE */}
                        <h1 className="product-title">{product.name}</h1>

                        {/* RATING & REVIEWS SUMMARY */}
                        <div className="product-rating-bar">
                            <div className="stars">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <FiStar
                                        key={star}
                                        className={star <= Math.round(averageRating) ? "star filled" : "star"}
                                    />
                                ))}
                            </div>
                            <span className="rating-num">{averageRating}</span>
                            <span className="divider">|</span>
                            <a
                                href="#reviews-section"
                                className="reviews-link"
                                onClick={() => setActiveTab("reviews")}
                            >
                                {totalReviews} Verified Customer Reviews
                            </a>
                        </div>

                        {/* PRICE DISPLAY */}
                        <div className="price-container">
                            <span className="current-price">
                                {Number(product.price).toLocaleString("vi-VN")} ₫
                            </span>
                            <span className="tax-notice">Taxes & Duty Included</span>
                        </div>

                        {/* SHORT DESCRIPTION */}
                        <p className="product-desc-short">{product.description}</p>

                        {/* COLOR SELECTOR */}
                        {colors.length > 0 && (
                            <div className="option-group">
                                <div className="option-header">
                                    <span className="option-title">COLOR:</span>
                                    <span className="option-selected">{activeColorObj?.color_name || "Select Color"}</span>
                                </div>
                                <div className="colors-grid">
                                    {colors.map((color) => {
                                        const isSelected = selectedColor === color.id;
                                        return (
                                            <button
                                                key={color.id}
                                                title={color.color_name}
                                                className={`color-swatch ${isSelected ? "active" : ""}`}
                                                style={{ backgroundColor: color.color_code || "#000" }}
                                                onClick={() => setSelectedColor(color.id)}
                                            >
                                                {isSelected && <FiCheck className="check-icon" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* SIZE SELECTOR */}
                        {sizes.length > 0 && (
                            <div className="option-group">
                                <div className="option-header">
                                    <span className="option-title">SIZE:</span>
                                    <a href="#size-guide" onClick={(e) => { e.preventDefault(); alert("Standard Luxury Dimensions. Fits daily essentials gracefully."); }} className="size-guide-btn">
                                        Size Guide
                                    </a>
                                </div>
                                <div className="sizes-grid">
                                    {sizes.map((size) => {
                                        const isSelected = selectedSize === size.id;
                                        return (
                                            <button
                                                key={size.id}
                                                className={`size-btn ${isSelected ? "active" : ""}`}
                                                onClick={() => setSelectedSize(size.id)}
                                            >
                                                {size.size_name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* QUANTITY & ACTIONS */}
                        <div className="quantity-and-actions">
                            <div className="quantity-selector">
                                <button
                                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                                    disabled={quantity <= 1}
                                    aria-label="Decrease quantity"
                                >
                                    <FiMinus />
                                </button>
                                <span className="qty-num">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    aria-label="Increase quantity"
                                >
                                    <FiPlus />
                                </button>
                            </div>

                            <button
                                className="wishlist-btn"
                                onClick={() => setIsWishlisted(!isWishlisted)}
                                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                            >
                                <FiHeart className={isWishlisted ? "heart-filled" : ""} />
                            </button>

                            <button
                                className="share-btn"
                                onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Link copied to clipboard!"); }}
                                title="Share Product"
                            >
                                <FiShare2 />
                            </button>
                        </div>

                        {/* MAIN ACTION BUTTONS */}
                        <div className="primary-actions">
                            <button className="btn-add-cart" onClick={handleAddToCart}>
                                <FiShoppingBag /> ADD TO CART
                            </button>

                            <button className="btn-buy-now" onClick={handleBuyNow}>
                                BUY NOW
                            </button>
                        </div>

                        {/* AI STYLIST BUTTON */}
                        <div className="ai-stylist-banner">
                            <button className="ai-stylist-btn" onClick={handleGetAiStylist}>
                                <HiSparkles className="sparkle-icon" />
                                <span>AI STYLIST: Gợi ý phối đồ với chiếc túi này</span>
                            </button>
                        </div>

                        {/* TRUST PROPOSITIONS */}
                        <div className="trust-props-grid">
                            <div className="trust-prop-card">
                                <FiTruck className="prop-icon" />
                                <div>
                                    <h5>Free Express Shipping</h5>
                                    <p>Complimentary delivery on all luxury orders</p>
                                </div>
                            </div>
                            <div className="trust-prop-card">
                                <HiShieldCheck className="prop-icon" />
                                <div>
                                    <h5>Authenticity Guaranteed</h5>
                                    <p>100% genuine craftsmanship with serial verification</p>
                                </div>
                            </div>
                            <div className="trust-prop-card">
                                <FiLock className="prop-icon" />
                                <div>
                                    <h5>Secure Payment</h5>
                                    <p>Encrypted 256-bit payment gateway protection</p>
                                </div>
                            </div>
                            <div className="trust-prop-card">
                                <FiPackage className="prop-icon" />
                                <div>
                                    <h5>Signature Packaging</h5>
                                    <p>Arrives in luxury box with silk dust cover</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* ── TABS SECTION (DESCRIPTION, SPECS, REVIEWS) ────────────── */}
                <section className="product-tabs-section" id="reviews-section">
                    <div className="tabs-container">
                        <div className="tabs-header">
                            <button
                                className={`tab-btn ${activeTab === "description" ? "active" : ""}`}
                                onClick={() => setActiveTab("description")}
                            >
                                Description
                            </button>
                            <button
                                className={`tab-btn ${activeTab === "specs" ? "active" : ""}`}
                                onClick={() => setActiveTab("specs")}
                            >
                                Specifications
                            </button>
                            <button
                                className={`tab-btn ${activeTab === "reviews" ? "active" : ""}`}
                                onClick={() => setActiveTab("reviews")}
                            >
                                Reviews ({totalReviews})
                            </button>
                        </div>

                        <div className="tab-content">
                            {/* DESCRIPTION TAB */}
                            {activeTab === "description" && (
                                <div className="tab-pane fade-in">
                                    <h3>Craftsmanship & Design</h3>
                                    <p>{product.description}</p>
                                    <div className="highlights-grid">
                                        <div className="hl-item">
                                            <h4>Premium Leather Selection</h4>
                                            <p>Hand-picked top grain leather treated with natural vegetable tanning techniques for durable luxury.</p>
                                        </div>
                                        <div className="hl-item">
                                            <h4>Handcrafted Hardware</h4>
                                            <p>Gold-finish metallic fittings polished by master artisans to resist tarnishing and scratch marks.</p>
                                        </div>
                                        <div className="hl-item">
                                            <h4>Ergonomic Interior</h4>
                                            <p>Soft suede lining featuring multiple zip compartments for modern daily organization.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SPECIFICATIONS TAB */}
                            {activeTab === "specs" && (
                                <div className="tab-pane fade-in">
                                    <h3>Product Specifications</h3>
                                    <table className="specs-table">
                                        <tbody>
                                            <tr>
                                                <th>Product Name</th>
                                                <td>{product.name}</td>
                                            </tr>
                                            <tr>
                                                <th>Material</th>
                                                <td>100% Genuine Italian Calfskin Leather</td>
                                            </tr>
                                            <tr>
                                                <th>Lining</th>
                                                <td>Microfiber Suede Touch</td>
                                            </tr>
                                            <tr>
                                                <th>Hardware</th>
                                                <td>Polished 24k Gold-Tone Metal Fittings</td>
                                            </tr>
                                            <tr>
                                                <th>Color</th>
                                                <td>{activeColorObj?.color_name || product.color || "Classic Heritage"}</td>
                                            </tr>
                                            <tr>
                                                <th>Origin</th>
                                                <td>Handcrafted in Florence, Italy</td>
                                            </tr>
                                            <tr>
                                                <th>Included</th>
                                                <td>Authenticity Card, Serial Seal, Dust Bag, Gift Box</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* REVIEWS TAB */}
                            {activeTab === "reviews" && (
                                <div className="tab-pane fade-in">
                                    <div className="reviews-summary-card">
                                        <div className="score-box">
                                            <span className="big-score">{averageRating}</span>
                                            <div className="stars">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <FiStar key={s} className={s <= Math.round(averageRating) ? "star filled" : "star"} />
                                                ))}
                                            </div>
                                            <p>{totalReviews} Verified Customer Reviews</p>
                                        </div>

                                        <form onSubmit={handleReviewSubmit} className="review-form">
                                            <h4>Write a Review</h4>
                                            <div className="star-rating-selector">
                                                <span>Rating:</span>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <span
                                                        key={star}
                                                        onClick={() => setNewRating(star)}
                                                        className={`star-select ${star <= newRating ? "selected" : ""}`}
                                                    >
                                                        ★
                                                    </span>
                                                ))}
                                            </div>
                                            <textarea
                                                className="review-textarea"
                                                rows="3"
                                                placeholder="Share your experience regarding leather texture, packaging, or elegance..."
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                required
                                            />
                                            <button type="submit" className="btn-submit-review" disabled={submittingReview}>
                                                {submittingReview ? "Submitting..." : "Submit Review"}
                                            </button>
                                        </form>
                                    </div>

                                    {/* REVIEWS LIST */}
                                    <div className="reviews-list">
                                        {reviews.length === 0 ? (
                                            <p className="no-reviews">No reviews yet. Be the first to share your thoughts on this piece!</p>
                                        ) : (
                                            reviews.map((rev) => (
                                                <div key={rev.id} className="review-card">
                                                    <div className="review-header">
                                                        <div className="reviewer-info">
                                                            <div className="avatar-circle">
                                                                {(rev.user_fullname || "K").charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <h5>{rev.user_fullname || "Verified Client"}</h5>
                                                                <span className="rev-date">{new Date(rev.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                                                            </div>
                                                        </div>
                                                        <div className="rev-stars">
                                                            {"★".repeat(rev.rating)}
                                                        </div>
                                                    </div>
                                                    <p className="rev-comment">"{rev.comment}"</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* ── LOOKBOOK SECTION ───────────────────────────── */}
                <section className="lookbook-section">
                    <div className="lookbook-header">
                        <span>LUXURY STYLING LOOKBOOK</span>
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
                                <span>Urban Parisian Elegance</span>
                            </div>
                        </div>
                        <div className="look-card">
                            <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop" alt="Look 2" />
                            <div className="overlay">
                                <h4>LOOK 02</h4>
                                <span>Minimalist Monochrome</span>
                            </div>
                        </div>
                        <div className="look-card">
                            <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop" alt="Look 3" />
                            <div className="overlay">
                                <h4>LOOK 03</h4>
                                <span>Evening Glamour</span>
                            </div>
                        </div>
                        <div className="look-card">
                            <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop" alt="Look 4" />
                            <div className="overlay">
                                <h4>LOOK 04</h4>
                                <span>Heritage Resort Style</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── RELATED PRODUCTS ───────────────────────────── */}
                {relatedProducts.length > 0 && (
                    <section className="related-products-section">
                        <div className="section-header">
                            <span>CURATED SELECTION</span>
                            <h2>You May Also Admire</h2>
                        </div>
                        <div className="related-grid">
                            {relatedProducts.map((rel) => (
                                <Link to={`/product/${rel.id}`} key={rel.id} className="related-card">
                                    <div className="rel-img-wrapper">
                                        <img
                                            src={`${UPLOADS_URL}/${rel.image_url}`}
                                            alt={rel.name}
                                            onError={(e) => {
                                                if (!e.target.dataset.err) {
                                                    e.target.dataset.err = 1;
                                                    e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='350'><rect width='300' height='350' fill='%23f8fafc'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-family='sans-serif'>HERITAGE LUXURY</text></svg>";
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="rel-info">
                                        <h4>{rel.name}</h4>
                                        <span className="rel-price">{Number(rel.price).toLocaleString("vi-VN")} ₫</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

            </div>

            {/* ── AI STYLIST MODAL ──────────────────────────────── */}
            {showAiModal && (
                <div className="ai-modal-overlay" onClick={() => setShowAiModal(false)}>
                    <div className="ai-modal-card" onClick={(e) => e.stopPropagation()}>
                        <button className="ai-close-btn" onClick={() => setShowAiModal(false)}>✕</button>

                        <div className="ai-modal-header">
                            <span className="ai-sparkle-badge">
                                {isCachedResult ? "⚡ SMART AI CACHE HIT (<5ms)" : "✨ REAL-TIME AI STYLIST"}
                            </span>
                            <h2>Styling Inspirations</h2>
                            <p>Exclusive outfit recommendations for <strong>{product?.name}</strong></p>
                        </div>

                        {loadingAi ? (
                            <div className="ai-loading-box">
                                {streamingText ? (
                                    <div className="ai-streaming-container">
                                        <div className="ai-stream-header">
                                            <div className="ai-pulse-dot"></div>
                                            <span>AI đang suy luận trực tiếp (Real-time SSE Streaming)...</span>
                                        </div>
                                        <div className="ai-stream-text">
                                            {streamingText}
                                            <span className="ai-cursor">|</span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="ai-spinner"></div>
                                        <p>Đang kết nối siêu tốc tới AI Stylist...</p>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="outfit-list">
                                {aiOutfits && aiOutfits.length > 0 ? (
                                    aiOutfits.map((outfit, index) => (
                                        <div key={index} className="outfit-card">
                                            <div className="outfit-card-header">
                                                <h3>👗 {outfit.styleName}</h3>
                                                <span className="occasion-tag">{outfit.occasion}</span>
                                            </div>
                                            <div className="outfit-detail-row">
                                                <strong>Apparel:</strong> <span>{outfit.clothingSuggestion}</span>
                                            </div>
                                            <div className="outfit-detail-row">
                                                <strong>Footwear & Accessories:</strong> <span>{outfit.shoesAndAccessories}</span>
                                            </div>
                                            <div className="outfit-color-tip">
                                                💡 <strong>Palette Tip:</strong> {outfit.colorTip}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ textAlign: "center", color: "#64748b", padding: "20px" }}>
                                        Không tìm thấy cấu trúc gợi ý phù hợp. Vui lòng thử lại.
                                    </p>
                                )}
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