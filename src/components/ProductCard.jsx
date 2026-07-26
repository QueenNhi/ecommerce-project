import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {

  const imageUrl = product.image_url
    ? `http://localhost:5000/uploads/${product.image_url}`
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