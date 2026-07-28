import { useEffect, useState, useCallback } from "react";
import AdminLayout from "../../../layouts/AdminLayout";
import { API_URL } from "../../../config/api";
import "../../../css/admin/Staff.css";

// =============================================
// CONSTANTS
// =============================================
const ROLE_LABELS = {
    admin: "Admin",
    sale: "Sale",
    warehouse: "Warehouse",
};

const PAGE_SIZE = 10;

// =============================================
// TOAST HELPER
// =============================================
const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = "success") => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3500);
    }, []);

    return { toasts, showToast };
};

// =============================================
// ROLE BADGE COMPONENT
// =============================================
const RoleBadge = ({ role }) => {
    const r = String(role || "").toLowerCase();
    const label = ROLE_LABELS[r] || role || "—";
    return <span className={`role-badge ${r}`}>{label}</span>;
};

// =============================================
// AVATAR COMPONENT
// =============================================
const StaffAvatar = ({ staff, size = "normal" }) => {
    const initial = (staff.fullname || staff.name || "?").charAt(0).toUpperCase();
    const cls = size === "large" ? "view-staff-avatar-placeholder" : "staff-avatar-placeholder";

    if (staff.avatar || staff.photoURL || staff.photo_url) {
        const imgCls = size === "large" ? "view-staff-avatar" : "staff-avatar";
        return (
            <img
                src={staff.avatar || staff.photoURL || staff.photo_url}
                alt={staff.fullname}
                className={imgCls}
                onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling && (e.target.nextSibling.style.display = "flex");
                }}
            />
        );
    }
    return <div className={cls}>{initial}</div>;
};

// =============================================
// VIEW MODAL
// =============================================
const ViewStaffModal = ({ staff, onClose }) => {
    if (!staff) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="staff-modal-card staff-modal-view"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h3>Chi tiết Nhân viên</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="view-staff-profile">
                        <StaffAvatar staff={staff} size="large" />
                        <div>
                            <p className="view-staff-name">
                                {staff.fullname || staff.name || "—"}
                            </p>
                            <RoleBadge role={staff.role} />
                        </div>
                    </div>

                    {[
                        { label: "ID", value: `#STAFF-${staff.id}` },
                        { label: "Email", value: staff.email || "—" },
                        { label: "Điện thoại", value: staff.phone || "Chưa cập nhật" },
                        {
                            label: "Trạng thái",
                            value: (
                                <span className={`staff-status-badge ${staff.status === "active" ? "active" : "inactive"}`}>
                                    {staff.status === "active" ? "Active" : "Inactive"}
                                </span>
                            ),
                        },
                        {
                            label: "Ngày tạo",
                            value: staff.created_at
                                ? new Date(staff.created_at).toLocaleDateString("vi-VN")
                                : "N/A",
                        },
                    ].map((row, i) => (
                        <div className="view-detail-row" key={i}>
                            <span className="view-detail-label">{row.label}</span>
                            <span className="view-detail-value">{row.value}</span>
                        </div>
                    ))}
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Đóng</button>
                </div>
            </div>
        </div>
    );
};

