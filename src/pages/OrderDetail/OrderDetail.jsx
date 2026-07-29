import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { API_URL } from "../../config/api";
import { FiCheckCircle, FiClock, FiTruck, FiPackage, FiXCircle, FiArrowLeft, FiShield, FiPhone } from "react-icons/fi";
import "./OrderDetail.css";

const OrderDetail = () => {
    const { id } = useParams();
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                setError("");
                const token = localStorage.getItem("token");
                const res = await fetch(`${API_URL}/api/orders/${id}`, {
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {})
                    }
                });

                const data = await res.json();
                if (res.ok && data.success) {
                    setOrderData(data);
                } else {
                    setError(data.message || "Không tìm thấy thông tin đơn hàng.");
                }
            } catch (err) {
                console.error("Error fetching order details:", err);
                setError("Không thể kết nối tới máy chủ.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchOrder();
        }
    }, [id]);

    const formatPrice = (amount) => {
        return Number(amount || 0).toLocaleString("vi-VN") + " ₫";
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const renderStatusBadge = (statusStr) => {
        const st = String(statusStr || "pending").toLowerCase();
        switch (st) {
            case "completed":
            case "hoàn thành":
            case "đã giao":
                return <span className="status-badge status-completed"><FiCheckCircle /> Giao hàng hoàn tất</span>;
            case "shipping":
            case "đang giao":
            case "đang vận chuyển":
                return <span className="status-badge status-shipping"><FiTruck /> Đang vận chuyển</span>;
            case "confirmed":
            case "processing":
            case "đã xác nhận":
            case "đang xử lý":
                return <span className="status-badge status-processing"><FiPackage /> Đã xác nhận & Đang chuẩn bị</span>;
            case "cancelled":
            case "đã hủy":
            case "hủy":
                return <span className="status-badge status-cancelled"><FiXCircle /> Đã hủy đơn</span>;
            default:
                return <span className="status-badge status-pending"><FiClock /> Đang chờ xử lý</span>;
        }
    };

    const getTimelineStep = (statusStr) => {
        const st = String(statusStr || "pending").toLowerCase();
        if (st.includes("cancel") || st.includes("hủy")) return -1;
        if (st.includes("completed") || st.includes("hoàn thành") || st.includes("đã giao")) return 4;
        if (st.includes("shipping") || st.includes("đang giao")) return 3;
        if (st.includes("confirm") || st.includes("process") || st.includes("xác nhận")) return 2;
        return 1; // Created / Pending
    };

    return (
        <div className="order-detail-page">
            <Header />

            <main className="order-detail-main">
                <div className="order-detail-container">
                    
                    {/* BREADCRUMB */}
                    <div className="order-breadcrumb">
                        <Link to="/">Trang chủ</Link>
                        <span>/</span>
                        <Link to="/profile">Hồ sơ & Đơn hàng</Link>
                        <span>/</span>
                        <span className="current">Chi tiết đơn hàng #{id}</span>
                    </div>

                    {loading ? (
                        <div className="order-detail-loading">
                            <div className="loading-spinner" />
                            <p>Đang tải thông tin đơn hàng #{id}...</p>
                        </div>
                    ) : error ? (
                        <div className="order-detail-error">
                            <FiXCircle className="error-icon" />
                            <h2>Không thể hiển thị đơn hàng</h2>
                            <p>{error}</p>
                            <Link to="/profile" className="btn-back">
                                <FiArrowLeft /> Quay lại danh sách đơn hàng
                            </Link>
                        </div>
                    ) : orderData ? (
                        <>
                            {/* ORDER HEADER BANNER */}
                            <div className="order-header-card">
                                <div className="order-header-info">
                                    <div className="order-id-group">
                                        <h1>Đơn Hàng #{orderData.order?.id || id}</h1>
                                        <p className="order-date">
                                            Ngày đặt hàng: {formatDate(orderData.order?.created_at)}
                                        </p>
                                    </div>
                                    <div className="order-header-status">
                                        {renderStatusBadge(orderData.status || orderData.order?.order_status)}
                                    </div>
                                </div>

                                {/* ORDER TIMELINE */}
                                {getTimelineStep(orderData.status || orderData.order?.order_status) !== -1 && (
                                    <div className="order-timeline-wrapper">
                                        <div className="order-timeline">
                                            <div className={`timeline-step ${getTimelineStep(orderData.status || orderData.order?.order_status) >= 1 ? "active" : ""}`}>
                                                <div className="step-icon"><FiClock /></div>
                                                <div className="step-label">Đặt hàng</div>
                                            </div>
                                            <div className={`timeline-line ${getTimelineStep(orderData.status || orderData.order?.order_status) >= 2 ? "active" : ""}`} />
                                            <div className={`timeline-step ${getTimelineStep(orderData.status || orderData.order?.order_status) >= 2 ? "active" : ""}`}>
                                                <div className="step-icon"><FiPackage /></div>
                                                <div className="step-label">Xác nhận</div>
                                            </div>
                                            <div className={`timeline-line ${getTimelineStep(orderData.status || orderData.order?.order_status) >= 3 ? "active" : ""}`} />
                                            <div className={`timeline-step ${getTimelineStep(orderData.status || orderData.order?.order_status) >= 3 ? "active" : ""}`}>
                                                <div className="step-icon"><FiTruck /></div>
                                                <div className="step-label">Đang giao</div>
                                            </div>
                                            <div className={`timeline-line ${getTimelineStep(orderData.status || orderData.order?.order_status) >= 4 ? "active" : ""}`} />
                                            <div className={`timeline-step ${getTimelineStep(orderData.status || orderData.order?.order_status) >= 4 ? "active" : ""}`}>
                                                <div className="step-icon"><FiCheckCircle /></div>
                                                <div className="step-label">Hoàn thành</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* TWO-COLUMN CONTENT GRID */}
                            <div className="order-content-grid">
                                
                                {/* LEFT COLUMN: PRODUCTS LIST */}
                                <div className="order-items-card">
                                    <h2>Danh Sách Sản Phẩm Đặt Mua ({orderData.items?.length || 0})</h2>
                                    
                                    <div className="order-items-list">
                                        {(orderData.items || []).map((item, idx) => (
                                            <div key={item.id || idx} className="order-item-row">
                                                <div className="item-image">
                                                    <img
                                                        src={item.image_url || "/images/product-placeholder.jpg"}
                                                        alt={item.name || "Túi xách Heritage"}
                                                    />
                                                </div>
                                                <div className="item-details">
                                                    <Link to={`/product/${item.product_id}`} className="item-name">
                                                        {item.name || "Túi xách cao cấp Heritage"}
                                                    </Link>
                                                    <div className="item-attributes">
                                                        {item.color_name && <span>Màu: {item.color_name}</span>}
                                                        {item.size_name && <span>Kích thước: {item.size_name}</span>}
                                                    </div>
                                                    <div className="item-price-qty">
                                                        <span className="unit-price">{formatPrice(item.price)}</span>
                                                        <span className="qty-times">× {item.quantity}</span>
                                                    </div>
                                                </div>
                                                <div className="item-subtotal">
                                                    {formatPrice(Number(item.price || 0) * Number(item.quantity || 1))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* ORDER TOTAL SUMMARY */}
                                    <div className="order-summary-box">
                                        <div className="summary-row">
                                            <span>Tạm tính</span>
                                            <span>{formatPrice(orderData.order?.total_price)}</span>
                                        </div>
                                        <div className="summary-row">
                                            <span>Phí vận chuyển hỏa tốc</span>
                                            <span className="free-shipping">Miễn phí (Heritage Privilege)</span>
                                        </div>
                                        <div className="summary-row total-row">
                                            <span>Tổng thanh toán</span>
                                            <span className="total-price">{formatPrice(orderData.order?.total_price)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT COLUMN: SHIPPING & PAYMENT DETAILS */}
                                <div className="order-info-sidebar">
                                    
                                    {/* SHIPPING INFO */}
                                    <div className="info-card">
                                        <h3><FiTruck /> Thông Tin Giao Hàng</h3>
                                        <div className="info-body">
                                            <p className="receiver-name">
                                                <strong>Người nhận:</strong> {orderData.shipping?.receiver || orderData.order?.fullname || "Quý khách"}
                                            </p>
                                            <p className="receiver-phone">
                                                <strong>Số điện thoại:</strong> {orderData.shipping?.phone || orderData.order?.phone || "N/A"}
                                            </p>
                                            <p className="receiver-address">
                                                <strong>Địa chỉ nhận hàng:</strong> {orderData.shipping?.address || orderData.order?.address || "N/A"}
                                            </p>
                                            {orderData.shipping?.note && (
                                                <p className="receiver-note">
                                                    <strong>Ghi chú:</strong> {orderData.shipping.note}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* PAYMENT INFO */}
                                    <div className="info-card">
                                        <h3><FiShield /> Thông Tin Thanh Toán</h3>
                                        <div className="info-body">
                                            <p>
                                                <strong>Phương thức:</strong>{" "}
                                                <span className="payment-method-tag">
                                                    {String(orderData.payment?.method || orderData.order?.payment_method || "COD").toUpperCase()}
                                                </span>
                                            </p>
                                            <p>
                                                <strong>Trạng thái thanh toán:</strong>{" "}
                                                <span className={`payment-status-tag ${String(orderData.payment?.status || orderData.order?.payment_status).toLowerCase() === "paid" ? "paid" : "unpaid"}`}>
                                                    {String(orderData.payment?.status || orderData.order?.payment_status).toLowerCase() === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* SUPPORT HELP BOX */}
                                    <div className="info-card support-card">
                                        <h3><FiPhone /> Cần Hỗ Trợ Đơn Hàng?</h3>
                                        <p>Đội ngũ Chăm sóc khách hàng Heritage Luxury luôn sẵn sàng hỗ trợ 24/7.</p>
                                        <a href="tel:19001234" className="btn-support">
                                            Hotline 1900 1234
                                        </a>
                                    </div>

                                    <div className="sidebar-actions">
                                        <Link to="/profile" className="btn-back-orders">
                                            <FiArrowLeft /> Quay về Đơn hàng của tôi
                                        </Link>
                                    </div>

                                </div>

                            </div>
                        </>
                    ) : null}

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default OrderDetail;
