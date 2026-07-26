import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "../../css/Offers.css";

const Offers = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState("");

    const fetchPromotions = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/admin/promotions");
            const data = await res.json();
            if (data.success && Array.isArray(data.promotions)) {
                setPromotions(data.promotions.filter(p => p.status === "active"));
            }
        } catch (err) {
            console.error("Fetch promotions error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code).catch(() => {
            // Fallback nếu clipboard API không được hỗ trợ
            const el = document.createElement("textarea");
            el.value = code;
            document.body.appendChild(el);
            el.select();
            document.execCommand("copy");
            document.body.removeChild(el);
        });
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(""), 3000);
    };


    return (
        <div className="offers-page">
            <Header />

            {/* BANNER */}
            <div className="offers-banner">
                <h1>Ưu Đãi & Mã Giảm Giá Độc Quyền</h1>
                <p>Khám phá các mã voucher quà tặng và chương trình khuyến mãi đặc biệt dành riêng cho tín đồ túi xách cao cấp Heritage.</p>
            </div>

            {/* CONTAINER */}
            <div className="offers-container">
                {loading ? (
                    <div style={{ textAlign: "center", color: "#64748b", padding: "60px" }}>
                        Đang tải danh sách ưu đãi...
                    </div>
                ) : promotions.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#64748b", padding: "60px" }}>
                        Chưa có chương trình ưu đãi nào đang diễn ra.
                    </div>
                ) : (
                    <div className="offers-grid">
                        {promotions.map(promo => (
                            <div key={promo.id} className="offer-card">
                                <div>
                                    <div style={{ fontSize: "12px", color: "#2563eb", fontWeight: "700", textTransform: "uppercase", marginBottom: "6px" }}>
                                        MÃ ƯU ĐÃI VIP
                                    </div>
                                    <h3 style={{ margin: "0 0 8px", fontSize: "20px", color: "#0f172a" }}>
                                        {promo.discount_percent > 0
                                            ? `Giảm ${promo.discount_percent}% Cho Đơn Hàng`
                                            : `Giảm ${Number(promo.discount_amount).toLocaleString("vi-VN")}₫`}
                                    </h3>
                                    <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
                                        Đơn hàng từ {Number(promo.min_order_amount).toLocaleString("vi-VN")}₫.
                                        {promo.expiration_date && ` Hạn dùng: ${new Date(promo.expiration_date).toLocaleDateString("vi-VN")}`}
                                    </p>
                                </div>

                                <div className="offer-code-box">
                                    <code>{promo.code}</code>
                                    <button
                                        className="copy-btn"
                                        onClick={() => handleCopy(promo.code)}
                                    >
                                        {copiedCode === promo.code ? "Đã chép ✓" : "Lưu mã"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default Offers;
