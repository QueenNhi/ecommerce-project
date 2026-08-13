import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../../config/api";
import "./Login.css";

import { signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { auth, googleProvider } from "../../firebase";
import { useAuth } from "../../context/AuthContext";

const Login = () => {

    const navigate = useNavigate();
    const { login, loginWithGoogle } = useAuth();

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const isMobileDevice = () => {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) || (window.innerWidth <= 768 && 'ontouchstart' in window);
    };

    // Handle Firebase OAuth redirect result when returning on mobile devices
    useEffect(() => {
        let isMounted = true;
        const handleRedirectResult = async () => {
            try {
                const result = await getRedirectResult(auth);
                if (result && result.user && isMounted) {
                    setLoading(true);
                    const googleUser = await loginWithGoogle(result.user);
                    const redirectPath = getRedirectPath(googleUser);
                    window.location.href = redirectPath;
                }
            } catch (err) {
                console.error("Firebase Google Redirect Login Error:", err);
                if (isMounted) {
                    const code = err?.code || "auth/google-redirect-failed";
                    const message = err?.message || "Đăng nhập Google thất bại.";
                    setErrorMsg(`Lỗi Google Login [${code}]: ${message}`);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        handleRedirectResult();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
        setErrorMsg("");
    };

    // ============================
    // HELPER: xác định trang điến
    // admin | sale | warehouse → /admin
    // customer → /
    // ============================
    const getRedirectPath = (userData) => {
        const roleStr = userData?.role ? String(userData.role).toLowerCase().trim() : "";
        const isInternal =
            userData?.isAdmin ||
            userData?.is_admin ||
            roleStr === "admin" ||
            roleStr === "manager" ||
            roleStr === "sale" ||
            roleStr === "sales" ||
            roleStr === "warehouse" ||
            roleStr === "staff" ||
            roleStr === "support";
        return isInternal ? "/admin" : "/";
    };

    // ============================
    // LOGIN EMAIL
    // ============================
    const handleLogin = async (e) => {
        e.preventDefault();

        if (!form.email || !form.password) {
            setErrorMsg("Vui lòng nhập Email và Password.");
            return;
        }

        try {
            setLoading(true);
            setErrorMsg("");

            const res = await fetch(
                `${API_URL}/api/auth/login`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: form.email.trim(),
                        password: form.password
                    })
                }
            );

            const data = await res.json();

            if (data.success) {
                const userData = data.user;
                const tokenData = data.token;

                // Lưu vào localStorage
                try {
                    localStorage.setItem("user", JSON.stringify(userData));
                    if (tokenData) localStorage.setItem("token", tokenData);
                } catch (e) {
                    console.error("Error saving to localStorage:", e);
                }

                // Cập nhật context
                login(userData, tokenData);

                // Phân quyền điều hướng theo role
                const redirectPath = getRedirectPath(userData);

                // Dùng window.location.href để force reload,
                // đảm bảo AuthContext đọc lại từ localStorage
                window.location.href = redirectPath;

            } else {
                setErrorMsg(data.message || "Đăng nhập không thành công.");
            }

        } catch (err) {
            console.log(err);
            setErrorMsg("Không thể kết nối tới Server.");
        } finally {
            setLoading(false);
        }
    };

    // ============================
    // LOGIN GOOGLE
    // ============================
    const handleGoogleLogin = async () => {
        try {
            setErrorMsg("");
            setLoading(true);

            if (isMobileDevice()) {
                // Trên di động (iPhone/Safari, Android), dùng signInWithRedirect để tránh bị chặn popup
                await signInWithRedirect(auth, googleProvider);
            } else {
                // Trên Desktop (Windows, macOS, Linux), dùng signInWithPopup
                const result = await signInWithPopup(auth, googleProvider);
                if (result && result.user) {
                    const googleUser = await loginWithGoogle(result.user);
                    const redirectPath = getRedirectPath(googleUser);
                    window.location.href = redirectPath;
                }
            }
        } catch (err) {
            console.error("Firebase Google Login Error:", err);
            const code = err?.code || "auth/google-login-failed";
            const message = err?.message || "Đăng nhập bằng Google thất bại.";
            setErrorMsg(`Lỗi Google Login [${code}]: ${message}`);
        } finally {
            setLoading(false);
        }
    };

    return (

        <div className="login-page">

            <div className="login-container">

                {/* LEFT */}

                <div className="login-left">

                    <img
                        src="/images/login-banner.jpg"
                        alt="Luxury Handbags"
                    />

                    <div className="login-overlay">

                        <h2>LUXE HANDBAGS</h2>

                        <p>
                            Timeless Luxury • Since 2026
                        </p>

                    </div>

                </div>

                {/* RIGHT */}

                <div className="login-right">

                    <div className="login-box">

                        <div className="login-tabs">

                            <span className="active">
                                SIGN IN
                            </span>

                            <Link to="/register">
                                CREATE ACCOUNT
                            </Link>

                        </div>

                        <h1>Welcome Back</h1>

                        <p className="login-subtitle">
                            Sign in to your account and continue your luxury shopping experience.
                        </p>

                        {errorMsg && (
                            <div style={{ padding: "10px 14px", background: "#fee2e2", border: "1px solid #f87171", color: "#991b1b", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", fontWeight: "600" }}>
                                ⚠️ {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleLogin}>

                            <div className="login-group">

                                <label>Email</label>

                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={form.email}
                                    onChange={handleChange}
                                />

                            </div>

                            <div className="login-group">

                                <label>Password</label>

                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    value={form.password}
                                    onChange={handleChange}
                                />

                            </div>

                            <div className="login-options">

                                <label>

                                    <input
                                        type="checkbox"
                                    />

                                    Remember me

                                </label>

                                <Link to="/forgot-password">
                                    Forgot Password?
                                </Link>

                            </div>

                            <button
                                type="submit"
                                className="login-btn"
                            >

                                {
                                    loading
                                        ? "SIGNING IN..."
                                        : "SIGN IN"
                                }

                            </button>

                        </form>

                        <div className="divider">

                            <span>OR</span>

                        </div>

                        <div className="social-login">

                            <button
                                type="button"
                                className="google-btn"
                                onClick={handleGoogleLogin}
                            >
                                Continue with Google
                            </button>

                            <button
                                type="button"
                            >
                                Continue with Facebook
                            </button>

                        </div>

                        <div className="login-footer">

                            Don't have an account?

                            <Link to="/register">
                                Create Account
                            </Link>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

};

export default Login;