import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "../context/AuthContext";

import App from "../App";
import ProductDetail from "../pages/ProductDetail/ProductDetail";
import Cart from "../pages/Cart/Cart";
import Dashboard from "../pages/Admin/Dashboard";
import Products from "../pages/Products/Products";
import AdminProducts from "../pages/Admin/Products/Products";
import Categories from "../pages/Categories/Categories";
import AdminCategories from "../pages/Admin/AdminCategories/Categories";
import Checkout from "../pages/CheckOut/Checkout";
import Register from "../pages/Register/Register";
import Login from "../pages/Login/Login";
import Brands from "../pages/Admin/Brands/Brands";
import AdminOrders from "../pages/Admin/Orders";
import Promotions from "../pages/Admin/Promotions";
import Reviews from "../pages/Admin/Reviews";
import AdminCustomers from "../pages/Admin/Users";
import AdminSettings from "../pages/Admin/Settings";
import Collections from "../pages/Admin/Collections";
import AdminStaff from "../pages/Admin/Staff/Staff";

// Client Pages
import Offers from "../pages/Offers/Offers";
import BrandsPage from "../pages/Brands/BrandsPage";
import Account from "../pages/Account/Account";

import NotFound from "../pages/NotFound/NotFound";
import OrderSuccess from "../pages/OrderSuccess/OrderSuccess";
import VnPayReturn from "../pages/Payment/VnPayReturn";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";

// ============================================================
// ROUTE GUARDS
// ============================================================

/**
 * PrivateRoute — Yêu cầu đăng nhập.
 * Chặn Guest (chưa đăng nhập) → redirect /login
 * Dùng cho: /checkout, /profile, /account, /orders
 */
const PrivateRoute = ({ children }) => {
    const { user } = useAuth();

    // Fallback đọc từ localStorage nếu context chưa hydrate kịp
    let currentUser = user;
    if (!currentUser) {
        try {
            const saved = localStorage.getItem("user");
            if (saved) currentUser = JSON.parse(saved);
        } catch (e) {
            console.error("PrivateRoute: Error reading user from localStorage:", e);
        }
    }

    if (!currentUser) {
        return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
    }

    return children;
};

/**
 * Helper: đọc và phân tích user từ localStorage (fallback khi context chưa hydrate)
 */
const _getUserFromStorage = () => {
    try {
        const saved = localStorage.getItem("user");
        return saved ? JSON.parse(saved) : null;
    } catch {
        return null;
    }
};

/**
 * Helper: tính toán các RBAC flags từ user object (không dùng context)
 */
const _computeFlags = (u) => {
    if (!u) return { isAdmin: false, isInternal: false };
    const r = String(u.role || "").toLowerCase().trim();
    const isAdmin = !!(u.isAdmin || u.is_admin || r === "admin" || r === "manager");
    const isInternal = isAdmin || r === "sale" || r === "sales" || r === "warehouse" || r === "staff" || r === "support";
    return { isAdmin, isInternal };
};

/**
 * AdminRoute — Chỉ cho phép Admin / Manager (toàn quyền).
 * Nếu chưa đăng nhập → /login
 * Nếu đã đăng nhập nhưng không phải Admin → /admin (có thể là sale/warehouse)
 */
const AdminRoute = ({ children }) => {
    const { user, isAdmin } = useAuth();

    let currentUser = user;
    let currentIsAdmin = isAdmin;

    if (!currentUser) {
        currentUser = _getUserFromStorage();
        currentIsAdmin = _computeFlags(currentUser).isAdmin;
    }

    if (!currentUser) return <Navigate to="/login" replace />;
    if (!currentIsAdmin) return <Navigate to="/" replace />;

    return children;
};

/**
 * InternalRoute — Cho phép Admin + Staff nội bộ (sale, warehouse, ...).
 * Là gate chính cho khu vực /admin.
 * Nếu chưa đăng nhập → /login
 * Nếu là customer → / (trang chủ)
 */
const InternalRoute = ({ children }) => {
    const { user, isInternalUser } = useAuth();

    let currentUser = user;
    let canAccess = isInternalUser;

    if (!currentUser) {
        currentUser = _getUserFromStorage();
        canAccess = _computeFlags(currentUser).isInternal;
    }

    if (!currentUser) return <Navigate to="/login" replace />;
    if (!canAccess) return <Navigate to="/" replace />;

    return children;
};

