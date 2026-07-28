import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "./ForgotPassword.css";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;

        try {
            setLoading(true);
            setMessage(null);
            setError(null);

            const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setMessage(data.message || "Đã gửi link đặt lại mật khẩu đến email của bạn.");
            } else {
                setError(data.message || "Không thể thực hiện yêu cầu.");
            }
        } catch (err) {
            console.error(err);
            setError("Lỗi kết nối máy chủ. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <div className="auth-flow-page">
                <div className="auth-flow-card">
                    <span className="auth-badge">LUXURY ACCOUNTS</span>
                    <h1>Quên Mật Khẩu</h1>
                    <p className="auth-desc">
                        Nhập địa chỉ email liên kết với tài khoản Heritage Luxury của bạn để nhận liên kết khôi phục mật khẩu.
                    </p>

                    {message && <div className="alert-box success-alert">✅ {message}</div>}
                    {error && <div className="alert-box error-alert">⚠️ {error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label>Địa chỉ Email *</label>
                            <input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="auth-submit-btn" disabled={loading}>
                            {loading ? "ĐANG GỬI EMAIL..." : "GỬI YÊU CẦU ĐẶT LẠI MẬT KHẨU"}
                        </button>
                    </form>

                    <div className="auth-footer-link">
                        Quay lại <Link to="/login">Đăng nhập</Link>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ForgotPassword;
