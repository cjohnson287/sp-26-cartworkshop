import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import type { ProductResponse } from "../types/product";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: ProductResponse;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { dispatch } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
      },
    });
  };

  return (
    <div className={styles.card}>
      <Link to={`/products/${product.id}`} className={styles.link}>
        <div className={styles.imageWrapper}>
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name ?? "Product"}
              className={styles.image}
            />
          ) : (
            <div className={styles.placeholder}>
              <span>📦</span>
            </div>
          )}
        </div>
        <div className={styles.body}>
          <span className={styles.category}>{product.categoryName}</span>
          <h3 className={styles.name}>{product.name}</h3>
          <p className={styles.price}>${product.price.toFixed(2)}</p>
        </div>
      </Link>
      <button
        className={styles.addButton}
        onClick={handleAddToCart}
        aria-label={`Add ${product.name} to cart`}
      >
        Add to Cart
      </button>
    </div>
  );
}
