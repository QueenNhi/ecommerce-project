import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import { API_URL } from "../../config/api";

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchParams] = useSearchParams();

    // Đọc query params từ URL
    const searchQuery = searchParams.get("search") || "";
    const brandFilter = searchParams.get("brand") || "";

    useEffect(() => {
        setLoading(true);
        setError("");

        fetch(`${API_URL}/api/products/all`)
            .then((res) => {
                if (!res.ok) throw new Error("Không lấy được sản phẩm");
                return res.json();
            })
            .then((data) => {
                // Backend /api/products/all trả về mảng trực tiếp
                const productList = Array.isArray(data) ? data :
                    (data?.products || data?.data || []);
                setProducts(productList);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    // Lọc theo search và brand từ URL params
    const filteredProducts = products.filter((product) => {
        if (searchQuery && !product.name?.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        if (brandFilter && String(product.brand_id) !== String(brandFilter)) {
            return false;
        }
        return true;
    });

    const pageTitle = searchQuery
        ? `Kết quả tìm kiếm: "${searchQuery}"`
        : brandFilter
            ? "Sản phẩm theo thương hiệu"
            : "Tất cả sản phẩm";

    return (
        <>
            <Header />

            <main className="main" style={{ minHeight: "60vh", padding: "40px 20px" }}>

                <div className="section-title">
                    <h2>{pageTitle}</h2>
                    {(searchQuery || brandFilter) && (
                        <span style={{ fontSize: "14px", color: "#64748b" }}>
                            Tìm thấy <strong>{filteredProducts.length}</strong> sản phẩm
                        </span>
                    )}
                </div>

                {loading && (
                    <p className="message" style={{ textAlign: "center", color: "#64748b" }}>
                        Đang tải sản phẩm...
                    </p>
                )}

                {error && (
                    <p className="error" style={{ textAlign: "center", color: "#dc2626" }}>
                        ⚠️ {error}
                    </p>
                )}

                {!loading && !error && filteredProducts.length === 0 && (
                    <p className="message" style={{ textAlign: "center", color: "#64748b", padding: "60px 0" }}>
                        {searchQuery
                            ? `Không tìm thấy sản phẩm nào cho "${searchQuery}".`
                            : "Không có sản phẩm nào."}
                    </p>
                )}

                {!loading && !error && filteredProducts.length > 0 && (
                    <div className="product-grid">
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                            />
                        ))}
                    </div>
                )}

            </main>

            <Footer />
        </>
    );
};

export default Products;