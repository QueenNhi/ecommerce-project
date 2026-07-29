import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config/api";
import "./Header.css";

const Header = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [cartCount, setCartCount] = useState(0);
    const [showMenu, setShowMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    const menuRef = useRef(null);

    const getCartCount = async () => {
        if (!user?.id) {
            setCartCount(0);
            return;
        }
        try {
            const res = await fetch(`${API_URL}/api/cart/count/${user.id}`);
            if (!res.ok) return; // Không crash nếu server lỗi
            const data = await res.json();
            setCartCount(data.count || 0);
        } catch (err) {
            // Im lặng - tránh spam console khi server chưa kết nối
            console.debug('Cart count fetch failed:', err.message);
        }
    };

    // Dùng user?.id thay vì user object để tránh vòng lặp vô hạn
    // khi user object được re-created mỗi render
    useEffect(() => {
        getCartCount();
    }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleLogout = () => {
        logout();
        setShowMenu(false);
        navigate("/login");
    };

    const getUserInitial = () => {
        if (!user) return "👤";
        if (user.fullname) return user.fullname.charAt(0).toUpperCase();
        if (user.email) return user.email.charAt(0).toUpperCase();
        return "👤";
    };

    return (
        <header className="main-header">
            <div className="header-inner">

                {/* HAMBURGER BUTTON FOR MOBILE */}
                <button
                    className="hamburger-btn"
                    onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                    aria-label="Toggle navigation"
                >
                    ☰
                </button>

                {/* LOGO */}
                <Link to="/" className="luxury-logo">
                    HERITAGE <span>LUXURY</span>
                </Link>

                {/* OVERLAY FOR MOBILE DRAWER */}
                {isMobileNavOpen && (
                    <div
                        className="mobile-nav-backdrop"
                        onClick={() => setIsMobileNavOpen(false)}
                    />
                )}

                {/* NAVIGATION LINKS (SLIDE-IN DRAWER ON MOBILE) */}
                <nav className={`main-nav ${isMobileNavOpen ? "drawer-open" : ""}`}>
                    <div className="drawer-header">
                        <Link to="/" className="drawer-logo" onClick={() => setIsMobileNavOpen(false)}>
                            HERITAGE <span>LUXURY</span>
                        </Link>
                        <button className="drawer-close-btn" onClick={() => setIsMobileNavOpen(false)}>
                            ✕
                        </button>
                    </div>

                    <Link to="/" onClick={() => setIsMobileNavOpen(false)}>Trang Chủ</Link>
                    <Link to="/products" onClick={() => setIsMobileNavOpen(false)}>Túi Xách</Link>
                    <Link to="/categories" onClick={() => setIsMobileNavOpen(false)}>Danh Mục</Link>
                    <Link to="/offers" onClick={() => setIsMobileNavOpen(false)}>Ưu Đãi</Link>
                    <Link to="/brands" onClick={() => setIsMobileNavOpen(false)}>Thương Hiệu</Link>
                </nav>

                {/* LIVE SEARCH & ACTIONS */}
                <div className="header-right">
                    
                    <form className="header-search-form" onSubmit={handleSearchSubmit}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm túi xách..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        <button type="submit">🔍</button>
                    </form>

                    {/* CART BUTTON */}
                    <Link to="/cart" className="cart-icon-btn">
                        🛒
                        {cartCount > 0 && <span className="cart-badge-count">{cartCount}</span>}
                    </Link>

                    {/* USER MENU */}
                    <div className="account-menu" ref={menuRef}>
                        <button className="user-icon-btn" onClick={() => setShowMenu(!showMenu)}>
                            {user?.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.fullname || "User"}
                                    style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                                />
                            ) : (
                                <span style={{ fontWeight: "700", fontSize: "14px" }}>{getUserInitial()}</span>
                            )}
                        </button>

                        {showMenu && (
                            <div className="account-dropdown">
                                {user ? (
                                    <>
                                        <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
                                            <div style={{ fontWeight: "700", color: "#0f172a", fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {user.fullname || user.email}
                                            </div>
                                            <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "600" }}>
                                                {(() => {
                                                    const r = user?.role ? String(user.role).toLowerCase() : "";
                                                    if (user?.isAdmin || r === "admin") return "Quản trị viên";
                                                    if (r === "manager") return "Quản lý";
                                                    return "Khách hàng";
                                                })()}
                                            </span>
                                        </div>

                                        <Link to="/profile" onClick={() => setShowMenu(false)}>
                                            📦 Đơn hàng & Hồ sơ
                                        </Link>

                                        {(() => {
                                            const r = user?.role ? String(user.role).toLowerCase() : "";
                                            const isAdmin = user?.isAdmin || user?.is_admin || r === "admin" || r === "manager";
                                            return isAdmin ? (
                                                <Link to="/admin" onClick={() => setShowMenu(false)}>
                                                    ⚡ Quản trị Admin
                                                </Link>
                                            ) : null;
                                        })()}

                                        <button onClick={handleLogout}>
                                            🚪 Đăng xuất
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/login" onClick={() => setShowMenu(false)}>
                                            🔑 Đăng nhập
                                        </Link>
                                        <Link to="/register" onClick={() => setShowMenu(false)}>
                                            📝 Đăng ký tài khoản
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                </div>

            </div>
        </header>
    );
};

export default Header;