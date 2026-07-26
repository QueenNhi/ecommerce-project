import AdminSidebar from "../components/admin/AdminSidebar";
import AdminNavbar from "../components/admin/AdminNavbar";

import "../css/layouts/AdminLayout.css";

const AdminLayout = ({ children }) => {
    return (
        <div className="admin-layout">

            <AdminSidebar />

            <div className="admin-main">

                <AdminNavbar />

                <div className="admin-content">

                    {children}

                </div>

            </div>

        </div>
    );
};

export default AdminLayout;