// =============================================
// ADD STAFF MODAL
// =============================================
const AddStaffModal = ({ onClose, onSuccess, showToast }) => {
    const [form, setForm] = useState({
        fullname: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: "sale",
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const validate = () => {
        const errs = {};
        if (!form.fullname.trim()) errs.fullname = "Vui lòng nhập họ tên.";
        if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
            errs.email = "Email không hợp lệ.";
        if (!form.password || form.password.length < 6)
            errs.password = "Mật khẩu tối thiểu 6 ký tự.";
        if (form.password !== form.confirmPassword)
            errs.confirmPassword = "Mật khẩu xác nhận không khớp.";
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/staff`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullname: form.fullname.trim(),
                    email: form.email.trim().toLowerCase(),
                    phone: form.phone.trim(),
                    password: form.password,
                    role: form.role,
                    status: "active",
                }),
            });
            const data = await res.json();

            if (res.ok && data.success) {
                showToast("✅ Thêm nhân viên thành công!", "success");
                onSuccess();
                onClose();
            } else {
                showToast(data.message || "Lỗi khi thêm nhân viên.", "error");
            }
        } catch (err) {
            console.error("Add staff error:", err);
            showToast("Không thể kết nối server.", "error");
        } finally {
            setSaving(false);
        }
    };

    const set = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
        setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="staff-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>+ Thêm nhân viên mới</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">

                        <div className="form-group">
                            <label>Họ và tên *</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Nguyễn Văn A"
                                value={form.fullname}
                                onChange={set("fullname")}
                            />
                            {errors.fullname && <p className="form-error">{errors.fullname}</p>}
                        </div>

                        <div className="form-group">
                            <label>Email *</label>
                            <input
                                type="email"
                                className="form-control"
                                placeholder="staff@company.com"
                                value={form.email}
                                onChange={set("email")}
                            />
                            {errors.email && <p className="form-error">{errors.email}</p>}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Số điện thoại</label>
                                <input
                                    type="tel"
                                    className="form-control"
                                    placeholder="0901234567"
                                    value={form.phone}
                                    onChange={set("phone")}
                                />
                            </div>
                            <div className="form-group">
                                <label>Vai trò *</label>
                                <select
                                    className="form-control"
                                    value={form.role}
                                    onChange={set("role")}
                                >
                                    <option value="admin">Admin</option>
                                    <option value="sale">Sale</option>
                                    <option value="warehouse">Warehouse</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Mật khẩu *</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="Tối thiểu 6 ký tự"
                                    value={form.password}
                                    onChange={set("password")}
                                />
                                {errors.password && <p className="form-error">{errors.password}</p>}
                            </div>
                            <div className="form-group">
                                <label>Xác nhận mật khẩu *</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="Nhập lại mật khẩu"
                                    value={form.confirmPassword}
                                    onChange={set("confirmPassword")}
                                />
                                {errors.confirmPassword && (
                                    <p className="form-error">{errors.confirmPassword}</p>
                                )}
                            </div>
                        </div>

                        <p className="form-hint">
                            💡 Trạng thái mặc định: <strong>Active</strong>. Password sẽ được mã hóa tự động phía server.
                        </p>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Hủy
                        </button>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? "Đang lưu..." : "Lưu nhân viên"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// =============================================
// EDIT STAFF MODAL
// =============================================
const EditStaffModal = ({ staff, onClose, onSuccess, showToast }) => {
    const [form, setForm] = useState({
        fullname: staff.fullname || staff.name || "",
        phone: staff.phone || "",
        role: String(staff.role || "sale").toLowerCase(),
        status: staff.status || "active",
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const validate = () => {
        const errs = {};
        if (!form.fullname.trim()) errs.fullname = "Vui lòng nhập họ tên.";
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/staff/${staff.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullname: form.fullname.trim(),
                    phone: form.phone.trim(),
                    role: form.role,
                    status: form.status,
                }),
            });
            const data = await res.json();

            if (res.ok && data.success) {
                showToast("✅ Cập nhật nhân viên thành công!", "success");
                onSuccess();
                onClose();
            } else {
                showToast(data.message || "Lỗi cập nhật.", "error");
            }
        } catch (err) {
            console.error("Edit staff error:", err);
            showToast("Không thể kết nối server.", "error");
        } finally {
            setSaving(false);
        }
    };

    const set = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
        setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="staff-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>✏️ Chỉnh sửa nhân viên</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">

                        <div className="form-group">
                            <label>Họ và tên *</label>
                            <input
                                type="text"
                                className="form-control"
                                value={form.fullname}
                                onChange={set("fullname")}
                            />
                            {errors.fullname && <p className="form-error">{errors.fullname}</p>}
                        </div>

                        <div className="form-group">
                            <label>Email (không thể thay đổi)</label>
                            <input
                                type="email"
                                className="form-control"
                                value={staff.email}
                                disabled
                            />
                            <p className="form-hint">Email không thể chỉnh sửa sau khi tạo.</p>
                        </div>

                        <div className="form-group">
                            <label>Số điện thoại</label>
                            <input
                                type="tel"
                                className="form-control"
                                placeholder="0901234567"
                                value={form.phone}
                                onChange={set("phone")}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Vai trò *</label>
                                <select
                                    className="form-control"
                                    value={form.role}
                                    onChange={set("role")}
                                >
                                    <option value="admin">Admin</option>
                                    <option value="sale">Sale</option>
                                    <option value="warehouse">Warehouse</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Trạng thái</label>
                                <select
                                    className="form-control"
                                    value={form.status}
                                    onChange={set("status")}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Hủy
                        </button>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// =============================================
// DELETE CONFIRM MODAL
// =============================================
const DeleteStaffModal = ({ staff, onClose, onSuccess, showToast }) => {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/staff/${staff.id}`, {
                method: "DELETE",
            });
            const data = await res.json();

            if (res.ok && data.success) {
                showToast("🗑️ Đã xóa nhân viên thành công.", "success");
                onSuccess();
                onClose();
            } else {
                showToast(data.message || "Lỗi xóa nhân viên.", "error");
            }
        } catch (err) {
            console.error("Delete staff error:", err);
            showToast("Không thể kết nối server.", "error");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="staff-modal-card staff-modal-sm"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h3>Xác nhận xóa</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <p style={{ fontSize: "14px", color: "#334155", lineHeight: "1.6" }}>
                        Bạn có chắc chắn muốn xóa tài khoản nhân viên{" "}
                        <strong>"{staff.fullname || staff.name}"</strong> (
                        <em>{staff.email}</em>)?
                        <br />
                        <span style={{ color: "#dc2626", fontWeight: 600 }}>
                            Hành động này không thể hoàn tác!
                        </span>
                    </p>
                </div>

                <div className="modal-footer">
                    <button
                        className="btn-secondary"
                        onClick={onClose}
                        disabled={deleting}
                    >
                        Hủy
                    </button>
                    <button
                        className="btn-danger"
                        onClick={handleDelete}
                        disabled={deleting}
                    >
                        {deleting ? "Đang xóa..." : "Xóa vĩnh viễn"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// =============================================
// RESET PASSWORD MODAL
// =============================================
const ResetPasswordModal = ({ staff, onClose, showToast }) => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = {};
        if (!newPassword || newPassword.length < 6)
            errs.newPassword = "Mật khẩu tối thiểu 6 ký tự.";
        if (newPassword !== confirmPassword)
            errs.confirmPassword = "Mật khẩu xác nhận không khớp.";

        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(
                `${API_URL}/api/admin/staff/${staff.id}/reset-password`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ password: newPassword }),
                }
            );
            const data = await res.json();

            if (res.ok && data.success) {
                showToast("🔑 Đặt lại mật khẩu thành công!", "success");
                onClose();
            } else {
                showToast(data.message || "Lỗi đặt lại mật khẩu.", "error");
            }
        } catch (err) {
            console.error("Reset password error:", err);
            showToast("Không thể kết nối server.", "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="staff-modal-card staff-modal-sm"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h3>🔑 Đặt lại mật khẩu</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "16px" }}>
                            Đang đặt lại mật khẩu cho:{" "}
                            <strong>{staff.fullname || staff.name}</strong> ({staff.email})
                        </p>

                        <div className="form-group">
                            <label>Mật khẩu mới *</label>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Tối thiểu 6 ký tự"
                                value={newPassword}
                                onChange={(e) => {
                                    setNewPassword(e.target.value);
                                    setErrors((p) => ({ ...p, newPassword: "" }));
                                }}
                            />
                            {errors.newPassword && (
                                <p className="form-error">{errors.newPassword}</p>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Xác nhận mật khẩu *</label>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Nhập lại mật khẩu mới"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setErrors((p) => ({ ...p, confirmPassword: "" }));
                                }}
                            />
                            {errors.confirmPassword && (
                                <p className="form-error">{errors.confirmPassword}</p>
                            )}
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Hủy
                        </button>
                        <button type="submit" className="btn-warning" disabled={saving}>
                            {saving ? "Đang lưu..." : "Đặt lại mật khẩu"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// =============================================
// MAIN PAGE COMPONENT
// =============================================
const AdminStaff = () => {
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Modal states
    const [modalView, setModalView] = useState(null);       // staff object
    const [modalAdd, setModalAdd] = useState(false);
    const [modalEdit, setModalEdit] = useState(null);       // staff object
    const [modalDelete, setModalDelete] = useState(null);   // staff object
    const [modalReset, setModalReset] = useState(null);     // staff object

    const { toasts, showToast } = useToast();

    // ─── FETCH ─────────────────────────────────────
    const fetchStaff = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/admin/staff`);
            const data = await res.json();

            if (data.success && Array.isArray(data.staff)) {
                setStaffList(data.staff);
            } else if (Array.isArray(data)) {
                setStaffList(data);
            } else {
                setStaffList([]);
            }
        } catch (err) {
            console.error("Fetch staff error:", err);
            showToast("Không thể tải danh sách nhân viên.", "error");
            setStaffList([]);
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchStaff();
    }, [fetchStaff]);

    // ─── TOGGLE STATUS ──────────────────────────────
    const handleToggleStatus = async (staff) => {
        const newStatus = staff.status === "active" ? "inactive" : "active";
        const label = newStatus === "active" ? "Kích hoạt" : "Vô hiệu hóa";

        try {
            const res = await fetch(
                `${API_URL}/api/admin/staff/${staff.id}/status`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: newStatus }),
                }
            );
            const data = await res.json();

            if (res.ok && data.success) {
                showToast(`✅ ${label} tài khoản thành công!`, "success");
                fetchStaff();
            } else {
                showToast(data.message || "Lỗi cập nhật trạng thái.", "error");
            }
        } catch (err) {
            console.error("Toggle status error:", err);
            showToast("Không thể kết nối server.", "error");
        }
    };

    // ─── FILTER & SEARCH ────────────────────────────
    const filtered = staffList.filter((s) => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return true;
        return (
            (s.fullname || s.name || "").toLowerCase().includes(q) ||
            (s.email || "").toLowerCase().includes(q)
        );
    });

    // ─── PAGINATION ─────────────────────────────────
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    // ─── ROLE NORMALIZE ─────────────────────────────
    const getRole = (s) => String(s.role || "").toLowerCase();

    // ─── RENDER ─────────────────────────────────────
    return (
        <AdminLayout>
            <div className="admin-staff-page">

                {/* ── TOAST ───────────────────────────── */}
                <div className="staff-toast-container">
                    {toasts.map((t) => (
                        <div key={t.id} className={`staff-toast ${t.type}`}>
                            {t.message}
                        </div>
                    ))}
                </div>

                {/* ── HEADER ──────────────────────────── */}
                <div className="staff-header">
                    <div>
                        <h1>Staff Management</h1>
                        <p>Quản lý tài khoản nhân viên — Admin, Sale, Warehouse</p>
                    </div>
                </div>

                {/* ── ACTION BAR ──────────────────────── */}
                <div className="staff-action-bar">
                    <input
                        type="text"
                        className="staff-search-input"
                        placeholder="🔍 Tìm theo tên hoặc email..."
                        value={searchQuery}
                        onChange={handleSearch}
                    />

                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <span className="staff-count-label">
                            Hiển thị <strong>{filtered.length}</strong> / {staffList.length} nhân viên
                        </span>
                        <button
                            className="add-staff-btn"
                            onClick={() => setModalAdd(true)}
                        >
                            + Add Staff
                        </button>
                    </div>
                </div>

                {/* ── TABLE CARD ──────────────────────── */}
                <div className="staff-card">

                    {/* Loading */}
                    {loading && (
                        <div className="staff-loading-state">
                            <div className="staff-loading-spinner" />
                            <p>Đang tải danh sách nhân viên...</p>
                        </div>
                    )}

                    {/* Empty */}
                    {!loading && filtered.length === 0 && (
                        <div className="staff-empty-state">
                            <div className="staff-empty-icon">👔</div>
                            <h3>
                                {searchQuery
                                    ? "Không tìm thấy nhân viên phù hợp"
                                    : "Chưa có nhân viên nào"}
                            </h3>
                            <p>
                                {searchQuery
                                    ? `Thử tìm với từ khóa khác.`
                                    : `Bấm "+ Add Staff" để thêm nhân viên đầu tiên.`}
                            </p>
                        </div>
                    )}

                    {/* Table */}
                    {!loading && paginated.length > 0 && (
                        <div className="staff-table-container">
                            <table className="staff-table">
                                <thead>
                                    <tr>
                                        <th>Nhân viên</th>
                                        <th>Email</th>
                                        <th>Điện thoại</th>
                                        <th>Vai trò</th>
                                        <th>Trạng thái</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginated.map((s) => {
                                        const role = getRole(s);
                                        const isActive = s.status === "active";
                                        const canDelete = role !== "admin";

                                        return (
                                            <tr key={s.id}>
                                                {/* Avatar + Name */}
                                                <td>
                                                    <div className="staff-avatar-cell">
                                                        <StaffAvatar staff={s} />
                                                        <div>
                                                            <p className="staff-name">
                                                                {s.fullname || s.name || "—"}
                                                            </p>
                                                            <span className="staff-id-label">
                                                                #STAFF-{s.id}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Email */}
                                                <td style={{ color: "#475569" }}>{s.email || "—"}</td>

                                                {/* Phone */}
                                                <td style={{ color: "#64748b" }}>
                                                    {s.phone || <em style={{ color: "#cbd5e1" }}>—</em>}
                                                </td>

                                                {/* Role */}
                                                <td><RoleBadge role={role} /></td>

                                                {/* Status */}
                                                <td>
                                                    <span className={`staff-status-badge ${isActive ? "active" : "inactive"}`}>
                                                        {isActive ? "Active" : "Inactive"}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td>
                                                    <div className="staff-actions">
                                                        {/* View */}
                                                        <button
                                                            className="btn-view"
                                                            onClick={() => setModalView(s)}
                                                            title="Xem chi tiết"
                                                        >
                                                            View
                                                        </button>

                                                        {/* Edit */}
                                                        <button
                                                            className="btn-edit"
                                                            onClick={() => setModalEdit(s)}
                                                            title="Chỉnh sửa"
                                                        >
                                                            Edit
                                                        </button>

                                                        {/* Reset Password */}
                                                        <button
                                                            className="btn-reset-pwd"
                                                            onClick={() => setModalReset(s)}
                                                            title="Đặt lại mật khẩu"
                                                        >
                                                            Reset Pwd
                                                        </button>

                                                        {/* Toggle Status */}
                                                        <button
                                                            className={`btn-toggle-status ${isActive ? "deactivate" : "activate"}`}
                                                            onClick={() => handleToggleStatus(s)}
                                                            title={isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                                                        >
                                                            {isActive ? "Deactivate" : "Activate"}
                                                        </button>

                                                        {/* Delete — chỉ cho Sale & Warehouse */}
                                                        {canDelete ? (
                                                            <button
                                                                className="btn-delete"
                                                                onClick={() => setModalDelete(s)}
                                                                title="Xóa tài khoản"
                                                            >
                                                                Delete
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className="btn-disabled"
                                                                disabled
                                                                title="Không thể xóa tài khoản Admin"
                                                            >
                                                                Protected
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && filtered.length > PAGE_SIZE && (
                        <div className="staff-pagination">
                            <span className="staff-pagination-info">
                                Trang {safePage} / {totalPages} — {filtered.length} nhân viên
                            </span>
                            <div className="staff-pagination-btns">
                                <button
                                    className="page-btn"
                                    onClick={() => setCurrentPage(1)}
                                    disabled={safePage === 1}
                                    title="Trang đầu"
                                >
                                    «
                                </button>
                                <button
                                    className="page-btn"
                                    onClick={() => setCurrentPage((p) => p - 1)}
                                    disabled={safePage === 1}
                                >
                                    ‹
                                </button>

                                {/* Page numbers */}
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(
                                        (p) =>
                                            p === 1 ||
                                            p === totalPages ||
                                            Math.abs(p - safePage) <= 1
                                    )
                                    .reduce((acc, p, idx, arr) => {
                                        if (idx > 0 && p - arr[idx - 1] > 1) {
                                            acc.push("...");
                                        }
                                        acc.push(p);
                                        return acc;
                                    }, [])
                                    .map((p, i) =>
                                        p === "..." ? (
                                            <span
                                                key={`ellipsis-${i}`}
                                                style={{ padding: "0 4px", color: "#94a3b8" }}
                                            >
                                                …
                                            </span>
                                        ) : (
                                            <button
                                                key={p}
                                                className={`page-btn ${safePage === p ? "active" : ""}`}
                                                onClick={() => setCurrentPage(p)}
                                            >
                                                {p}
                                            </button>
                                        )
                                    )}

                                <button
                                    className="page-btn"
                                    onClick={() => setCurrentPage((p) => p + 1)}
                                    disabled={safePage === totalPages}
                                >
                                    ›
                                </button>
                                <button
                                    className="page-btn"
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={safePage === totalPages}
                                    title="Trang cuối"
                                >
                                    »
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── MODALS ──────────────────────────── */}
                {modalView && (
                    <ViewStaffModal
                        staff={modalView}
                        onClose={() => setModalView(null)}
                    />
                )}

                {modalAdd && (
                    <AddStaffModal
                        onClose={() => setModalAdd(false)}
                        onSuccess={fetchStaff}
                        showToast={showToast}
                    />
                )}

                {modalEdit && (
                    <EditStaffModal
                        staff={modalEdit}
                        onClose={() => setModalEdit(null)}
                        onSuccess={fetchStaff}
                        showToast={showToast}
                    />
                )}

                {modalDelete && (
                    <DeleteStaffModal
                        staff={modalDelete}
                        onClose={() => setModalDelete(null)}
                        onSuccess={fetchStaff}
                        showToast={showToast}
                    />
                )}

                {modalReset && (
                    <ResetPasswordModal
                        staff={modalReset}
                        onClose={() => setModalReset(null)}
                        showToast={showToast}
                    />
                )}

            </div>
        </AdminLayout>
    );
};

export default AdminStaff;
