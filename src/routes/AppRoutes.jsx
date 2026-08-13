import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "../context/AuthContext";

import ScrollToTop from "../components/ScrollToTop";
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
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";
import Brands from "../pages/Admin/Brands/Brands";
import AdminOrders from "../pages/Admin/Orders";
import Promotions from "../pages/Admin/Promotions";
import Reviews from "../pages/Admin/Reviews";
import AdminCustomers from "../pages/Admin/Users";
import AdminSettings from "../pages/Admin/Settings";
import Collections from "../pages/Admin/Collections";

// Client Pages
import Offers from "../pages/Offers/Offers";
import BrandsPage from "../pages/Brands/BrandsPage";
import Account from "../pages/Account/Account";

import NotFound from "../pages/NotFound/NotFound";
import OrderSuccess from "../pages/OrderSuccess/OrderSuccess";
import OrderDetail from "../pages/OrderDetail/OrderDetail";



const AdminRoute = ({ children }) => {
    const { user } = useAuth();

    let currentUser = user;
    if (!currentUser) {
        try {
            const saved = localStorage.getItem("user");
            if (saved) currentUser = JSON.parse(saved);
        } catch (e) {
            console.error("Error reading fallback user from localStorage:", e);
        }
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    const roleStr = currentUser?.role ? String(currentUser.role).toLowerCase() : "";
    const isAdmin = currentUser?.isAdmin || currentUser?.is_admin || roleStr === "admin" || roleStr === "manager";

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
};

function AppRoutes() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <ScrollToTop />
                <Routes>
                    {/* Trang chủ */}
                    <Route path="/" element={<App />} />

                    {/* Client Pages & Products */}
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/products" element={<Products />} />

                    {/* Quản lý danh mục (Đã bổ sung route theo ID để tránh lỗi điều hướng) */}
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/categories/:id" element={<Categories />} />

                    <Route path="/offers" element={<Offers />} />
                    <Route path="/promotions" element={<Offers />} />
                    <Route path="/brands" element={<BrandsPage />} />
                    <Route path="/profile" element={<Account />} />
                    <Route path="/orders" element={<Account />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order-success/:id" element={<OrderSuccess />} />

                    {/* Auth Pages */}
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                    <Route path="/dat-lai-mat-khau" element={<ResetPassword />} />
                    <Route path="/dat-lai-mat-khau/:token" element={<ResetPassword />} />

                    {/* Admin Pages (Protected) */}
                    <Route path="/admin" element={<AdminRoute><Dashboard /></AdminRoute>} />
                    <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
                    <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
                    <Route path="/admin/promotions" element={<AdminRoute><Promotions /></AdminRoute>} />
                    <Route path="/admin/coupons" element={<AdminRoute><Promotions /></AdminRoute>} />
                    <Route path="/admin/reviews" element={<AdminRoute><Reviews /></AdminRoute>} />
                    <Route path="/admin/customers" element={<AdminRoute><AdminCustomers /></AdminRoute>} />
                    <Route path="/admin/users" element={<AdminRoute><AdminCustomers /></AdminRoute>} />
                    <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
                    <Route path="/admin/collections" element={<AdminRoute><Collections /></AdminRoute>} />
                    <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
                    <Route path="/admin/brands" element={<AdminRoute><Brands /></AdminRoute>} />

                    {/* 404 Not Found */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default AppRoutes;