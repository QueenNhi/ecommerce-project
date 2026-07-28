import { Link } from "react-router-dom";
import { UPLOADS_URL } from "../config/api";

const ProductCard = ({ product }) => {

  const imageUrl = product.image_url
    ? `${UPLOADS_URL}/${product.image_url}`
    : "https://placehold.co/500x700";

  return (

    <Link
      to={`/product/${product.id}`}
      className="product-card"
    >

      <div className="product-image">

        <img
          src={imageUrl}
          alt={product.name}
          className="product-img"
        />

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

        <button
          className="buy-btn"
          onClick={(e) => e.preventDefault()}
        >
          Mua ngay
        </button>

      </div>

    </Link>

  );

};

export default ProductCard;