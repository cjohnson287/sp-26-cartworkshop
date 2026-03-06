/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, type ReactNode, useEffect } from 'react';
import type { CartState, CartAction } from '../types/cart';
import { cartReducer, initialCartState } from '../reducers/cartReducer';

interface CartContextType {
  state: CartState;
  dispatch: (action: CartAction) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'buckeye-marketplace-cart';

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart: CartState = JSON.parse(savedCart);
        // Only load if there are items (ignore isOpen state from storage)
        if (parsedCart.items.length > 0) {
          dispatch({ type: 'CLEAR_CART' }); // Clear initial empty state
          parsedCart.items.forEach(item => {
            dispatch({
              type: 'ADD_TO_CART',
              payload: {
                id: item.productId,
                name: item.productName,
                price: item.price,
                imageUrl: item.imageUrl,
              },
            });
            // Set correct quantity if more than 1
            if (item.quantity > 1) {
              dispatch({
                type: 'UPDATE_QUANTITY',
                payload: { productId: item.productId, quantity: item.quantity },
              });
            }
          });
        }
      }
    } catch (error) {
      console.warn('Failed to load cart from localStorage:', error);
    }
  }, []);

  // Save cart to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save cart to localStorage:', error);
    }
  }, [state]);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}