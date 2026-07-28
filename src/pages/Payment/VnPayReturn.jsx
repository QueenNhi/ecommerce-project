import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { FiCheckCircle, FiXCircle, FiShoppingBag, FiArrowRight } from "react-icons/fi";
import "./VnPayReturn.css";

const VnPayReturn = () => {
    const [searchParams] = useSearchParams();
    const responseCode = searchParams.get("vnp_ResponseCode");
    const orderId = searchParams.get("orderId");

    const isSuccess = responseCode === "00";

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <Header />
            <div className="vnpay-return-page">
                <div className="vnpay-card">
                    {isSuccess ? (
                        <>
                            <div className="status-icon success-icon">
                                <FiCheckCircle />
                            </div>
                            <span className="vnp-badge success-badge">THANH TOÁN THÀNH CÔNG</span>
                            <h1>Thanh Toán VNPAY Hoàn Tất</h1>
                            <p className="vnp-message">
                                Cảm ơn quý khách! Giao dịch thanh toán cho đơn hàng <strong>#{orderId || "Mới"}</strong> qua cổng VNPAY đã được xác nhận thành công.
                            </p>
                            <div className="vnp-details">
                                <div className="detail-row">
                                    <span>Mã đơn hàng:</span>
                                    <strong>#{orderId}</strong>
                                </div>
                                <div className="detail-row">
                                    <span>Cổng thanh toán:</span>
                                    <strong>VNPAY Sandbox (QR / ATM / International Card)</strong>
                                </div>
                                <div className="detail-row">
                                    <span>Trạng thái thanh toán:</span>
                                    <strong style={{ color: "#16a34a" }}>ĐÃ THANH TOÁN (PAID)</strong>
                                </div>
                            </div>
                            <div className="vnp-actions">
                                <Link to={`/order-success/${orderId}`} className="vnp-btn primary">
                                    Xem Đơn Hàng <FiArrowRight />
                                </Link>
                                <Link to="/products" className="vnp-btn outline">
                                    Tiếp Tục Mua Sắm <FiShoppingBag />
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="status-icon fail-icon">
                                <FiXCircle />
                            </div>
                            <span className="vnp-badge fail-badge">THANH TOÁN KHÔNG THÀNH CÔNG</span>
                            <h1>Thanh Toán VNPAY Thất Bại</h1>
                            <p className="vnp-message">
                                Giao dịch đã bị hủy hoặc không thành công (Mã lỗi: {responseCode || "99"}). Đơn hàng của bạn hiện ở trạng thái chờ thanh toán.
                            </p>
                            <div className="vnp-actions">
                                <Link to="/checkout" className="vnp-btn primary">
                                    Thử Thanh Toán Lại
                                </Link>
                                <Link to="/" className="vnp-btn outline">
                                    Quay Về Trang Chủ
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default VnPayReturn;
