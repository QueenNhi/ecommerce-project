import "../../css/admin/AdminSidebar.css";
import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { API_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";

import {
    FiGrid,
    FiBox,
    FiLayers,
    FiTag,
    FiShoppingCart,
    FiUsers,
    FiGift,
    FiStar,
    FiSettings,
    FiLogOut,
    FiPackage,
    FiBriefcase,
    FiArchive
} from "react-icons/fi";

const AdminSidebar = () => {
    const navigate = useNavigate();
    const { user, isAdmin, isSalesStaff, isWarehouseStaff, roleName, logout } = useAuth();

    // Lấy tên hiển thị
    const displayName =
        user?.fullname ||
        user?.full_name ||
        user?.name ||
        user?.username ||
        user?.email?.split("@")[0] ||
        "Admin";

    // Avatar fallback
    const DEFAULT_AVATAR = `https://ui-avatars.com/api/?background=8b6b2d&color=fff&size=80&bold=true&name=${encodeURIComponent(displayName)}`;
    const avatarSrc = user?.avatar || user?.photoURL || user?.photo_url || DEFAULT_AVATAR;

    const handleSignOut = () => {
        if (window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?")) {
            logout();
            navigate("/login");
        }
    };

    // ====================================================
    // Notification Polling for Sidebar Red Dots
    // ====================================================
    const [unreadCounts, setUnreadCounts] = useState({ orders: 0, reviews: 0 });

    useEffect(() => {
        const fetchSidebarCounts = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${API_URL}/api/admin/notifications`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await res.json();
                
                if (data.success && data.notifications) {
                    const unreadList = data.notifications.filter(n => !n.isRead);
                    setUnreadCounts({
                        orders: unreadList.filter(n => n.type === 'new_order').length,
                        reviews: unreadList.filter(n => n.type === 'new_review').length
                    });
                }
            } catch (err) { }
        };

        fetchSidebarCounts();
        const interval = setInterval(fetchSidebarCounts, 30000); // 30s polling
        return () => clearInterval(interval);
    }, []);

    // ====================================================
    // Định nghĩa menu với phân quyền
    // canAccess: admin | sales | warehouse
    // ====================================================
    const menuItems = [
        {
            to: "/admin",
            end: true,
            icon: <FiGrid />,
            label: "Dashboard",
            canAccess: isAdmin || isSalesStaff || isWarehouseStaff,
        },
        {
            to: "/admin/products",
            icon: <FiBox />,
            label: "Products",
            canAccess: isAdmin || isWarehouseStaff,
        },
        {
            to: "/admin/inventory",
            icon: <FiArchive />,
            label: "Inventory",
            canAccess: isAdmin || isWarehouseStaff,
        },
        {
            to: "/admin/categories",
            icon: <FiLayers />,
            label: "Categories",
            canAccess: isAdmin || isWarehouseStaff,
        },
        {
            to: "/admin/brands",
            icon: <FiTag />,
            label: "Brands",
            canAccess: isAdmin,
        },
        {
            to: "/admin/orders",
            icon: <FiShoppingCart />,
            label: "Orders",
            canAccess: isAdmin || isSalesStaff || isWarehouseStaff,
            hasUnread: unreadCounts.orders > 0
        },
        {
            to: "/admin/customers",
            icon: <FiUsers />,
            label: "Customers",
            canAccess: isAdmin || isSalesStaff,
        },
        {
            to: "/admin/staff",
            icon: <FiBriefcase />,
            label: "Staff Management",
            canAccess: isAdmin,
        },
        {
            to: "/admin/coupons",
            icon: <FiGift />,
            label: "Promotions",
            canAccess: isAdmin,
        },
        {
            to: "/admin/reviews",
            icon: <FiStar />,
            label: "Reviews",
            canAccess: isAdmin || isSalesStaff,
            hasUnread: unreadCounts.reviews > 0
        },
        {
            to: "/admin/collections",
            icon: <FiPackage />,
            label: "New Collection",
            badge: "NEW",
            canAccess: isAdmin,
        },
    ];

    return (
        <aside className="admin-sidebar">

            {/* Logo */}
            <div className="sidebar-logo">
                <h2>Heritage Admin</h2>
                <span>Luxury Portfolio v1.0</span>
            </div>

            {/* User Profile Card trong Sidebar */}
            <div className="sidebar-user">
                <img
                    src={avatarSrc}
                    alt={displayName}
                    className="sidebar-user-avatar"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_AVATAR;
                    }}
                />
                <div className="sidebar-user-info">
                    <p className="sidebar-user-name">{displayName}</p>
                    <span className="sidebar-user-role">{roleName}</span>
                </div>
            </div>

            {/* Menu */}
            <ul className="sidebar-menu">
                {menuItems
                    .filter((item) => item.canAccess)
                    .map((item) => (
                        <li key={item.to}>
                            <NavLink to={item.to} end={item.end}>
                                {item.icon}
                                <span>{item.label}</span>
                                {item.badge && (
                                    <span className="sidebar-badge">{item.badge}</span>
                                )}
                                {item.hasUnread && (
                                    <span style={{
                                        width: "8px",
                                        height: "8px",
                                        backgroundColor: "red",
                                        borderRadius: "50%",
                                        marginLeft: "auto",
                                        flexShrink: 0
                                    }}></span>
                                )}
                            </NavLink>
                        </li>
                    ))}
            </ul>

            {/* Bottom */}
            <div className="sidebar-bottom">

                {isAdmin && (
                    <NavLink className="bottom-item" to="/admin/settings">
                        <FiSettings />
                        <span>Settings</span>
                    </NavLink>
                )}

                <div
                    className="bottom-item bottom-item--signout"
                    onClick={handleSignOut}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && handleSignOut()}
                >
                    <FiLogOut />
                    <span>Sign Out</span>
                </div>

            </div>

        </aside>
    );
};

export default AdminSidebar;