import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { API_URL, UPLOADS_URL } from "../../config/api";

function OrderSuccess() {
    const { id } = useParams();
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/api/orders/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setOrderData(data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Fetch order error:", err);
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return (
            <>
                <Header />
                <div style={{ textAlign: "center", padding: "80px 20px" }}>
                    <h2>Đang tải thông tin đơn hàng...</h2>
                </div>
                <Footer />
            </>
        );
    }

    if (!orderData || !orderData.order) {
        return (
            <>
                <Header />
                <div style={{ textAlign: "center", padding: "80px 20px" }}>
                    <h2>Không tìm thấy thông tin đơn hàng.</h2>
                    <Link to="/products" style={{ marginTop: "20px", display: "inline-block", padding: "12px 24px", backgroundColor: "#111", color: "#fff", textDecoration: "none", borderRadius: "4px" }}>
                        Khám phá sản phẩm
                    </Link>
                </div>
                <Footer />
            </>
        );
    }

    const { order, items } = orderData;

    return (
        <>
            <Header />
            <div style={{ backgroundColor: "#f8f9fa", minHeight: "80vh", padding: "40px 20px" }}>
                <div style={{ maxWidth: "800px", margin: "0 auto", backgroundColor: "#fff", padding: "40px", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
                    
                    {/* TOP HEADER */}
                    <div style={{ textAlign: "center", marginBottom: "30px" }}>
                        <div style={{ width: "64px", height: "64px", backgroundColor: "#e6f4ea", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 15px", color: "#137333", fontSize: "32px" }}>
                            ✓
                        </div>
                        <h1 style={{ fontSize: "28px", margin: "0 0 10px", color: "#111" }}>Cảm ơn bạn đã đặt hàng!</h1>
                        <p style={{ color: "#666", fontSize: "15px" }}>
                            Đơn hàng của bạn <strong style={{ color: "#111" }}>#LX-{order.id}</strong> đã được hệ thống tiếp nhận và đang xử lý.
                        </p>
                    </div>

                    {/* CUSTOMER & SHIPPING INFO */}
                    <div style={{ backgroundColor: "#fafafa", padding: "20px", borderRadius: "8px", marginBottom: "30px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div>
                            <h4 style={{ margin: "0 0 10px", textTransform: "uppercase", fontSize: "12px", letterSpacing: "1px", color: "#888" }}>Thông tin khách hàng</h4>
                            <p style={{ margin: "4px 0", fontWeight: "600" }}>{order.fullname}</p>
                            <p style={{ margin: "4px 0", color: "#555" }}>SĐT: {order.phone}</p>
                            <p style={{ margin: "4px 0", color: "#555" }}>Phương thức: {order.payment_method?.toUpperCase()}</p>
                        </div>
                        <div>
                            <h4 style={{ margin: "0 0 10px", textTransform: "uppercase", fontSize: "12px", letterSpacing: "1px", color: "#888" }}>Địa chỉ giao hàng</h4>
                            <p style={{ margin: "4px 0", color: "#333", lineHeight: "1.5" }}>{order.address}</p>
                            <p style={{ margin: "4px 0", color: "#888", fontSize: "13px" }}>
                                Ngày đặt: {new Date(order.created_at).toLocaleString("vi-VN")}
                            </p>
                        </div>
                    </div>

                    {/* ORDER ITEMS TABLE */}
                    <h3 style={{ fontSize: "18px", marginBottom: "15px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>Chi tiết sản phẩm</h3>
                    <div style={{ marginBottom: "30px" }}>
                        {items.map(item => (
                            <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f0f0f0" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                    <img 
                                        src={`${UPLOADS_URL}/${item.image_url}`} 
                                        alt={item.name} 
                                        style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "6px", backgroundColor: "#eee" }} 
                                    />
                                    <div>
                                        <h4 style={{ margin: "0 0 4px", fontSize: "15px" }}>{item.name}</h4>
                                        <p style={{ margin: "0", fontSize: "13px", color: "#666" }}>
                                            {item.color_name && `Màu: ${item.color_name}`} {item.size_name && `| Size: ${item.size_name}`} | SL: x{item.quantity}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ fontWeight: "600", fontSize: "15px" }}>
                                    {(Number(item.price) * Number(item.quantity)).toLocaleString("vi-VN")}₫
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* TOTAL */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 0", borderTop: "2px solid #111", fontSize: "18px", fontWeight: "700" }}>
                        <span>Tổng thanh toán</span>
                        <span style={{ color: "#d9534f" }}>{Number(order.total_price).toLocaleString("vi-VN")}₫</span>
                    </div>

                    {/* BUTTON */}
                    <div style={{ textAlign: "center", marginTop: "35px" }}>
                        <Link 
                            to="/products" 
                            style={{ 
                                padding: "14px 36px", 
                                backgroundColor: "#111", 
                                color: "#fff", 
                                textDecoration: "none", 
                                fontWeight: "600", 
                                borderRadius: "6px", 
                                letterSpacing: "1px", 
                                textTransform: "uppercase", 
                                fontSize: "13px" 
                            }}
                        >
                            Tiếp tục mua sắm
                        </Link>
                    </div>

                </div>
            </div>
            <Footer />
        </>
    );
}

export default OrderSuccess;
