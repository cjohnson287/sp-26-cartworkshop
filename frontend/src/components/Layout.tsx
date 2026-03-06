import { Link, Outlet } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import CartSidebar from "./CartSidebar";
import styles from "./Layout.module.css";

export default function Layout() {
  const { state, dispatch } = useCart();

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoIcon}>🌰</span>
            <h1 className={styles.title}>Buckeye Marketplace</h1>
          </Link>
          <button
            className={styles.cartButton}
            onClick={() => dispatch({ type: 'TOGGLE_CART' })}
            aria-label="Open cart"
          >
            🛒 ({state.items.length})
          </button>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <CartSidebar />
    </div>
  );
}
