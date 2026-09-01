import { useEffect } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminNavbar from "../components/admin/AdminNavbar";

import "../css/layouts/AdminLayout.css";

const AdminLayout = ({ children }) => {
    // Xóa padding-top của body (được set ở index.css cho trang chủ) khi vào trang Admin
    useEffect(() => {
        document.body.classList.add("admin-body-active");
        return () => {
            document.body.classList.remove("admin-body-active");
        };
    }, []);

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