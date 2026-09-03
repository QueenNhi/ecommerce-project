import { Link } from "react-router-dom";
import { UPLOADS_URL } from "../config/api";

const ProductCard = ({ product }) => {

  const imageUrl = product.image_url
    ? `${UPLOADS_URL}/${product.image_url}`
    : "https://placehold.co/500x700";

  const stock = Number(product.stock_quantity) || 0;
  const isOutOfStock = stock <= 0 || product.status === "Out of Stock";
  const isLowStock = !isOutOfStock && stock <= 10;

  return (

    <Link
      to={`/product/${product.id}`}
      className={`product-card${isOutOfStock ? " product-card--out-of-stock" : ""}`}
    >

      <div className="product-image">

        <img
          src={imageUrl}
          alt={product.name}
          className="product-img"
        />

        {/* Badge tồn kho */}
        {isOutOfStock && (
          <span className="stock-badge stock-badge--out">
            Hết hàng
          </span>
        )}
        {isLowStock && (
          <span className="stock-badge stock-badge--low">
            Sắp hết
          </span>
        )}

      </div>

      <div className="product-info">

        <div className="brand">
          Luxury Collection
        </div>

        <h3 className="product-title">
          {product.name}
        </h3>

        <div className="product-price">
          {Number(product.price).toLocaleString()} VNĐ
        </div>

        {/* Trạng thái tồn kho */}
        <div className={`stock-status${isOutOfStock ? " out" : isLowStock ? " low" : " ok"}`}>
          {isOutOfStock
            ? "Hết hàng"
            : isLowStock
              ? `Còn ${stock} sản phẩm`
              : `Còn hàng`}
        </div>

        <button
          className={`buy-btn${isOutOfStock ? " buy-btn--disabled" : ""}`}
          onClick={(e) => e.preventDefault()}
          disabled={isOutOfStock}
          title={isOutOfStock ? "Sản phẩm đã hết hàng" : "Mua ngay"}
        >
          {isOutOfStock ? "Hết hàng" : "Mua ngay"}
        </button>

      </div>

    </Link>

  );

};

export default ProductCard;