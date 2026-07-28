import { createContext, useContext, useState } from "react";
import { API_URL } from "../config/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem("user");
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (e) {
            console.error("Error parsing saved user:", e);
            return null;
        }
    });

    const [token, setToken] = useState(() => {
        return localStorage.getItem("token") || null;
    });

    const [loading] = useState(false);

    const login = (userData, tokenData) => {
        try {
            localStorage.setItem("user", JSON.stringify(userData));
            if (tokenData) {
                localStorage.setItem("token", tokenData);
            }
        } catch (e) {
            console.error("Error saving user to localStorage:", e);
        }
        setUser(userData);
        setToken(tokenData || null);
    };

    const loginWithGoogle = async (firebaseUser) => {
        let backendUser = null;
        let backendToken = null;

        try {
            const res = await fetch(`${API_URL}/api/auth/google-login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: firebaseUser.email,
                    fullname: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Google User",
                    avatar: firebaseUser.photoURL || "",
                    firebaseUid: firebaseUser.uid
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                backendUser = data.user;
                backendToken = data.token;
            }
        } catch (err) {
            console.error("Backend Google Login Sync error:", err);
        }

        const finalUser = backendUser || {
            id: 1,
            fullname: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Google User",
            email: firebaseUser.email || "",
            avatar: firebaseUser.photoURL || "",
            role: "customer"
        };

        try {
            localStorage.setItem("user", JSON.stringify(finalUser));
            if (backendToken) localStorage.setItem("token", backendToken);
        } catch (e) {
            console.error("Error saving googleUser to localStorage:", e);
        }

        setUser(finalUser);
        setToken(backendToken || null);
        return finalUser;
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        sessionStorage.clear();
    };

    const updateUser = (updatedData) => {
        const newUser = { ...user, ...updatedData };
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
    };

    // =========================================================
    // RBAC Helpers — Tính toán từ user.role (chuẩn hóa)
    // Hỗ trợ: role string ("admin","manager","staff","sales","warehouse","customer")
    //         hoặc boolean flag (isAdmin / is_admin từ backend)
    // =========================================================

    const _roleStr = user?.role ? String(user.role).toLowerCase().trim() : "";

    /** True nếu user là Admin hoặc Manager (toàn quyền hệ thống) */
    const isAdmin = !!(
        user?.isAdmin ||
        user?.is_admin ||
        _roleStr === "admin" ||
        _roleStr === "manager"
    );

    /** True nếu user là nhân viên (bán hàng, kho, CSKH, hoặc staff generic) */
    const isStaff = !isAdmin && !!(
        _roleStr === "staff" ||
        _roleStr === "sale" ||
        _roleStr === "sales" ||
        _roleStr === "warehouse" ||
        _roleStr === "support"
    );

    /** True nếu user là nhân viên bán hàng / CSKH */
    const isSalesStaff = !isAdmin && (
        _roleStr === "sale" ||
        _roleStr === "sales" ||
        _roleStr === "support" ||
        _roleStr === "staff" // generic staff mặc định coi như sales
    );

    /** True nếu user là nhân viên kho */
    const isWarehouseStaff = !isAdmin && _roleStr === "warehouse";

    /** True nếu user là khách hàng đã đăng nhập */
    const isCustomer = !isAdmin && !isStaff && _roleStr === "customer";

    /**
     * True nếu user là nhân viên nội bộ (admin/sale/warehouse)
     * Dùng để guard toàn bộ khu vực /admin
     */
    const isInternalUser = isAdmin || isStaff;

    /**
     * Tên vai trò hiển thị tiếng Việt trên UI
     */
    const roleName = (() => {
        if (isAdmin) return "Quản trị viên";
        if (_roleStr === "manager") return "Quản lý";
        if (_roleStr === "sale" || _roleStr === "sales") return "Nhân viên bán hàng";
        if (_roleStr === "warehouse") return "Nhân viên kho";
        if (_roleStr === "support") return "Nhân viên CSKH";
        if (_roleStr === "staff") return "Nhân viên";
        if (_roleStr === "customer") return "Khách hàng";
        return "Người dùng";
    })();

    /**
     * Kiểm tra user có thuộc một trong các role cho phép không.
     * @param {string[]} roles - Danh sách role string hoặc alias
     * @returns {boolean}
     */
    const hasRole = (roles = []) => {
        if (!user) return false;
        const allowed = roles.map((r) => String(r).toLowerCase().trim());
        if (allowed.includes("admin") && isAdmin) return true;
        if (allowed.includes("staff") && (isStaff || isAdmin)) return true;
        if ((allowed.includes("sales") || allowed.includes("sale")) && (isSalesStaff || isAdmin)) return true;
        if (allowed.includes("warehouse") && (isWarehouseStaff || isAdmin)) return true;
        if (allowed.includes("customer") && isCustomer) return true;
        return allowed.includes(_roleStr);
    };

    return (
        <AuthContext.Provider value={{
            // Core state
            user,
            token,
            loading,
            // Auth actions
            login,
            loginWithGoogle,
            logout,
            updateUser,
            // RBAC helpers
            isAdmin,
            isStaff,
            isSalesStaff,
            isWarehouseStaff,
            isCustomer,
            isInternalUser,
            roleName,
            hasRole,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
