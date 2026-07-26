import "../../css/admin/AdminSidebar.css";
import { NavLink, useNavigate } from "react-router-dom";

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
    FiLogOut
} from "react-icons/fi";

const AdminSidebar = () => {
    const navigate = useNavigate();

    const handleSignOut = () => {
        if (window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi hệ thống Admin?")) {
            localStorage.clear();
            sessionStorage.clear();
            navigate("/login");
        }
    };

    return (
        <aside className="admin-sidebar">

            {/* Logo */}
            <div className="sidebar-logo">
                <h2>Heritage Admin</h2>
                <span>Luxury Portfolio v1.0</span>
            </div>

            {/* Menu */}
            <ul className="sidebar-menu">

                <li>
                    <NavLink to="/admin" end>
                        <FiGrid />
                        <span>Dashboard</span>
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/admin/products">
                        <FiBox />
                        <span>Products</span>
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/admin/categories">
                        <FiLayers />
                        <span>Categories</span>
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/admin/brands">
                        <FiTag />
                        <span>Brands</span>
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/admin/orders">
                        <FiShoppingCart />
                        <span>Orders</span>
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/admin/customers">
                        <FiUsers />
                        <span>Customers</span>
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/admin/coupons">
                        <FiGift />
                        <span>Promotions</span>
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/admin/reviews">
                        <FiStar />
                        <span>Reviews</span>
                    </NavLink>
                </li>

            </ul>

            {/* Banner */}
            <div className="sidebar-banner">
                <button onClick={() => navigate("/admin/collections")}>NEW COLLECTION</button>
            </div>

            {/* Bottom */}
            <div className="sidebar-bottom">

                <NavLink className="bottom-item" to="/admin/settings">
                    <FiSettings />
                    <span>Settings</span>
                </NavLink>

                <div className="bottom-item" style={{ cursor: "pointer" }} onClick={handleSignOut}>
                    <FiLogOut />
                    <span>Sign Out</span>
                </div>

            </div>

        </aside>
    );
};

export default AdminSidebar;