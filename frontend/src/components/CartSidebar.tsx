import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import styles from './CartSidebar.module.css';

export default function CartSidebar() {
  const navigate = useNavigate();
  const { state, dispatch } = useCart();

  if (!state.isOpen) return null;

  const total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    dispatch({ type: 'TOGGLE_CART' });
    navigate('/checkout');
  };

  return (
    <div className={styles.overlay} onClick={() => dispatch({ type: 'TOGGLE_CART' })}>
      <div className={styles.sidebar} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Shopping Cart</h2>
          <button
            className={styles.closeButton}
            onClick={() => dispatch({ type: 'TOGGLE_CART' })}
            aria-label="Close cart"
          >
            ×
          </button>
        </div>
        <div className={styles.items}>
          {state.items.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            state.items.map((item) => (
              <div key={item.productId} className={styles.item}>
                <div className={styles.itemInfo}>
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.productName} className={styles.itemImage} />
                  )}
                  <div>
                    <h4>{item.productName}</h4>
                    <p>${item.price.toFixed(2)}</p>
                  </div>
                </div>
                <div className={styles.quantityControls}>
                  <button
                    onClick={() =>
                      dispatch({
                        type: 'UPDATE_QUANTITY',
                        payload: { productId: item.productId, quantity: item.quantity - 1 },
                      })
                    }
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() =>
                      dispatch({
                        type: 'UPDATE_QUANTITY',
                        payload: { productId: item.productId, quantity: item.quantity + 1 },
                      })
                    }
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <button
                  className={styles.removeButton}
                  onClick={() =>
                    dispatch({ type: 'REMOVE_FROM_CART', payload: { productId: item.productId } })
                  }
                  aria-label="Remove item"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
        {state.items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.total}>
              <strong>Total: ${total.toFixed(2)}</strong>
            </div>
            <button
              className={styles.clearButton}
              onClick={() => dispatch({ type: 'CLEAR_CART' })}
            >
              Clear Cart
            </button>
            <button className={styles.checkoutButton} onClick={handleCheckout}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}