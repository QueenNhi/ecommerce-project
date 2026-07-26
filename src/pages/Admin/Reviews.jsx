import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import "../../css/admin/Reviews.css";

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeStar, setActiveStar] = useState("all");

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);

    const fetchReviews = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/admin/reviews");
            const data = await res.json();
            if (data.success && Array.isArray(data.reviews)) {
                setReviews(data.reviews);
            }
        } catch (err) {
            console.error("Fetch reviews error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/admin/reviews/${id}`, {
                method: "DELETE"
            });
            const data = await res.json();
            if (res.ok && data.success) {
                alert("🗑️ Xóa đánh giá thành công!");
                setDeleteModalOpen(false);
                setSelectedReview(null);
                fetchReviews();
            } else {
                alert(data.message || "Lỗi xóa đánh giá.");
            }
        } catch (err) {
            console.error("Delete review error:", err);
            alert("Lỗi kết nối server.");
        }
    };

    const renderStars = (rating) => {
        const count = Math.min(Math.max(rating || 5, 1), 5);
        return "★".repeat(count) + "☆".repeat(5 - count);
    };

    const filteredReviews = activeStar === "all"
        ? reviews
        : reviews.filter(r => r.rating === parseInt(activeStar, 10));

    return (
        <AdminLayout>
            <div className="admin-reviews-page">
                
                {/* HEADER */}
                <div className="reviews-header">
                    <h1>Quản lý Đánh giá & Phản hồi (Reviews)</h1>
                    <p>Kiểm duyệt các bình luận, đánh giá sao từ khách hàng mua túi xách</p>
                </div>

                {/* RATING TABS */}
                <div className="reviews-tabs">
                    <button
                        className={`tab-btn ${activeStar === "all" ? "active" : ""}`}
                        onClick={() => setActiveStar("all")}
                    >
                        Tất cả ({reviews.length})
                    </button>
                    {[5, 4, 3, 2, 1].map(star => (
                        <button
                            key={star}
                            className={`tab-btn ${activeStar === String(star) ? "active" : ""}`}
                            onClick={() => setActiveStar(String(star))}
                        >
                            {star} ★ ({reviews.filter(r => r.rating === star).length})
                        </button>
                    ))}
                </div>

                {/* TABLE CARD */}
                <div className="reviews-card">
                    {loading ? (
                        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                            Đang tải danh sách đánh giá...
                        </div>
                    ) : filteredReviews.length === 0 ? (
                        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                            Không có đánh giá nào trong mục này.
                        </div>
                    ) : (
                        <div className="reviews-table-container">
                            <table className="reviews-table">
                                <thead>
                                    <tr>
                                        <th>Mã</th>
                                        <th>Sản phẩm</th>
                                        <th>Khách hàng</th>
                                        <th>Số sao</th>
                                        <th>Nội dung bình luận</th>
                                        <th>Ngày gửi</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredReviews.map(rev => (
                                        <tr key={rev.id}>
                                            <td style={{ fontWeight: "700", color: "#2563eb" }}>#REV-{rev.id}</td>
                                            <td>
                                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                    <img
                                                        src={`http://localhost:5000/uploads/${rev.product_image}`}
                                                        alt={rev.product_name}
                                                        className="review-product-img"
                                                        onError={e => { if(!e.target.dataset.err){e.target.dataset.err=1;e.target.src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'><rect width='48' height='48' rx='8' fill='%23f1f5f9'/><text x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-size='9' font-family='sans-serif' fill='%2394a3b8'>IMG</text></svg>";} }}
                                                    />
                                                    <span style={{ fontWeight: "600", fontSize: "13px" }}>{rev.product_name}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: "600" }}>{rev.user_fullname}</div>
                                                <div style={{ fontSize: "12px", color: "#64748b" }}>{rev.user_email}</div>
                                            </td>
                                            <td>
                                                <span className="stars-rating">{renderStars(rev.rating)}</span>
                                            </td>
                                            <td style={{ maxWidth: "280px", fontSize: "13px", color: "#334155" }}>
                                                "{rev.comment}"
                                            </td>
                                            <td>
                                                {new Date(rev.created_at).toLocaleDateString("vi-VN")}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => { setSelectedReview(rev); setDeleteModalOpen(true); }}
                                                >
                                                    Xóa / Báo spam
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* DELETE MODAL */}
                {deleteModalOpen && selectedReview && (
                    <div className="modal-overlay" onClick={() => setDeleteModalOpen(false)}>
                        <div className="promo-modal-card" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Xác nhận xóa đánh giá</h3>
                                <button className="close-btn" onClick={() => setDeleteModalOpen(false)}>×</button>
                            </div>
                            <div style={{ padding: "10px 0" }}>
                                <p style={{ margin: "0 0 6px" }}>Bạn có chắc chắn muốn xóa đánh giá của <strong>{selectedReview.user_fullname}</strong>?</p>
                                <p style={{ fontStyle: "italic", color: "#64748b", fontSize: "13px", background: "#f8fafc", padding: "10px", borderRadius: "8px" }}>
                                    "{selectedReview.comment}"
                                </p>
                            </div>
                            <div className="modal-actions">
                                <button className="btn-secondary" onClick={() => setDeleteModalOpen(false)}>Hủy</button>
                                <button className="btn-danger" onClick={() => handleDelete(selectedReview.id)}>Xóa vĩnh viễn</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </AdminLayout>
    );
};

export default Reviews;
