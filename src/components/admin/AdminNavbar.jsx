import "../../css/admin/AdminNavbar.css";
import { useAuth } from "../../context/AuthContext";
import {
    FiSearch,
    FiBell,
    FiHelpCircle
} from "react-icons/fi";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config/api"; // Added for fetching

// ... inside AdminNavbar component ...
const DEFAULT_AVATAR = "https://ui-avatars.com/api/?background=8b6b2d&color=fff&size=100&bold=true&name=";

const AdminNavbar = () => {

    const { user, roleName } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);

    // Fetch Notifications
    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/api/admin/notifications`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount || 0); // Lấy trực tiếp từ API
            }
        } catch (err) {
            console.error("Lỗi load thông báo:", err);
        }
    };

    useEffect(() => {
        // Gọi lần đầu
        fetchNotifications();
        
        // Polling định kỳ 15s để đồng bộ mượt mà
        const interval = setInterval(fetchNotifications, 15000); 
        
        // Lấy thông báo ngay khi Admin quay lại tab (Focus)
        const handleFocus = () => fetchNotifications();
        window.addEventListener("focus", handleFocus);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener("focus", handleFocus);
        };
    }, []);

    const handleNotificationClick = async (notif) => {
        try {
            const token = localStorage.getItem("token");
            if (!notif.isRead) {
                await fetch(`${API_URL}/api/admin/notifications/${notif.id}/read`, {
                    method: "PUT",
                    headers: { "Authorization": `Bearer ${token}` }
                });
                setNotifications(prev => 
                    prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1)); // Giảm badge đỏ ngay
            }
            setShowDropdown(false);
            
            switch (notif.type) {
                case 'new_order':
                    navigate(`/admin/orders/${notif.reference_id || ''}`);
                    break;
                case 'new_review':
                    navigate(`/admin/reviews`);
                    break;
                case 'support_ticket':
                    navigate(`/admin/customers`);
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.error("Lỗi cập nhật thông báo:", error);
        }
    };

    // Lấy tên hiển thị — ưu tiên fullname → name → email prefix
    const displayName =
        user?.fullname ||
        user?.full_name ||
        user?.name ||
        user?.username ||
        user?.email?.split("@")[0] ||
        "Quản trị viên";

    // Avatar: ưu tiên avatar user → fallback UI Avatars với tên
    const avatarSrc =
        user?.avatar ||
        user?.photoURL ||
        user?.photo_url ||
        `${DEFAULT_AVATAR}${encodeURIComponent(displayName)}`;

    return (

        <header className="admin-navbar">

            {/* Search */}

            <div className="navbar-search">

                <FiSearch />

                <input
                    type="text"
                    placeholder="Tìm kiếm..."
                />

            </div>

            {/* Right */}

            <div className="navbar-right">

                <div className="navbar-icon-wrapper" style={{ position: "relative" }}>
                    <button 
                        className="navbar-icon" 
                        title="Thông báo" 
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <FiBell />
                        {unreadCount > 0 && <span className="notification-dot"></span>}
                    </button>
                    {showDropdown && (
                        <div className="notification-dropdown" style={{
                            position: "absolute", top: "45px", right: "-10px", width: "300px", 
                            background: "#fff", border: "1px solid #ddd", borderRadius: "8px", 
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 1000
                        }}>
                            <h4 style={{ padding: "12px", margin: 0, borderBottom: "1px solid #eee", fontSize: "15px" }}>Thông báo mới</h4>
                            <div className="notification-list" style={{ maxHeight: "300px", overflowY: "auto" }}>
                                {notifications.length === 0 ? (
                                    <p style={{ padding: "15px", textAlign: "center", color: "#666", fontSize: "14px" }}>Không có thông báo mới.</p>
                                ) : (
                                    notifications.map(n => (
                                        <div 
                                            key={n.id} 
                                            style={{ 
                                                padding: "12px", cursor: "pointer", borderBottom: "1px solid #f5f6fa",
                                                backgroundColor: !n.isRead ? "#f0f8ff" : "#fff" 
                                            }}
                                            onClick={() => handleNotificationClick(n)}
                                        >
                                            <p style={{ margin: "0 0 5px 0", fontSize: "13.5px", fontWeight: !n.isRead ? "600" : "400", color: "#333" }}>{n.message}</p>
                                            <small style={{ color: "#888", fontSize: "12px" }}>
                                                {new Date(n.created_at).toLocaleString("vi-VN")}
                                            </small>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <button className="navbar-icon" title="Trợ giúp">

                    <FiHelpCircle />

                </button>

                <div className="admin-profile">

                    <div className="admin-info">

                        <h4>{displayName}</h4>

                        <span>{roleName}</span>

                    </div>

                    <img
                        src={avatarSrc}
                        alt={displayName}
                        onError={(e) => {
                            // Fallback nếu avatar URL bị lỗi
                            e.target.onerror = null;
                            e.target.src = `${DEFAULT_AVATAR}${encodeURIComponent(displayName)}`;
                        }}
                    />

                </div>

            </div>

        </header>

    );

};

export default AdminNavbar;