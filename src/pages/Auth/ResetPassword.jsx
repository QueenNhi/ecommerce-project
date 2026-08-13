import { useState } from "react";
import { useSearchParams, useParams, useNavigate, Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { API_URL } from "../../config/api";
import "./ForgotPassword.css";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const params = useParams();
    const navigate = useNavigate();
    const token = searchParams.get("token") || params.token;

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            setError("Liên kết đặt lại mật khẩu không hợp lệ hoặc thiếu mã xác nhận (token).");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Mật khẩu xác nhận không trùng khớp.");
            return;
        }

        if (newPassword.length < 6) {
            setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const res = await fetch(`${API_URL}/api/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    newPassword
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate("/login");
                }, 2500);
            } else {
                setError(data.message || "Không thể cập nhật mật khẩu. Mã xác nhận có thể đã hết hạn.");
            }
        } catch (err) {
            console.error(err);
            setError("Lỗi kết nối máy chủ. Vui lòng thử lại sau.");
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
                    <h1>Thiết Lập Mật Khẩu Mới</h1>
                    <p className="auth-desc">
                        Vui lòng nhập mật khẩu mới bảo mật cao cho tài khoản của bạn.
                    </p>

                    {success && (
                        <div className="alert-box success-alert">
                            🎉 Mật khẩu đã đổi thành công! Đang chuyển hướng về trang đăng nhập...
                        </div>
                    )}
                    {error && <div className="alert-box error-alert">⚠️ {error}</div>}

                    {!success && (
                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label>Mật khẩu mới *</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div className="form-group">
                                <label>Xác nhận mật khẩu mới *</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button type="submit" className="auth-submit-btn" disabled={loading}>
                                {loading ? "ĐANG CẬP NHẬT..." : "LƯU MẬT KHẨU MỚI"}
                            </button>
                        </form>
                    )}

                    <div className="auth-footer-link">
                        Quay lại <Link to="/login">Đăng nhập</Link>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ResetPassword;
