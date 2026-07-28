import "../../css/admin/AdminNavbar.css";
import { useAuth } from "../../context/AuthContext";
import {
    FiSearch,
    FiBell,
    FiHelpCircle
} from "react-icons/fi";

/** Avatar mặc định khi user không có ảnh */
const DEFAULT_AVATAR = "https://ui-avatars.com/api/?background=8b6b2d&color=fff&size=100&bold=true&name=";

const AdminNavbar = () => {

    const { user, roleName } = useAuth();

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

                <button className="navbar-icon" title="Thông báo">

                    <FiBell />

                    <span className="notification-dot"></span>

                </button>

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