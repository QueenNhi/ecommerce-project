import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import { API_URL } from "../../config/api";
import "./Categories.css";

const Categories = () => {

    const [products, setProducts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [selectedPrice, setSelectedPrice] = useState("");
    const [selectedColor, setSelectedColor] = useState("");

    useEffect(() => {
        setLoading(true);

        Promise.all([
            fetch(`${API_URL}/api/products/all`).then(res => res.json()),
            fetch(`${API_URL}/api/brands`).then(res => res.json()),
            fetch(`${API_URL}/api/categories`).then(res => res.json())
        ])
            .then(([productData, brandData, categoryData]) => {

                // /api/products/all trả về mảng trực tiếp
                const productList = Array.isArray(productData) ? productData :
                    (productData?.products || productData?.data || []);
                setProducts(productList);

                // /api/brands trả về { success: true, brands: [...] }
                if (brandData?.success && Array.isArray(brandData?.brands)) {
                    setBrands(brandData.brands);
                } else if (Array.isArray(brandData)) {
                    setBrands(brandData);
                } else {
                    setBrands([]);
                }

                // /api/categories trả về mảng trực tiếp
                const categoryList = Array.isArray(categoryData) ? categoryData :
                    (categoryData?.categories || []);
                setCategories(categoryList);

            })
            .catch(err => console.error("Categories fetch error:", err))
            .finally(() => setLoading(false));

    }, []);


    const filteredProducts = products.filter(product => {

        // Category
        if (
            selectedCategory !== "" &&
            Number(product.category_id) !== Number(selectedCategory)
        ) {
            return false;
        }

        // Brand
        if (
            selectedBrands.length > 0 &&
            !selectedBrands.includes(Number(product.brand_id))
        ) {
            return false;
        }

        // Price
        const price = Number(product.price);

        // Dưới 1 triệu
        if (selectedPrice === "low" && price >= 1000000) return false;

        // 1 - 50 triệu (>= 1 triệu và <= 50 triệu)
        if (selectedPrice === "mid" && (price < 1000000 || price > 50000000)) return false;

        // Trên 50 triệu
        if (selectedPrice === "high" && price <= 50000000) return false;

        // Color
        if (selectedColor !== "" && product.color !== selectedColor) return false;

        return true;

    });

    return (
        <>
            <Header />

            <div className="shop-page">

                <div className="shop-container">

                    {/* Sidebar */}

                    <aside className="shop-sidebar">

                        {/* CATEGORY */}

                        <h3>CATEGORY</h3>

                        <label>

                            <input
                                type="radio"
                                name="category"
                                checked={selectedCategory === ""}
                                onChange={() => setSelectedCategory("")}
                            />

                            All

                        </label>

                        {categories.map(category => (

                            <label key={category.id}>

                                <input
                                    type="radio"
                                    name="category"
                                    checked={
                                        Number(selectedCategory) === Number(category.id)
                                    }
                                    onChange={() =>
                                        setSelectedCategory(category.id)
                                    }
                                />

                                {category.name}

                            </label>

                        ))}

                        <hr />

                        {/* BRAND */}

                        <h3>BRAND</h3>

                        {Array.isArray(brands) && brands.map((brand) => (

                            <label key={brand.id}>

                                <input
                                    type="checkbox"
                                    checked={selectedBrands.includes(Number(brand.id))}
                                    onChange={() => {

                                        if (selectedBrands.includes(Number(brand.id))) {

                                            setSelectedBrands(

                                                selectedBrands.filter(
                                                    id => id !== Number(brand.id)
                                                )

                                            );

                                        } else {

                                            setSelectedBrands([
                                                ...selectedBrands,
                                                Number(brand.id)
                                            ]);

                                        }

                                    }}
                                />

                                {brand.name}

                            </label>

                        ))}

                        <hr />

                        {/* PRICE */}

                        <h3>PRICE</h3>

                        <label>

                            <input
                                type="radio"
                                name="price"
                                checked={selectedPrice === ""}
                                onChange={() => setSelectedPrice("")}
                            />

                            All

                        </label>

                        <label>
    <input
        type="radio"
        name="price"
        checked={selectedPrice === "low"}
        onChange={() => setSelectedPrice("low")}
    />
    Under 1 Million
</label>

<label>
    <input
        type="radio"
        name="price"
        checked={selectedPrice === "mid"}
        onChange={() => setSelectedPrice("mid")}
    />
    1 Million - 50 Million
</label>

<label>
    <input
        type="radio"
        name="price"
        checked={selectedPrice === "high"}
        onChange={() => setSelectedPrice("high")}
    />
    Above 50 Million
</label>
                        <hr />

                        {/* COLOR */}

                        <h3>COLOR</h3>

                        <div className="color-list">

    <span
        className={`blue ${selectedColor === "Blue" ? "active" : ""}`}
        onClick={() =>
            setSelectedColor(selectedColor === "Blue" ? "" : "Blue")
        }
        title="Blue"
    ></span>

    <span
        className={`brown ${selectedColor === "Brown" ? "active" : ""}`}
        onClick={() =>
            setSelectedColor(selectedColor === "Brown" ? "" : "Brown")
        }
        title="Brown"
    ></span>

    <span
        className={`red ${selectedColor === "Red" ? "active" : ""}`}
        onClick={() =>
            setSelectedColor(selectedColor === "Red" ? "" : "Red")
        }
        title="Red"
    ></span>

    <span
        className={`pink ${selectedColor === "Pink" ? "active" : ""}`}
        onClick={() =>
            setSelectedColor(selectedColor === "Pink" ? "" : "Pink")
        }
        title="Pink"
    ></span>

    <span
        className={`white ${selectedColor === "White" ? "active" : ""}`}
        onClick={() =>
            setSelectedColor(selectedColor === "White" ? "" : "White")
        }
        title="White"
    ></span>

    <span
        className={`black ${selectedColor === "Black" ? "active" : ""}`}
        onClick={() =>
            setSelectedColor(selectedColor === "Black" ? "" : "Black")
        }
        title="Black"
    ></span>

</div>
                    </aside>

                    {/* PRODUCT */}

                    <section className="shop-content">

                        <div className="shop-grid">

                            {filteredProducts.length > 0 ? (

                                filteredProducts.map(product => (

                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                    />

                                ))

                            ) : (

                                <div className="no-product">

                                    Không có sản phẩm phù hợp.

                                </div>

                            )}

                        </div>

                    </section>

                </div>

            </div>

            <Footer />

        </>
    );

};

export default Categories;