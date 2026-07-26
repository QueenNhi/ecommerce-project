import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";
import "./Checkout.css";

const Checkout = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const userId = user?.id || 1;

    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

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
        fetch(`http://localhost:5000/api/cart/${userId}`)
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
    const total = subtotal + shipping;

    const handleOrder = async () => {
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

            const response = await fetch("http://localhost:5000/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id: userId,
                    fullname: form.fullName,
                    phone: form.phone,
                    email: form.email,
                    address: fullAddress,
                    payment_method: form.payment,
                    note: ""
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert("🎉 Đặt hàng thành công!");
                navigate(`/order-success/${data.orderId}`);
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
                                    placeholder="Email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
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
                                <label>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="cod"
                                        checked={form.payment === "cod"}
                                        onChange={handleChange}
                                    />
                                    Thanh toán khi nhận hàng (COD)
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="bank"
                                        checked={form.payment === "bank"}
                                        onChange={handleChange}
                                    />
                                    Chuyển khoản ngân hàng
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="vnpay"
                                        checked={form.payment === "vnpay"}
                                        onChange={handleChange}
                                    />
                                    VNPay
                                </label>
                            </div>
                        </div>

                        <button
                            className="place-order-btn"
                            onClick={handleOrder}
                            disabled={submitting}
                        >
                            {submitting ? "ĐANG XỬ LÝ..." : "ĐẶT HÀNG"}
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
                                                        src={`http://localhost:5000/uploads/${item.image_url}`}
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

                                    <div className="summary-row">
                                        <span>Tạm tính</span>
                                        <span>{subtotal.toLocaleString("vi-VN")}₫</span>
                                    </div>
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
                                        {submitting ? "ĐANG XỬ LÝ..." : "THANH TOÁN"}
                                    </button>

                                    <p className="checkout-note">
                                        Thanh toán bảo mật.<br />
                                        Miễn phí đổi trả trong vòng 30 ngày.
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