/**
 * StaffRoute — Admin + Sale + Warehouse.
 * Dùng cho các trang mà cả sale và warehouse đều được phép.
 * Nếu customer cố truy cập → /
 */
const StaffRoute = ({ children }) => {
    const { user, isAdmin, isStaff } = useAuth();

    let currentUser = user;
    let canAccess = isAdmin || isStaff;

    if (!currentUser) {
        currentUser = _getUserFromStorage();
        const { isAdmin: _ia, isInternal: _ii } = _computeFlags(currentUser);
        canAccess = _ii; // sale + warehouse + admin
    }

    if (!currentUser) return <Navigate to="/login" replace />;
    if (!canAccess) return <Navigate to="/" replace />;

    return children;
};

// ============================================================
// APP ROUTES
// ============================================================

function AppRoutes() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* ── Trang chủ & Public Pages ── */}
                    <Route path="/" element={<App />} />

                    {/* Sản phẩm & danh mục — Guest được xem */}
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/categories/:id" element={<Categories />} />
                    <Route path="/offers" element={<Offers />} />
                    <Route path="/promotions" element={<Offers />} />
                    <Route path="/brands" element={<BrandsPage />} />

                    {/* Giỏ hàng — Guest có thể xem giỏ, nhưng checkout yêu cầu đăng nhập */}
                    <Route path="/cart" element={<Cart />} />

                    {/* ── Customer Protected Routes ── */}
                    {/* Yêu cầu đăng nhập — Guest bị redirect về /login */}
                    <Route
                        path="/checkout"
                        element={<PrivateRoute><Checkout /></PrivateRoute>}
                    />
                    <Route
                        path="/order-success/:id"
                        element={<PrivateRoute><OrderSuccess /></PrivateRoute>}
                    />
                    <Route
                        path="/profile"
                        element={<PrivateRoute><Account /></PrivateRoute>}
                    />
                    <Route
                        path="/orders"
                        element={<PrivateRoute><Account /></PrivateRoute>}
                    />
                    <Route
                        path="/account"
                        element={<PrivateRoute><Account /></PrivateRoute>}
                    />
                    {/* ── Auth & Payment Flow Pages ── */}
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/payment/vnpay-return" element={<VnPayReturn />} />

                    {/* ── Admin Only Pages (chỉ admin) ── */}
                    {/* Dashboard — Mọi nhân viên nội bộ đếu vào được */}
                    <Route path="/admin" element={<InternalRoute><Dashboard /></InternalRoute>} />

                    {/* Products — Admin + Warehouse */}
                    <Route path="/admin/products" element={<StaffRoute><AdminProducts /></StaffRoute>} />

                    {/* Categories — Admin + Warehouse */}
                    <Route path="/admin/categories" element={<StaffRoute><AdminCategories /></StaffRoute>} />

                    {/* Brands — Chỉ Admin */}
                    <Route path="/admin/brands" element={<AdminRoute><Brands /></AdminRoute>} />

                    {/* Orders — Admin + Sale */}
                    <Route path="/admin/orders" element={<StaffRoute><AdminOrders /></StaffRoute>} />

                    {/* Customers — Admin + Sale */}
                    <Route path="/admin/customers" element={<StaffRoute><AdminCustomers /></StaffRoute>} />
                    <Route path="/admin/users" element={<StaffRoute><AdminCustomers /></StaffRoute>} />

                    {/* Staff Management — Chỉ Admin */}
                    <Route path="/admin/staff" element={<AdminRoute><AdminStaff /></AdminRoute>} />

                    {/* Promotions/Coupons — Chỉ Admin */}
                    <Route path="/admin/coupons" element={<AdminRoute><Promotions /></AdminRoute>} />
                    <Route path="/admin/promotions" element={<AdminRoute><Promotions /></AdminRoute>} />

                    {/* Reviews — Admin + Sale */}
                    <Route path="/admin/reviews" element={<StaffRoute><Reviews /></StaffRoute>} />

                    {/* Collections — Chỉ Admin */}
                    <Route path="/admin/collections" element={<AdminRoute><Collections /></AdminRoute>} />

                    {/* Settings — Chỉ Admin */}
                    <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />

                    {/* ── 404 ── */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default AppRoutes;