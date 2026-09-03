import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";
import { API_URL, UPLOADS_URL } from "../../config/api";
import { validateCoupon } from "../../services/couponService";
import "./Checkout.css";

const Checkout = () => {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const userId = user?.id;

    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // State quản lý Mã giảm giá (Coupon)
    const [couponCode, setCouponCode] = useState("");
    const [discount, setDiscount] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState("");
    const [validatingCoupon, setValidatingCoupon] = useState(false);

    const [form, setForm] = useState({
        fullName: user?.fullname || "",
        phone: "",
        email: user?.email || "",
        province: "",
        district: "",
        ward: "",
        address: "",
        payment: "cod"
    });

    useEffect(() => {
        if (user) {
            setForm(prev => ({
                ...prev,
                fullName: prev.fullName || user.fullname || "",
                email: prev.email || user.email || ""
            }));
        }
    }, [user]);

    useEffect(() => {
        fetch(`${API_URL}/api/cart/${userId}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setCartItems(data);
                } else {
                    setCartItems([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Fetch cart error:", err);
                setCartItems([]);
                setLoading(false);
            });
    }, [userId]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const subtotal = cartItems.reduce(
        (total, item) => total + Number(item.price) * Number(item.quantity),
        0
    );
    const shipping = 0;
    const total = Math.max(0, subtotal + shipping - discount);

    // Xử lý áp dụng mã giảm giá
    const handleApplyCoupon = async (e) => {
        if (e) e.preventDefault();
        if (!couponCode.trim()) {
            setCouponError("Vui lòng nhập mã giảm giá.");
            return;
        }

        try {
            setValidatingCoupon(true);
            setCouponError("");

            const result = await validateCoupon(couponCode, subtotal, userId);
            if (result.success && result.coupon) {
                const discountVal = Number(result.coupon.calculatedDiscount || result.coupon.discount || 0);
                setDiscount(discountVal);
                setAppliedCoupon(result.coupon);
                setCouponError("");
            } else {
                setCouponError(result.message || "Mã giảm giá không hợp lệ.");
                setDiscount(0);
                setAppliedCoupon(null);
            }
        } catch (err) {
            console.error("Apply coupon error:", err);
            setCouponError("Lỗi kết nối khi kiểm tra mã giảm giá.");
        } finally {
            setValidatingCoupon(false);
        }
    };

    // Xử lý bỏ áp dụng mã giảm giá
    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setDiscount(0);
        setCouponCode("");
        setCouponError("");
    };

    const handleOrder = async () => {
        // ⛔ Kiểm tra đăng nhập trước khi thực hiện thanh toán
        if (!user || !userId) {
            alert("Bạn cần đăng nhập để tiếp tục mua hàng.");
            navigate("/login", { state: { message: "Vui lòng đăng nhập để tiếp tục mua hàng.", from: "/checkout" } });
            return;
        }

        if (!form.fullName || !form.phone || !form.address) {
            alert("Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ giao hàng.");
            return;
        }

        if (cartItems.length === 0) {
            alert("Giỏ hàng của bạn đang trống.");
            return;
        }

        try {
            setSubmitting(true);

            const fullAddress = [form.address, form.ward, form.district, form.province]
                .filter(Boolean)
                .join(", ");

            const response = await fetch(`${API_URL}/api/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    user_id: userId,
                    fullname: form.fullName,
                    phone: form.phone,
                    email: form.email,
                    address: fullAddress,
                    payment_method: form.payment,
                    note: "",
                    discount: discount,
                    discount_amount: discount,
                    coupon_code: appliedCoupon?.code || "",
                    total: total
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                const orderId = data.orderId;

                // Handles VNPAY payment redirect
                if (form.payment === "vnpay") {
                    const vnpRes = await fetch(`${API_URL}/api/payment/vnpay_create_url`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            orderId,
                            amount: total
                        })
                    });

                    const vnpData = await vnpRes.json();
                    if (vnpRes.ok && vnpData.paymentUrl) {
                        window.location.href = vnpData.paymentUrl;
                        return;
                    } else {
                        alert("Không thể kết nối cổng VNPAY: " + (vnpData.message || "Vui lòng thử lại"));
                    }
                }

                alert("🎉 Đặt hàng thành công!");
                navigate(`/order-success/${orderId}`);
            } else {
                alert(data.message || "Đặt hàng thất bại. Vui lòng thử lại.");
            }
        } catch (err) {
            console.error("Order submit error:", err);
            alert("Lỗi kết nối server.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Header />
            <div className="checkout-page">
                <div className="checkout-container">
                    {/* LEFT FORM */}
                    <div className="checkout-left">
                        <h1>Checkout</h1>

                        <div className="checkout-card">
                            <h3>Thông tin khách hàng</h3>
                            <div className="checkout-form">
                                <input
                                    type="text"
                                    placeholder="Họ và tên *"
                                    name="fullName"
                                    value={form.fullName}
                                    onChange={handleChange}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Số điện thoại *"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    required
                                />
                                <input
                                    type="email"
                                    placeholder="Email nhận thông báo *"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="checkout-card">
                            <h3>Địa chỉ giao hàng</h3>
                            <div className="checkout-form">
                                <input
                                    type="text"
                                    placeholder="Tỉnh / Thành phố"
                                    name="province"
                                    value={form.province}
                                    onChange={handleChange}
                                />
                                <input
                                    type="text"
                                    placeholder="Quận / Huyện"
                                    name="district"
                                    value={form.district}
                                    onChange={handleChange}
                                />
                                <input
                                    type="text"
                                    placeholder="Phường / Xã"
                                    name="ward"
                                    value={form.ward}
                                    onChange={handleChange}
                                />
                                <textarea
                                    rows="3"
                                    placeholder="Địa chỉ chi tiết (Số nhà, tên đường...) *"
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="checkout-card">
                            <h3>Phương thức thanh toán</h3>
                            <div className="payment-method">
                                <label className={`payment-option ${form.payment === "cod" ? "active" : ""}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="cod"
                                        checked={form.payment === "cod"}
                                        onChange={handleChange}
                                    />
                                    <div className="option-info">
                                        <strong>💵 Thanh toán khi nhận hàng (COD)</strong>
                                        <span>Thanh toán tiền mặt trực tiếp cho shipper khi nhận hàng</span>
                                    </div>
                                </label>

                                <label className={`payment-option ${form.payment === "vnpay" ? "active" : ""}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="vnpay"
                                        checked={form.payment === "vnpay"}
                                        onChange={handleChange}
                                    />
                                    <div className="option-info">
                                        <strong>💳 Cổng thanh toán VNPAY (QR / ATM / Visa)</strong>
                                        <span>Thanh toán an toàn qua cổng ngân hàng VNPAY Sandbox</span>
                                    </div>
                                </label>

                                <label className={`payment-option ${form.payment === "bank_transfer" ? "active" : ""}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="bank_transfer"
                                        checked={form.payment === "bank_transfer"}
                                        onChange={handleChange}
                                    />
                                    <div className="option-info">
                                        <strong>🏦 Chuyển khoản Ngân hàng (VietQR)</strong>
                                        <span>Quét mã QR Chuyển khoản bằng ứng dụng ngân hàng bất kỳ</span>
                                    </div>
                                </label>
                            </div>

                            {/* BANK TRANSFER QR CODE BOX */}
                            {form.payment === "bank_transfer" && (
                                <div className="bank-details-box">
                                    <div className="qr-container">
                                        <img
                                            src={`https://img.vietqr.io/image/MB-0987654321-compact2.png?amount=${total}&addInfo=HERITAGE%20LX&accountName=HERITAGE%20LUXURY`}
                                            alt="VietQR Heritage Banking"
                                            className="vietqr-img"
                                        />
                                    </div>
                                    <div className="bank-info-rows">
                                        <p><strong>Ngân hàng:</strong> MB Bank (Ngân hàng Quân Đội)</p>
                                        <p><strong>Số tài khoản:</strong> <span className="copy-text">0987654321</span></p>
                                        <p><strong>Chủ tài khoản:</strong> HERITAGE LUXURY</p>
                                        <p><strong>Số tiền:</strong> <span className="highlight-price">{total.toLocaleString("vi-VN")} ₫</span></p>
                                        <p className="transfer-note-alert">
                                            📌 <strong>Nội dung chuyển khoản:</strong> HERITAGE LX-[Mã đơn hàng]
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            className="place-order-btn"
                            onClick={handleOrder}
                            disabled={submitting}
                        >
                            {submitting ? "ĐANG XỬ LÝ..." : (form.payment === "vnpay" ? "THANH TOÁN QUA VNPAY" : "XÁC NHẬN ĐẶT HÀNG")}
                        </button>
                    </div>

                    {/* RIGHT ORDER SUMMARY */}
                    <aside className="checkout-right">
                        <div className="order-summary">
                            <h2>Đơn hàng của bạn</h2>

                            {loading ? (
                                <div className="loading">Đang tải...</div>
                            ) : cartItems.length === 0 ? (
                                <p style={{ color: "#666" }}>Giỏ hàng đang trống</p>
                            ) : (
                                <>
                                    <div className="checkout-products">
                                        {cartItems.map(item => (
                                            <div className="checkout-item" key={item.id}>
                                                <div className="checkout-image">
                                                    <img
                                                        src={`${UPLOADS_URL}/${item.image_url}`}
                                                        alt={item.name}
                                                    />
                                                </div>
                                                <div className="checkout-info">
                                                    <h4>{item.name}</h4>
                                                    {item.color_name && <p>Màu: {item.color_name}</p>}
                                                    {item.size_name && <p>Size: {item.size_name}</p>}
                                                    <p>Số lượng: {item.quantity}</p>
                                                </div>
                                                <div className="checkout-price">
                                                    {(Number(item.price) * Number(item.quantity)).toLocaleString("vi-VN")}₫
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                     {/* Ô NHẬP MÃ GIẢM GIÁ (COUPON) */}
                                     <div className="checkout-coupon-box">
                                         <label className="coupon-box-title">Mã giảm giá (Coupon)</label>
                                         <div className="coupon-input-group">
                                             <input
                                                 type="text"
                                                 className="coupon-input"
                                                 placeholder="Nhập mã ưu đãi..."
                                                 value={couponCode}
                                                 onChange={(e) => {
                                                     setCouponCode(e.target.value);
                                                     setCouponError("");
                                                 }}
                                                 disabled={!!appliedCoupon || validatingCoupon}
                                                 onKeyDown={(e) => {
                                                     if (e.key === "Enter") {
                                                         e.preventDefault();
                                                         if (!appliedCoupon) handleApplyCoupon();
                                                     }
                                                 }}
                                             />
                                             {appliedCoupon ? (
                                                 <button
                                                     type="button"
                                                     className="coupon-btn coupon-remove-btn"
                                                     onClick={handleRemoveCoupon}
                                                 >
                                                     Bỏ áp dụng
                                                 </button>
                                             ) : (
                                                 <button
                                                     type="button"
                                                     className="coupon-btn coupon-apply-btn"
                                                     onClick={handleApplyCoupon}
                                                     disabled={validatingCoupon || !couponCode.trim()}
                                                 >
                                                     {validatingCoupon ? "XỬ LÝ..." : "Áp dụng"}
                                                 </button>
                                             )}
                                         </div>
                                         {couponError && <p className="coupon-msg coupon-error-msg">⚠️ {couponError}</p>}
                                         {appliedCoupon && (
                                             <p className="coupon-msg coupon-success-msg">
                                                 🎉 Đã áp dụng mã <strong>{appliedCoupon.code}</strong> (-{discount.toLocaleString("vi-VN")}₫)
                                             </p>
                                         )}
                                     </div>

                                     <div className="summary-row">
                                         <span>Tạm tính</span>
                                         <span>{subtotal.toLocaleString("vi-VN")}₫</span>
                                     </div>
                                     {discount > 0 && (
                                         <div className="summary-row discount-row">
                                             <span>Mã giảm giá ({appliedCoupon?.code})</span>
                                             <span className="discount-amount-text">-{discount.toLocaleString("vi-VN")}₫</span>
                                         </div>
                                     )}
                                     <div className="summary-row">
                                         <span>Phí vận chuyển</span>
                                         <span>Miễn phí</span>
                                     </div>
                                     <hr />
                                    <div className="summary-total">
                                        <span>Tổng cộng</span>
                                        <span>{total.toLocaleString("vi-VN")}₫</span>
                                    </div>

                                    <button
                                        className="checkout-btn"
                                        onClick={handleOrder}
                                        disabled={submitting}
                                    >
                                        {submitting ? "ĐANG XỬ LÝ..." : (form.payment === "vnpay" ? "THANH TOÁN VNPAY" : "THANH TOÁN")}
                                    </button>

                                    <p className="checkout-note">
                                        Thanh toán bảo mật SSL.<br />
                                        Miễn phí vận chuyển & Hộp quà Luxury.
                                    </p>
                                </>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Checkout;