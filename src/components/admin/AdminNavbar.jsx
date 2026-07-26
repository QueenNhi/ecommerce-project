
import "../../css/admin/AdminNavbar.css";
import {
    FiSearch,
    FiBell,
    FiHelpCircle
} from "react-icons/fi";

const AdminNavbar = () => {

    return (

        <header className="admin-navbar">

            {/* Search */}

            <div className="navbar-search">

                <FiSearch />

                <input
                    type="text"
                    placeholder="Search archives..."
                />

            </div>

            {/* Right */}

            <div className="navbar-right">

                <button className="navbar-icon">

                    <FiBell />

                    <span className="notification-dot"></span>

                </button>

                <button className="navbar-icon">

                    <FiHelpCircle />

                </button>

                <div className="admin-profile">

                    <div className="admin-info">

                        <h4>Julian Heritage</h4>

                        <span>Chief Curator</span>

                    </div>

                    <img
                        src="https://i.pravatar.cc/100"
                        alt="admin"
                    />

                </div>

            </div>

        </header>

    );

};

export default AdminNavbar;